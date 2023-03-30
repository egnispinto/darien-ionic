
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DbConfigCloudService } from './db-config-cloud.service';
import { DbmodelMaestraArticulosService } from './dbmodel-maestra-articulos.service';
import { DbmodelMaestraBarrasService } from './dbmodel-maestra-barras.service';
import { DbmodelMaestraDptosService } from './dbmodel-maestra-dptos.service';

@Injectable({
  providedIn: 'root'
})
export class DbSaveInfoCloudService { 
  dataDPTO : any[];
  dataARTICULO : any[];
  dataBARRA : any[];
  dataCONF_CLOUD : any[];
  tipo_platform : string;
  
  itemFetchBarras: Subscription;
  itemdbStateBarras: Subscription;
  itemFetchArticulos: Subscription;
  itemdbStateArticulos: Subscription;
  itemSubs: Subscription;
  itemSubs2: Subscription;
  constructor(
    private dbDpto : DbmodelMaestraDptosService,
    private Platform : Platform,
    private dbArticulo : DbmodelMaestraArticulosService,
    private dbBarra :  DbmodelMaestraBarrasService,
    private dbConfCloud : DbConfigCloudService
  ) {
    this.Platform.ready().then((readySource) => {
      this.tipo_platform = readySource;
      //Busco Dpto
      if(this.tipo_platform == 'cordova'){
        this.dbDpto.dbState().subscribe((res) => {
          if(res){
            this.dbDpto.obtenerRegistros('maestra_departamentos').then( (dpto:any) => {
              this.dataDPTO = dpto;
            })
          }
        })
      }else{
        this.dbDpto.obtenerRegistros('maestra_departamentos').then( (dpto:any) => {
          this.dataDPTO = dpto;
        })
      }
      //Busco Articulos
       this.itemdbStateArticulos = this.dbArticulo.dbState().subscribe((res) => {
          if(res){
            if(this.tipo_platform == 'cordova'){
              this.dbArticulo.obtenerRegistros().then((_ ) => {
                this.itemFetchArticulos = this.dbArticulo.fetchRegistros().subscribe(item => {
                  this.dataARTICULO = item;
                })
              });
            }else{
              this.itemFetchArticulos = this.dbArticulo.fetchRegistros().subscribe(item => {
                this.dataARTICULO = item;
              })
            }           
          }
        });
      //Busco Barras
      this.itemdbStateBarras = this.dbBarra.dbState().subscribe((res) => {
        if(res){
          this.dbBarra.obtenerRegistros().then(_ => {
            this.itemFetchBarras = this.dbBarra.fetchRegistros().subscribe((item:any[]) => {
              this.dataBARRA = item;
            })
          })
        }
       });
       //Busco la configuracion de Cloud
       if(readySource == 'cordova'){
        this.itemSubs = this.dbConfCloud.dbState().subscribe((res) => {
          if(res){
            this.dbConfCloud.obtenerRegistros().then(_ => {
              this.itemSubs2 = this.dbConfCloud.fetchRegistros().subscribe(item => {
                this.dataCONF_CLOUD = item;
              })
            })
          }
        });
      }else{
        this.dbConfCloud.obtenerRegistros().then( (item:any[]) => {
          this.dataCONF_CLOUD = item;
        })
      }
    });
    
   }

  
  //Guarda informacion de los Articulos
  async saveArticulo(Datos:any){
    
   
      let Articulo:any = this.dataARTICULO.find(element => (element.id) == Datos._id); //Busco el id
      let tempFilename = Datos.cod_articulo + '.jpg';
      let definitiva = '/files-external/'+tempFilename;
      if(Articulo){
        
        
        let dataUpdate = {
          id : '',
          name_articulo : Datos.name_articulo,
          price_bs : Datos.price_bs,
          price_usd : Datos.price_usd,
          id_dpto : Datos.departamento,
          id_impuesto : Datos.id_impuesto,
          url_img : Datos.url_img, //Datos.url_img,
          requiere_peso : Datos.requiere_peso,
          requiere_precio : Datos.requiere_precio
        }
        if(Datos.porcentaje == 16)
          dataUpdate.id_impuesto = 1;
        if(Datos.porcentaje == 8)
          dataUpdate.id_impuesto = 2;
        if(Datos.porcentaje == 31)
          dataUpdate.id_impuesto = 3;
        if(Datos.porcentaje == 0)
          dataUpdate.id_impuesto = 4;
        if(Datos.porcentaje == 1) //Esto es PERCIBIDO
          dataUpdate.id_impuesto = 5;
        await this.dbArticulo.actualizarRegistro(Datos._id,dataUpdate);
      }else{
        let dataUpdate = {
          id : Datos._id,
          name_articulo : Datos.name_articulo,
          price_bs : Datos.price_bs,
          price_usd : Datos.price_usd,
          id_dpto : Datos.departamento,
          id_impuesto : Datos.id_impuesto,
          url_img : Datos.url_img, //Datos.url_img,
          requiere_peso : Datos.requiere_peso,
          requiere_precio : Datos.requiere_precio
        }
        if(Datos.porcentaje == 16)
          dataUpdate.id_impuesto = 1;
        if(Datos.porcentaje == 8)
          dataUpdate.id_impuesto = 2;
        if(Datos.porcentaje == 31)
          dataUpdate.id_impuesto = 3;
        if(Datos.porcentaje == 0)
          dataUpdate.id_impuesto = 4;
        console.log(dataUpdate);
        await this.dbArticulo.agregarRegistroCloud(dataUpdate);
      }
   
  }
  //Gurada informacion de las barrras
  saveBarra(Datos:any){
    if(Datos.accion == 'add'){
      let Barra:any = this.dataBARRA.find(element => parseInt(element.cod_barra) == Datos.cod_barras); //Busco el id
      if(Barra){
        let dataUpdate = {
          id : '',
          id_articulo : Datos.cod_articulo,
          cod_barra : Datos.cod_barras
        }
        this.dbBarra.actualizarRegistroCloud(Datos.cod_barras,dataUpdate);
      }else{
        let dataUpdate = {
          id : '',
          id_articulo : Datos.cod_articulo,
          cod_barra : Datos.cod_barras
        }
        this.dbBarra.agregarRegistro(dataUpdate);
      }
    }else{
      if(Datos.accion == 'delete'){
        this.dbBarra.borrarRegistroCloud(Datos.cod_barras);
      }
    }
  }

  saveUltimoId(Datos:any){
    console.log(Datos);
    this.dbConfCloud.actualizarRegistro('SIG_ID',Datos.id).then(res =>{
      //Actualizare tambien el observable
      this.dbConfCloud.obtenerRegistros();
    })
  }

  /*********************
   * Este metodo recibe el array JSON proveniente de la ApiRest
   */
  async receiveArray(arrInfo:any){
    arrInfo.articulos.forEach((Datos:any) => {
          console.log(Datos);
          this.saveArticulo(Datos);
    });
  }
}


