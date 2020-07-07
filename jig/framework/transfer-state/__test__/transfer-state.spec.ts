import {TransferState} from "../";
import {TransferStateWriter} from "../internals/transfer-state-writer";
import {TransferStateReader} from "../internals/transfer-state-reader";
import {configureJSDOM} from "../../../core/dom";

describe('Transfer State', () => {
    it('writes the content as json into the window', () => {
        const dom = configureJSDOM();
        const transferState = new TransferState();
        const transferStateWriter = new TransferStateWriter(dom.window);

        transferState.setState('my', 'cool stuff');
        transferStateWriter.write(transferState);

        expect(dom.document.getElementById('__JIG_TRANSFER_STATE__').innerHTML).toBe(`{"my":"cool stuff"}`);
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
});
