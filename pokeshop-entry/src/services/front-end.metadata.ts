import 'isomorphic-fetch'

export class FrontEndMetadata {
  constructor(private readonly eventMap: Object = {}) {}

  getEventMap() {
    return {...this.eventMap};
  }

  getServiceForEvent(event: string) {
    return this.eventMap[event];
  }
}

export class FrontEndMetadataRegisterService {
  protected readonly eventMap: Object = {}

  async register(...urls: string[]): Promise<FrontEndMetadata> {
    await Promise.all(urls.map((url) => this.registerService(url)));

    return new FrontEndMetadata({...this.eventMap});
  }

  private async registerService(url: string) {
    const response: any = await fetch(`${url}metadata`);
    const responseBody = await response.json();

    responseBody.eventsProvider.forEach((eventProvider) => {
      eventProvider.events.forEach((event) => {
        this.eventMap[event] = eventProvider.serviceFile;
      });
    });
  }
}
