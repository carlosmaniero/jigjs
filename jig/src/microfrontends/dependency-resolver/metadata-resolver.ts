import 'isomorphic-fetch'

interface MetadataEventProvider {
    events: string[];
    serviceFile: string;
}

interface Metadata {
    eventsProvider: MetadataEventProvider[];
}

export class MetadataResolver {
    private _metadataOfURL: Record<string, Metadata> = {};
    private readonly waitPromise: Promise<void>;
    private firstLoadResolver: () => void;

    constructor(private readonly urls: string[]) {
        this.waitPromise = new Promise((resolve) => {
            this.firstLoadResolver = resolve;
        });

        this.loadFromServices();
    }

    async wait(): Promise<void> {
        return this.waitPromise;
    }

    serviceFileForEvent(eventName: string): string | null {
        const metadataList: Metadata[] = Object.values(this._metadataOfURL);

        const eventProvider = metadataList
            .flatMap((metadata) => metadata.eventsProvider)
            .find((eventProvider) => !!eventProvider.events?.find((event) => event === eventName));

        if (!eventProvider) {
            return null;
        }

        return eventProvider.serviceFile;
    }

    get microservicesMetadata() {
        return {...this._metadataOfURL};
    }

    static of(...urls: string[]): MetadataResolver {
        return new MetadataResolver(urls);
    }

    private async loadUrl(url: string): Promise<void> {
        const response = await fetch(url);
        const responseBody = await response.json() as Metadata;

        if (!Array.isArray(responseBody.eventsProvider)) {
            return;
        }

        this._metadataOfURL[url] = responseBody;
    }

    private async loadFromServices(): Promise<void> {
        await Promise
            .all(this.urls.map((url) => this.loadUrl(url).catch(() => null)));

        this.firstLoadResolver();
    }
}
