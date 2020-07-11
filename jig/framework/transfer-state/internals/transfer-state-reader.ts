import {JigWindow} from '../../../types';
import {TransferState} from '../';
import {TransferStateWriter} from './transfer-state-writer';

export class TransferStateReader {
  constructor(private readonly window: JigWindow) {
  }

  read(): TransferState {
    const script = this.window.document.getElementById(TransferStateWriter.TRANSFER_STATE_ID);
    const transferState = new TransferState(JSON.parse(script.textContent));
    script.remove();
    return transferState;
  }

  hasTransferState(): boolean {
    return !!this.window.document.getElementById(TransferStateWriter.TRANSFER_STATE_ID);
  }
}
