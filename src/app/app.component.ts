import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StartSeedService } from './services/start-seed.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { DbmodelTiendaConfigService } from './services/dbmodel-tienda-config.service';
import { DbConfigCloudService } from './services/db-config-cloud.service';
import { Configuracion} from 'src/app/interfaces/generaldb';
import { Subscription } from 'rxjs';
import { ConnectBackofficeService } from './services/servicio-de-producto.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  currentScreenOrientation:string;
  tipo_platform:string;
  Data: Configuracion[];
  itemSubs: Subscription;
  itemSubs2: Subscription;
  orientacion:any;
  PrinterOnInit:any;
  ipPrinter:any;
  portPrinter:any;
  usaBalanza : any;
  //Cloud
  _token : string ;
  DataCloud : any;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private screenOrientation: ScreenOrientation,
    private seed: StartSeedService,
    private db: DbmodelTiendaConfigService,
    private connectBackOffice : ConnectBackofficeService,
    private dbCloud: DbConfigCloudService,
  ) {
    
    this.initializeApp();
    this.cargarData();
    this.platform.ready().then((readySource) => {
      this.tipo_platform = readySource;
     //
        if(readySource == 'cordova'){
          this.dbCloud.dbState().subscribe((res) => {
            if(res){
               //llamo Cloud
               this.dbCloud.obtenerRegistros().then( item => {
                this.DataCloud = item;
                 this.connectBackOffice.pedirDatos(); 
               
               });
               
            }
          })
          this.itemSubs = this.db.dbState().subscribe((res) => {
            if(res){
              this.db.obtenerRegistros().then((item:Configuracion[]) => {
               
                  this.Data = item;
                 
                  
                 
              })
              
            }
          })
        }else{
          this.connectBackOffice.pedirDatos();
        }
    })    
  }

  async cargarData(){
    this.platform.ready().then(async () => {
        await this.seed.opendataBase().then(async(res) =>{
          let varDataBase = res;
          await this.seed.verifyTable(res,'maestra_articulos').then(async(res:any) =>{
            if (res.rows.length > 0) {
              //Valido tablas nuevas
              await this.seed.verifyTable(varDataBase,'cloud_configuracion').then(async(res:any) =>{
                if (res.rows.length <= 0)
                  await this.seed.seedConfigNew();
              });
              //Columna 1
              await this.seed.verifyColumn(varDataBase, 'tienda_fpago', 'recargo').then(async (response:any) => {
                if(!response){
                  //Columna 1
                  await this.seed.addColumn(varDataBase,'tienda_fpago', 'recargo', 'text').then(async (response:any) =>{
                  }).catch( err => {
                    alert("Error al agregar columna recargo para tienda_fpago");
                    alert(err);
                  });
                }
              });
              //Columna 2
              await this.seed.verifyColumn(varDataBase, 'tienda_fpago', 'porcentaje_recargo').then(async (response:any) => {
                if(!response){
                  //Columna 2
                  await this.seed.addColumn(varDataBase,'tienda_fpago', 'porcentaje_recargo', 'integer').then(async (response:any) =>{
                  }).catch( err => {
                    alert("Error al agregar columna porcentaje_recargo para tienda_fpago");
                    alert(err);
                  });
                }
              });
              //Columna 3
              await this.seed.verifyColumn(varDataBase, 'saleheader', 'recargo').then(async (response:any) => {
                if(!response){
                  //Columna 3
                  await this.seed.addColumn(varDataBase,'saleheader', 'recargo', 'text').then(async (response:any) =>{
                  }).catch( err => {
                    alert("Error al agregar columna recargo para saleheader");
                    alert(err);
                  });
                }
              });
               //Columna 4
               await this.seed.verifyColumn(varDataBase, 'saleheader', 'porcentaje_recargo').then(async (response:any) => {
                if(!response){
                  //Columna 4
                  await this.seed.addColumn(varDataBase,'saleheader', 'porcentaje_recargo', 'integer').then(async (response:any) =>{
                  }).catch( err => {
                    alert("Error al agregar columna porcentaje_recargo para saleheader");
                    alert(err);
                  }); 
                }
              });

              //Columna 5
              await this.seed.verifyColumn(varDataBase, 'salepayments', 'valor_recargo_igtf').then(async (response:any) => {
                if(!response){
                  //Columna 5
                  await this.seed.addColumn(varDataBase,'salepayments', 'valor_recargo_igtf', 'text').then(async (response:any) =>{
                  }).catch( err => {
                    alert("Error al agregar columna valor_recargo_igtf para salepayments");
                    alert(err);
                  });
                }
              });

              //Columna 6
              await this.seed.verifyColumn(varDataBase, 'salepayments', 'porcentaje_recargo_igtf').then(async (response:any) => {
                if(!response){
                  //Columna 6
                  await this.seed.addColumn(varDataBase,'salepayments', 'porcentaje_recargo_igtf', 'text').then(async (response:any) =>{
                  }).catch( err => {
                    alert("Error al agregar columna porcentaje_recargo_igtf para salepayments.");
                    alert(err);
                  });
                }
              });
              
              this.seed.ActivedStatus();
            }else{
             
              //Valido tablas nuevas 
              await this.seed.seedConfigNew();
              await this.seed.seedData().then(async(res) =>{
                //this.seed.ActivedStatus();
                
              }).catch(async(res) => {
                alert("Ocurrio un error cargando la data maestra");
              });
              
            }
          })
        }).catch(res => {
        });
    });
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      
    });
  }

}
