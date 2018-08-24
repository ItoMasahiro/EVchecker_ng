import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './/app-routing.module';
import 'rxjs/Rx';
import { HttpModule } from '@angular/http'; // <- add this!


import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';
import { RandomComponent } from './entry-points/random/random.component';
import { MainPageComponent } from './main-page/main-page.component';
import { LowerShadowComponent } from './entry-points/lower-shadow/lower-shadow.component';
import { EpMainComponent } from './entry-points/ep-main-page/ep-main.component';

import { StockDataService } from './services/stock-data.service';
import { SharedEpService } from './services/shared-ep.service';


@NgModule({
  declarations: [
    AppComponent,
    HeroesComponent,
    RandomComponent,
    MainPageComponent,
    LowerShadowComponent,
    EpMainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpModule
  ],
  providers: [
    StockDataService,
    SharedEpService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
