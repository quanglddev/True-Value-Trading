import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FusionChartsModule } from 'angular-fusioncharts';

// Import FusionCharts library and chart modules
import * as FusionCharts from 'fusioncharts';
import * as charts from 'fusioncharts/fusioncharts.charts';
import * as powerCharts from 'fusioncharts/fusioncharts.powercharts';
import * as timeCharts from 'fusioncharts/fusioncharts.timeseries';
import * as FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from './core/api.service';

// Pass the fusioncharts library and chart modules
FusionChartsModule.fcRoot(FusionCharts, charts, FusionTheme);
FusionChartsModule.fcRoot(FusionCharts, powerCharts, FusionTheme);
FusionChartsModule.fcRoot(FusionCharts, timeCharts, FusionTheme);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChartsModule,
    NgbModule,
    HttpClientModule,
    FusionChartsModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
