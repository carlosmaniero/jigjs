import {RehydrateService} from "../component";
import {Singleton} from "../../core/di";

@Singleton([RehydrateService])
export class ServerRehydrateService implements RehydrateService {
    private contextCount: number;
    private readonly contextMap = {};

    constructor() {
        this.contextCount = 0;
    }

    createContext(): string {
        const contextName = this.contextCount.toString();
        this.contextCount++
        return contextName;
    }

    getContext<T>(contextName: string): T {
        return this.contextMap[contextName];
    }

    updateContext<T>(contextName: string, object: T): void {
        this.contextMap[contextName] = object;
    }

}
