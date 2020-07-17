import {MatchedRouterHandler, RouterHandler, RouterResponse, Routes} from './routes';
import {History} from './history';
import {component, connectedCallback, disconnectedCallback, html, RenderableComponent} from '../../components';
import {Renderable} from '../../template/render';
import {observe, observing} from '../../reactive';
import {Subscription} from '../../events/subject';
import {TransferState} from '../transfer-state';
import {TransferStateWriter} from '../transfer-state/internals/transfer-state-writer';
import {Platform} from '../platform';
import {TransferStateReader} from '../transfer-state/internals/transfer-state-reader';
import {Default404Component} from './internals/default-404-component';


@component()
export class RouterOutlet {
  static ROUTER_OUTLET_TRANSFER_STATE_URL = '__jigjs__transfer_state_url__';

  latestResponse: RouterResponse = null;

  @observing()
  private routeComponent: RenderableComponent;
  @observing()
  private resolved = true;

  private currentProcess = 0;
  private historySubscription: Subscription;

  constructor(
      private readonly history: History,
      private readonly platform: Platform,
      private readonly transferStateWriter: TransferStateWriter,
      private readonly transferStateReader: TransferStateReader,
      private readonly routes: Routes,
  ) {
  }

  render(): Renderable {
    return html`${this.routeComponent}`;
  }

  isResolved(): boolean {
    return this.resolved;
  }

  @connectedCallback()
  private watchHistory(): void {
    this.historySubscription = observe(this.history, () => {
      this.processRouteHandlingForCurrentUrl();
    });
  }

  @connectedCallback()
  private processRouteHandlingForCurrentUrl(): void {
    const process = this.startProcess();
    let handlerFor: MatchedRouterHandler<unknown> = this.routes.handlerFor(this.history.getCurrentUrl());

    if (!handlerFor) {
      handlerFor = new MatchedRouterHandler(this.getRouter404Handler(), this.history.getCurrentUrl(), new RouterResponse(404));
    }

    this.handleMatcherHandler(handlerFor, process)
        .catch((e) => {
          console.error('Router resolved with an error: ', e);
        });
  }

  @disconnectedCallback()
  private stopWatchingHistory(): void {
    this.historySubscription.unsubscribe();
  }

  private startProcess(): number {
    return ++this.currentProcess % 100;
  }


  private getRouter404Handler(): RouterHandler<string> {
    if (this.routes.routerErrorHandler.handle404) {
      return this.routes.routerErrorHandler.handle404;
    }

    return (params, render): void => render(new Default404Component());
  }

  private async handleMatcherHandler(handlerFor: MatchedRouterHandler<unknown>, process: number): Promise<void> {
    this.resolved = false;

    const transferState = this.createTransferState();

    try {
      await handlerFor.resolve((component) => {
        this.renderRouteComponent(process, component);
      }, transferState);
    } catch (e) {
      handlerFor.response.statusCode = 500;
      throw e;
    } finally {
      this.latestResponse = handlerFor.response;
      this.transferStateWriter.write(transferState);
      this.resolved = true;
    }
  }

  private renderRouteComponent(process: number, component: RenderableComponent): void {
    if (this.currentProcess === process) {
      this.routeComponent = component;
    }
  }

  private createTransferState(): TransferState {
    return this.platform.strategy(() => this.browserTransferState(), () => this.emptyTransferState());
  }

  private browserTransferState(): TransferState {
    if (!this.transferStateReader.hasTransferState()) {
      return this.emptyTransferState();
    }

    const transferState = this.transferStateReader.read();

    if (transferState.getState(RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL) !== this.history.getCurrentUrl()) {
      return this.emptyTransferState();
    }

    return transferState;
  }

  private emptyTransferState(): TransferState {
    const transferState = new TransferState();
    transferState.setState(RouterOutlet.ROUTER_OUTLET_TRANSFER_STATE_URL, this.history.getCurrentUrl());
    return transferState;
  }
}
