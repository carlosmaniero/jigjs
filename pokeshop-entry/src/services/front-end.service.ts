import 'isomorphic-fetch'

export class FrontEndService {
  private readonly eventMap: Object;

  constructor() {
    this.eventMap = {};
  }

  async register(url: string): Promise<void> {
    const response: any = await fetch(`${url}metadata`);
    const responseBody = await response.json();

    responseBody.eventsProvider.forEach((eventProvider) => {
        eventProvider.events.forEach((event) => {
          this.eventMap[event] = eventProvider.serviceFile;
        });
    });
  }

  getServiceForEvent(event: string) {
    return this.eventMap[event];
  }
}
