import {JigJoyModule} from "./module";

export class Platform {
    constructor(private readonly _isServer: boolean) {
    }

    isServer() {
        return this._isServer;
    }

    isBrowser() {
        return !this._isServer;
    }
}

export const browserPlatformModule = new JigJoyModule({
    providers: [{provide: Platform, useValue: new Platform(false)}]
})

export const serverPlatformBrowser = new JigJoyModule({
    providers: [{provide: Platform, useValue: new Platform(true)}]
})
