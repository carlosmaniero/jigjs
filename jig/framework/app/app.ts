import {RouterModule} from '../router/module';
import {component, connectedCallback, html} from '../../components';
import {Renderable} from '../../template/render';
import {propagate} from '../../reactive';
import {JigWindow} from '../../types';
import {Platform} from '../platform';
import {RouterResponse} from '../router/routes';

@component()
export class App {
  @propagate()
  readonly routerModule: RouterModule;
  private connected = false;

  constructor(routerModule: RouterModule) {
    this.routerModule = routerModule;
  }

  get latestResponse(): RouterResponse {
    return this.routerModule.routerOutlet.latestResponse;
  }

  render(): Renderable {
    return html`${this.routerModule.routerOutlet}`;
  }

  isInitialRenderFinished(): boolean {
    return this.connected && this.routerModule.routerOutlet.isResolved();
  }

  @connectedCallback()
  private setAsConnected(): void {
    this.connected = true;
  }
}

export type AppFactory = (app: JigWindow, platform: Platform) => App
