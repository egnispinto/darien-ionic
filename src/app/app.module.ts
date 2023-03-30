import { LOCALE_ID,NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {enableProdMode} from '@angular/core';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { registerLocaleData } from '@angular/common';
/*Componentes*/
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//Prueba Orientacion
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { PipesModule } from './pipes/pipes.module';
import { ComponentsModule } from './components/components.module';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { HttpClientModule } from '@angular/common/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { DatePipe } from '@angular/common';
import localeEsVE from '@angular/common/locales/es-VE';
registerLocaleData(localeEsVE, 'es-VE');
//enableProdMode();
@NgModule({
  declarations: [
    AppComponent
  ],/*
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],*/
  entryComponents: [],
  imports: [BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    BrowserAnimationsModule,
    PipesModule,
    ComponentsModule,
    HttpClientModule
  ],
  providers: [
    AppComponent,
    StatusBar,
    SplashScreen,
    ScreenOrientation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-VE' },
    SQLite,
    SQLitePorter,
    BarcodeScanner,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
