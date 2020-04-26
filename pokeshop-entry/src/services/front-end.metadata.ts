import 'isomorphic-fetch'

export const MICRO_FRONT_END_METADATA_ID = '__micro_front_end_metadata__';

export class FrontEndMetadata {
  constructor(private readonly eventMap: Object = {}) {}

  getEventMap() {
    return {...this.eventMap};
  }

  getServiceForEvent(event: string) {
    return this.eventMap[event];
  }

  createScript(document: Document) {
    const script = document.createElement('script');

    script.id = MICRO_FRONT_END_METADATA_ID;
    script.type = 'application/json';
    script.textContent = JSON.stringify(this.getEventMap());

    return script;
  }

  static fromDocument(document: Document): FrontEndMetadata {
    const eventMap = JSON.parse(document
        .getElementById(MICRO_FRONT_END_METADATA_ID).textContent
    );

    return new FrontEndMetadata(
        eventMap
    );
  }
}

export class FrontEndMetadataRegisterService {
  protected readonly eventMap: Object = {}

  async register(...urls: string[]): Promise<FrontEndMetadata> {
    await Promise.all(urls.map((url) => this.registerService(url)));

    return new FrontEndMetadata({...this.eventMap});
  }

  private async registerService(url: string) {
    try {
      const response: any = await fetch(`${url}metadata`);
      const responseBody = await response.json();

      responseBody.eventsProvider.forEach((eventProvider) => {
        eventProvider.events.forEach((event) => {
          this.eventMap[event] = eventProvider.serviceFile;
        });
      });
    } catch (e) {
      console.error(`could not fetch metadata from ${url}`);
      console.error(e);
    }
  }
}
