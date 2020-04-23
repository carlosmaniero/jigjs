import 'isomorphic-fetch'

export class FrontEndMetadataService {
  constructor(private readonly eventMap: Object = {}) {}

  async register(url: string): Promise<void> {
    const response: any = await fetch(`${url}metadata`);
    const responseBody = await response.json();

    responseBody.eventsProvider.forEach((eventProvider) => {
        eventProvider.events.forEach((event) => {
          this.eventMap[event] = eventProvider.serviceFile;
        });
    });
  }

  getEventMap() {
    return {...this.eventMap};
  }

  getServiceForEvent(event: string) {
    return this.eventMap[event];
  }
}
