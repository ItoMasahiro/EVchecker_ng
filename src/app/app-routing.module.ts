import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RandomComponent } from './entry-points/random/random.component';
import { MainPageComponent } from './main-page/main-page.component';
import { EpMainComponent } from './entry-points/ep-main-page/ep-main.component';
import { TodaysEpMainComponent } from './todays-ep/todays-ep-main/todays-ep-main.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '', component: MainPageComponent },
  { path: 'ep-random', component: RandomComponent },
  { path: 'ep-main', component: EpMainComponent },
  { path: 'todays-ep-main', component: TodaysEpMainComponent }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }
