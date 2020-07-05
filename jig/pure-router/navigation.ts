import {Routes} from "./routes";
import {History} from "./history";

export class Navigation {
    constructor(private readonly routes: Routes, private readonly history: History) {
    }

    navigateTo(name: string, params: Record<string, string> = {}): void {
        this.history.push(this.routes.reverse(name, params));
    }
}
