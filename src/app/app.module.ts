import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './/app-routing.module';
import 'rxjs/Rx';
import { HttpModule } from '@angular/http';


import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';
import { RandomComponent } from './entry-points/random/random.component';
import { MainPageComponent } from './main-page/main-page.component';
import { EpMainComponent } from './entry-points/ep-main-page/ep-main.component';
import { LowerShadowComponent } from './entry-points/lower-shadow/lower-shadow.component';
import { UpperShadowComponent } from './entry-points/upper-shadow/upper-shadow.component';
import { DoubleLsComponent } from './entry-points/double-ls/double-ls.component';
import { LsInBottomComponent } from './entry-points/ls−in-bottom/ls−in-bottom.component';
import { DoubleHaramiComponent } from './entry-points/double-harami/double-harami.component';
import { AkasanpeiComponent } from './entry-points/akasanpei/akasanpei.component';
import { CustomComponent } from './entry-points/custom/custom.component';

import { StockDataService } from './services/stock-data.service';
import { SharedEpService } from './services/shared-ep.service';


@NgModule({
  declarations: [
    AppComponent,
    HeroesComponent,
    RandomComponent,
    MainPageComponent,
    EpMainComponent,
    LowerShadowComponent,
    UpperShadowComponent,
    DoubleLsComponent,
    LsInBottomComponent,
    DoubleHaramiComponent,
    AkasanpeiComponent,
    CustomComponent
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
