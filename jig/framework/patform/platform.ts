const browserPlatformId = Symbol('browser-platform');
const serverPlatformId = Symbol('server-platform');


export class PurePlatform {
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

    static browser(): PurePlatform {
        return new PurePlatform(browserPlatformId);
    }
    static server(): PurePlatform {
        return new PurePlatform(serverPlatformId);
    }
}
