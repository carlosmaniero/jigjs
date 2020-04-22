import {AfterViewInit, Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {FragmentService} from "./services/fragment.service";
import {DOCUMENT, isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-fragment',
  templateUrl: './fragment.component.html',
  styleUrls: ['./fragment.component.css']
})
export class FragmentComponent implements AfterViewInit {

  @Input()
  public fragmentId: string;

  @Input()
  public url: string

  @ViewChild("fragmentContainer")
  public container: ElementRef;
  public html: string;

  private readonly isBrowser: boolean;

  constructor(
    private readonly fragmentService: FragmentService,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    this.fragmentService.fetch({url: this.url})
      .subscribe((data) => {
        if (!this.isBrowser) {
          this.html = data;
          return;
        }
        this.container.nativeElement.innerHTML = data;

        const htmlDivElement = this.document.createElement('div');

        this.container.nativeElement.querySelectorAll('script:not([async])').forEach((script) => {
          this.copyScript(script, htmlDivElement);
        });

        this.container.nativeElement.querySelectorAll('script[async]').forEach((script) => {
          this.copyScript(script, htmlDivElement);
        });

        this.container.nativeElement.appendChild(htmlDivElement);
      })
  }

  private copyScript(script: HTMLScriptElement, htmlDivElement: HTMLDivElement) {
    this.container.nativeElement.removeChild(script);

    this.appendScript(script, htmlDivElement);
  }

  private appendScript(originalScript, element) {
    const script = this.document.createElement("script");

    script.src = originalScript.src;
    script.id = originalScript.id;
    script.type = originalScript.type;
    script.async = originalScript.async;
    script.innerHTML = originalScript.innerHTML;
    script['data-next-page'] = originalScript['data-next-page'];
    script['nomodule'] = originalScript['nomodule'];

    element.appendChild(script);
  }
}
