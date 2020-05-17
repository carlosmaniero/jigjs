import {BeforeFlushRequest} from "../../server/middlewares";
import {Inject, Injectable} from "../../core/di";
import {ServerRehydrateService} from "./server-rehydrate-service";
import {DocumentInjectionToken} from "../../core/dom";
import {RehydrateService} from "../component";

@Injectable([BeforeFlushRequest])
export class ServerFlushRehydrateState implements BeforeFlushRequest {
    constructor(@Inject(RehydrateService.InjectionToken) private readonly serverRehydrateService: ServerRehydrateService,
                @Inject(DocumentInjectionToken) private readonly document) {
    }

    beforeFlushRequest(): void {
        const script = this.document.createElement('script');
        script.id = 'jig-rehydrate-context'
        script.type = "plain/text"
        script.innerHTML = encodeURI(JSON.stringify(this.serverRehydrateService.contextMap));

        this.document.head.appendChild(script)
    }
}