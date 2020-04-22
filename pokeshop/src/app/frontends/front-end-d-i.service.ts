import {Inject, Injectable} from '@angular/core';
import {FrontEndService} from "./front-end.service";
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class FrontEndDIService {
  private readonly filesAppended = [];

  constructor(private readonly frontEndService: FrontEndService, @Inject(DOCUMENT) private readonly document: Document) {

  }

  injectDependencyOfEvent(event: string) {
    const scriptURL = this.frontEndService.getServiceForEvent(event);

    if (this.filesAppended.includes(scriptURL)) {
      return;
    }

    if (!scriptURL) {
      console.error(`There are no event listener for "${event}"`);
    }

    this.document.head.append(this.createScript(scriptURL));
    this.filesAppended.push(scriptURL);
  }

  private createScript(scriptURL) {
    const script = document.createElement("script");
    script.src = scriptURL;
    script.type = "application/javascript";

    return script;
  }
}
