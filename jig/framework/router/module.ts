import {History} from './history';
import {JigWindow} from '../../types';
import {RouterOutlet} from './router-outlet';
import {Routes} from './routes';
import {observable, propagate} from '../../reactive';
import {RouterLinkFactory} from './router-link';
import {Navigation} from './navigation';
import {Platform} from '../patform/platform';
import {TransferStateWriter} from '../transfer-state/internals/transfer-state-writer';
import {TransferStateReader} from '../transfer-state/internals/transfer-state-reader';
import {deprecation} from '../../deprecation';

@observable()
export class RouterModule {
  @propagate()
  readonly history: History;
  @propagate()
  readonly routerOutlet: RouterOutlet;
  readonly linkFactory: RouterLinkFactory;
  readonly navigation: Navigation;

  constructor(private readonly window: JigWindow, private readonly platform: Platform, readonly routes?: Routes) {
    if (!this.routes) {
      this.routes = new Routes();
    } else {
      deprecation.moduleRoutesOnConstructor();
    }

    this.history = new History(window);
    this.routerOutlet = new RouterOutlet(this.history, platform, new TransferStateWriter(window), new TransferStateReader(window), this.routes);
    this.navigation = new Navigation(this.routes, this.history);
    this.linkFactory = new RouterLinkFactory(this.navigation, this.routes);
  }
}
