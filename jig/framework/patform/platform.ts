const browserPlatformId = Symbol('browser-platform');
const serverPlatformId = Symbol('server-platform');


export class Platform {
    private constructor(public readonly platformId: symbol) {
    }

    isBrowser(): boolean {
        return this.platformId === browserPlatformId;
    }

    isServer(): boolean {
        return this.platformId === serverPlatformId;
    }

    strategy<T>(browserFactory: () => T, serverFactory: () => T): T {
        if (this.isBrowser()) {
            return browserFactory();
        }

        return serverFactory();
    }

    static browser(): Platform {
        return new Platform(browserPlatformId);
    }

    static server(): Platform {
        return new Platform(serverPlatformId);
    }
}
