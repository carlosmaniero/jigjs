import {FrontEndService} from "./front-end.service";

export class FrontEndDIService {
  private readonly filesAppended = [];

  constructor(
    private readonly frontEndService: FrontEndService,
    private readonly document: Document) {

  }

  injectDependencyOfEvent(event: string) {
    const scriptURL = this.frontEndService.getServiceForEvent(event);

    if (this.filesAppended.includes(scriptURL)) {
      return;
    }

    if (!scriptURL) {
      console.error(`There are no event listener for "${event}"`);
    }

    this.document.body.appendChild(this.createScript(scriptURL));
    this.filesAppended.push(scriptURL);
  }

  private createScript(scriptURL) {
    const script = this.document.createElement("script");
    script.src = scriptURL;
    script.type = "application/javascript";

    return script;
  }
}
