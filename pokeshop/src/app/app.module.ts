import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FragmentComponent } from './components/fragment/fragment.component';
import {HttpClientModule} from "@angular/common/http";
import {appInitializeFactory, AppInitService} from "./app-init.service";


@NgModule({
  declarations: [
    AppComponent,
    FragmentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializeFactory, deps: [AppInitService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
