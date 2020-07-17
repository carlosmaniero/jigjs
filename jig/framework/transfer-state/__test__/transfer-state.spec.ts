import {TransferState} from '../';
import {TransferStateWriter} from '../internals/transfer-state-writer';
import {TransferStateReader} from '../internals/transfer-state-reader';
import {configureJSDOM} from '../../../core/dom';

describe('Transfer State', () => {
  it('writes the content as json into the window', () => {
    const dom = configureJSDOM();
    const transferState = new TransferState();
    const transferStateWriter = new TransferStateWriter(dom.window);

    transferState.setState('my', 'cool stuff');
    transferStateWriter.write(transferState);

    expect(dom.document.getElementById('__JIG_TRANSFER_STATE__').innerHTML).toBe('{"my":"cool stuff"}');
  });

  it('reads the content from the window', () => {
    const dom = configureJSDOM();
    const transferState = new TransferState();
    const transferStateWriter = new TransferStateWriter(dom.window);
    const transferStateReader = new TransferStateReader(dom.window);

    transferState.setState('my', 'cool stuff');
    transferStateWriter.write(transferState);

    const transferStateRead = transferStateReader.read();

    expect(transferStateRead.hasState('my')).toBeTruthy();
    expect(transferStateRead.getState('my')).toBe('cool stuff');
  });

  it('removes the object after read', () => {
    const dom = configureJSDOM();
    const transferState = new TransferState();
    const transferStateWriter = new TransferStateWriter(dom.window);
    const transferStateReader = new TransferStateReader(dom.window);

    transferState.setState('my', 'cool stuff');
    transferStateWriter.write(transferState);

    transferStateReader.read();

    expect(transferStateReader.hasTransferState()).toBeFalsy();
  });

  describe('Transfer state callback', () => {
    it('returns the promise result given there is no value for key', (done) => {
      const transferState = new TransferState();
      transferState.fetch<string>('my-key', () => Promise.resolve('hey!'), (err: unknown, value: string) => {
        expect(err).toBeUndefined();
        expect(value).toBe('hey!');
        done();
      });
    });

    it('stores the fetcher result into the transfer state', (done) => {
      const transferState = new TransferState();
      transferState.fetch<string>('my-key', () => Promise.resolve('hey!'), () => {
        expect(transferState.getState('my-key')).toBe('hey!');
        done();
      });
    });

    it('returns the value from cache when given', (done) => {
      const transferState = new TransferState();
      transferState.setState('my-key', 'hey!');

      transferState.fetch<string>('my-key', () => Promise.reject<string>(new Error('la')), (err: unknown, value: string) => {
        expect(err).toBeUndefined();
        expect(value).toBe('hey!');
        done();
      });
    });

    it('returns the error when fetcher fails', (done) => {
      const transferState = new TransferState();
      const error = new Error('la');

      transferState.fetch<string>('my-key', () => Promise.reject<string>(error), (err: unknown, value: string) => {
        expect(err).toBe(error);
        expect(value).toBe(undefined);
        done();
      });
    });
  });
});
