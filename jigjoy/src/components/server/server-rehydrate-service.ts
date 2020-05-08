import {Singleton} from "../../core/di";
import {RehydrateService} from "../component";

@Singleton([RehydrateService])
export class ServerRehydrateService implements RehydrateService {
    private contextCount: number;
    private readonly _contextMap = {};

    constructor() {
        this.contextCount = 0;
    }

    createContext(): string {
        const contextName = this.contextCount.toString();
        this.contextCount++
        return contextName;
    }

    getContext<T>(contextName: string): T {
        return this._contextMap[contextName];
    }

    updateContext<T>(contextName: string, object: T): void {
        this._contextMap[contextName] = JSON.parse(JSON.stringify(object));
    }

    get contextMap() {
        return {...this._contextMap}
    }

}
