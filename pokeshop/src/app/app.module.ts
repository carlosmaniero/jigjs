import {BrowserModule, BrowserTransferStateModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FragmentComponent} from './components/fragment/fragment.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {appInitializeFactory, AppInitService} from "./app-init.service";
import {BrowserStateInterceptor} from "./interceptor/browser-state.interceptor";
import { FrontEndFragmentDirective } from './front-end-fragment.directive';


@NgModule({
  declarations: [
    AppComponent,
    FragmentComponent,
    FrontEndFragmentDirective
  ],
  imports: [
    BrowserTransferStateModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializeFactory, deps: [AppInitService], multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BrowserStateInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
