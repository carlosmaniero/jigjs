import {observable, watch} from "../side-effect/observable";

@observable()
export class History {
    @watch()
    private currentUrl;

    constructor(private readonly window) {
        this.updateCurrentUrl();

        this.window.history.replaceState(undefined, '', this.getWindowCurrentUrl());
        this.window.addEventListener('popstate', (e) => {
            e.preventDefault();
            this.updateCurrentUrl();
        });
    }

    push(url: string): void {
        this.currentUrl = url;
        this.window.history.pushState(undefined, undefined, url);
    }

    getCurrentUrl(): string {
        return this.currentUrl
    }

    private updateCurrentUrl(): void {
        this.currentUrl = this.getWindowCurrentUrl();
    }

    private getWindowCurrentUrl(): string {
        return `${this.window.location.pathname}${this.window.location.search}${this.window.location.hash}`;
    }
}
