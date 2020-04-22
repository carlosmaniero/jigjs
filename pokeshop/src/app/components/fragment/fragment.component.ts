import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FragmentService} from "./services/fragment.service";

@Component({
  selector: 'app-fragment',
  templateUrl: './fragment.component.html',
  styleUrls: ['./fragment.component.css']
})
export class FragmentComponent implements OnInit {

  @Input()
  public fragmentId: string;

  @Input()
  public url: string

  @ViewChild("fragmentContainer")
  public container: ElementRef;

  constructor(private readonly fragmentService: FragmentService) {

  }

  ngOnInit(): void {
    this.fragmentService.fetch({url: this.url})
      .subscribe((data) => {
        this.container.nativeElement.innerHTML = data;

        const htmlDivElement = document.createElement('div');

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
    const script = document.createElement("script");

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
