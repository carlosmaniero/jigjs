import {Component, Input, OnInit} from '@angular/core';
import {FragmentService} from "./services/fragment.service";

@Component({
  selector: 'app-fragment',
  templateUrl: './fragment.component.html',
  styleUrls: ['./fragment.component.css']
})
export class FragmentComponent implements OnInit {

  @Input()
  private fragmentId: string;

  @Input()
  private url: string

  public html: string;

  constructor(private readonly fragmentService: FragmentService) {

  }

  ngOnInit(): void {
    this.fragmentService.fetch({url: this.url})
      .subscribe((data) => {
        this.html = data;
      })
  }

}
