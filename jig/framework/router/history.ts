import {observable, observing} from '../../reactive';
import {JigWindow} from '../../types';

@observable()
export class History {
  @observing()
  private currentUrl: string;

  constructor(private readonly window: JigWindow) {
    this.updateCurrentUrl();

    this.window.history.replaceState(undefined, '', this.getWindowCurrentUrl());
    this.window.addEventListener('popstate', (e) => {
      e.preventDefault();
      this.updateCurrentUrl();
    });
  }

  push(url: string): void {
    this.window.history.pushState(undefined, undefined, url);
    this.currentUrl = url;
  }

  getCurrentUrl(): string {
    return this.currentUrl;
  }

  private updateCurrentUrl(): void {
    this.currentUrl = this.getWindowCurrentUrl();
  }

  private getWindowCurrentUrl(): string {
    return `${this.window.location.pathname}${this.window.location.search}${this.window.location.hash}`;
  }
}
