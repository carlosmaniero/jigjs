import {Directive, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";

@Directive({
  selector: '[appFrontEndFragment]'
})
export class FrontEndFragmentDirective {

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId,
    private readonly el: ElementRef
  ) {
    if (!isPlatformBrowser(platformId)) {
      console.log('la');
      el.nativeElement.style.backgroundColor = 'yellow';
    }
  }

}
