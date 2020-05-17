export class Platform {
    constructor(public readonly isBrowser = true) {
    }

    static browser() {
        return new Platform(true);
    }
}
