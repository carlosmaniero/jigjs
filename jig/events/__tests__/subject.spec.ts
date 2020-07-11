import {Subject} from '../subject';

describe('Subject', () => {
  it('calls all the listeners', () => {
    const subject = new Subject<string>();

    const mock1 = jest.fn();
    const mock2 = jest.fn();

    subject.subscribe(mock1);
    subject.subscribe(mock2);

    subject.publish('hello!');

    expect(mock1).toBeCalledWith('hello!');
    expect(mock2).toBeCalledWith('hello!');
  });

  it('unsubscribes', () => {
    const subject = new Subject<string>();

    const mock1 = jest.fn();
    const mock2 = jest.fn();

    subject.subscribe(mock1).unsubscribe();
    subject.subscribe(mock2);

    subject.publish('hello!');

    expect(mock1).not.toBeCalled();
    expect(mock2).toBeCalledWith('hello!');
  });
});
