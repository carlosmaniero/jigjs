import {FrontEndMetadata} from "./front-end.metadata";

export class FrontEndDiService {
  constructor(
    private readonly frontEndMetadata: FrontEndMetadata,
    private readonly document: Document) {

  }

  injectDependencyOfEvents(event: string[]) {
    event.forEach((event) => this.injectDependencyOfEvent(event));
  }

  private injectDependencyOfEvent(event: string) {
    const scriptURL = this.frontEndMetadata.getServiceForEvent(event);

    if (this.isDependencyAlreadyInjected(scriptURL)) {
      return;
    }

    if (!scriptURL) {
      console.error(`There are no event listener for "${event}"`);
      return;
    }

    this.document.body.appendChild(this.createScript(scriptURL));
  }

  private isDependencyAlreadyInjected(scriptURL) {
    return this.document.querySelector(`script[src="${scriptURL}"]`);
  }

  private createScript(scriptURL) {
    const script = this.document.createElement("script");
    script.src = scriptURL;
    script.type = "application/javascript";

    return script;
  }
}

export const frontEndDIServiceFromDocument = (document: Document): FrontEndDiService => {
  return new FrontEndDiService(FrontEndMetadata.fromDocument(document), document);
}
