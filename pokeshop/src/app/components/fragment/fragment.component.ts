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
        this.container.nativeElement.querySelectorAll('script').forEach((script) => {
          this.container.nativeElement.removeChild(script);
          this.appendScript(script.src);

        })
      })
  }

  private appendScript(src: string) {
    const script = document.createElement("script");
    script.src = src;
    this.container.nativeElement.appendChild(script);
  }
}
