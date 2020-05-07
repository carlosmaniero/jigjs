import {RehydrateService} from "../component";
import {Inject, Injectable} from "../../core/di";
import {DocumentInjectionToken} from "../../core/dom";


@Injectable([RehydrateService])
export class BrowserRehydrateService implements RehydrateService {
    constructor(@Inject(DocumentInjectionToken) private readonly document) {
    }

    createContext(): string {
        return "";
    }

    getContext<T>(contextName: string): T {
        return this.contextMap()[contextName];
    }

    updateContext<T>(contextName: string, object: T): void {
    }

    private contextMap() {
        const script: HTMLScriptElement =
            this.document.getElementById('jigjoy-rehydrate-context');

        return JSON.parse(decodeURI(script.innerHTML));
    }

}
