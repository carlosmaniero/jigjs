import {TransferState} from '../';
import {JigWindow} from '../../../types';

export class TransferStateWriter {
  static TRANSFER_STATE_ID = '__JIG_TRANSFER_STATE__';

  constructor(private readonly window: JigWindow) {

  }

  write(transferState: TransferState): void {
    const script = this.window.document.createElement('script');
    script.setAttribute('id', TransferStateWriter.TRANSFER_STATE_ID);
    script.setAttribute('type', 'application/json');
    script.textContent = JSON.stringify(transferState.flush());
    this.window.document.head.appendChild(script);
  }
}
