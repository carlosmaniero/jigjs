import {Inject, Injectable} from "../../core/di";
import {DocumentInjectionToken} from "../../core/dom";
import {RehydrateService} from "../component";


@Injectable([RehydrateService])
export class BrowserRehydrateService implements RehydrateService {
    constructor(@Inject(DocumentInjectionToken) private readonly document) {
    }

    createContext(): string {
        return "";
    }

    getContext<T>(contextName: string): T {
        return this.contextMap<T>()[contextName];
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    updateContext<T>(): void {}

    private contextMap<T>(): Record<string, T> {
        const script: HTMLScriptElement =
            this.document.getElementById('jig-rehydrate-context');

        return JSON.parse(decodeURI(script.innerHTML));
    }

}
