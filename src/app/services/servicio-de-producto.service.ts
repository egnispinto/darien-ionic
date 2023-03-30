import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { DbConfigCloudService } from './db-config-cloud.service';
import { CloudConfiguracion} from 'src/app/interfaces/generaldb';
import { Observable, Subscription } from 'rxjs';
import { DbSaveInfoCloudService } from './db-save-info-cloud.service';
import { DbInfoTrxService } from './db-info-trx.service';
import { DbEndofdayService } from './db-endofday.service';
import {map} from "rxjs/operators";
import {interval} from "rxjs/internal/observable/interval";
import {startWith, switchMap} from "rxjs/operators";
@Injectable({
  providedIn: 'root'
})
export class ConnectBackofficeService {
  _url_autenticacion : string = '/api/auth';
  _url_getInfo : string = '/api/items';
  tipo_platform : string = '';
  itemSubs: Subscription;
  itemSubs2: Subscription;
  Data : any;
  sig_id : string;
  ult_id_business : string;
  _token : string;
  _idEmpresa : string;
  _url : string;
  _usercloud : string;
  _dbEndOfDay : any[];
  constructor(
    private Platform:Platform,
    public http: HttpClient,
    private toast : ToastController,
    private db: DbConfigCloudService,
    private dbSave: DbSaveInfoCloudService,
    private dbInfoTrx : DbInfoTrxService,
    private dbEndOfDay :DbEndofdayService 
  ) { 
    this.Platform.ready().then(async (readySource) => {
      this.tipo_platform = readySource;
      
      if(readySource == 'cordova'){
        //Datos del business Day
        this.db.dbState().subscribe((res) => {
          if(res){
            this.dbEndOfDay.obtenerRegistroCloud().then((res:any) =>{
              if(res)
                this._dbEndOfDay = res;
              else
                this._dbEndOfDay = undefined;
            })
          }
        });
        //Item
        this.db.dbState().subscribe(async (res) => {
          //console.log(res);
          if(res){
           await this.db.obtenerRegistros().then(_ => {
              this.db.fetchRegistros().subscribe(item => {
                this.Data = item;
                this.sig_id = this.Data.find(element => element.clave == 'SIG_ID').valor
                console.log("Cambio el observable y ahora valgo"+this.sig_id);
                this.ult_id_business = this.Data.find(element => element.clave == 'ULT_ID_BUSINESS').valor;
                this._token = this.Data.find(element => element.clave == '_TOKEN_CLOUD').valor;
                this._idEmpresa = this.Data.find(element => element.clave == 'EMPRESA_CLOUD').valor;
                this._url = this.Data.find(element => element.clave == 'SERVER_CLOUD').valor;
                this._usercloud = this.Data.find(element => element.clave == 'USER_CLOUD').valor;
             })
            })
          }
        });
      }else{
        await this.db.obtenerRegistros().then( (item:CloudConfiguracion[]) => {
          this.Data = item;
          this.sig_id = this.Data.find(element => element.clave == 'SIG_ID').valor;
          this.ult_id_business = this.Data.find(element => element.clave == 'ULT_ID_BUSINESS').valor;
          //this._token = this.Data.find(element => element.clave == '_TOKEN_CLOUD').valor;
          this._token = "Esto es un Token de Pruebas ";
          this._idEmpresa = this.Data.find(element => element.clave == 'EMPRESA_CLOUD').valor;
          this._url = this.Data.find(element => element.clave == 'SERVER_CLOUD').valor;
          this._usercloud = this.Data.find(element => element.clave == 'USER_CLOUD').valor;
        });
       await this.dbEndOfDay.obtenerRegistroCloud().then((res:any) =>{
          this._dbEndOfDay = res;
        })
      }
    });
  }
  async mensaje(mensaje){
    if(this.tipo_platform == 'cordova'){
      let toast = await this.toast.create({
        message: mensaje,
        position: 'middle',
        duration: 2000
      });
      toast.present(); 
    }
  }
  
  async sendGet(_url : any){
    return new Promise( (resolve, reject) => {
      this.http.get(_url)
         .subscribe(data => {
           resolve(data);
          }, (err) => {
            if(err.status == 401){
              //Este error es credenciales invalidas
              resolve({
                code: 401,
                status : 'unathorized'
              });
            }
            reject(err); //Mando todo el error porque puede ser un code 500
          });
          
     });
  }

  getData(url){
    return this.http.get(url)
      .pipe(
        map( async(res:any) => {
          if(res){
            if(res.code == 401){
            }else{
              await this.dbSave.receiveArray(res);
            }
          }
        })
      );
  }

  
  
  async pedirDatos(){
    this.Platform.ready().then((readySource) => {
        console.log(this.sig_id);
        this.itemSubs = interval(360000) //5 minutos 
        .pipe(
          startWith(0),
          switchMap(() => this.getData(this._url + this._url_getInfo ))
        )
        .subscribe(res => console.log(res))  
        , (err) => {console.log(err)}
        ;
      ;
       /* this.sendGet(url).then(res =>{
          this.dbSave.receiveArray(res);
        })*/
      
    })
    
  }
  async asyncForEach(array, callback) {
    let index = 0;
   for (index = 0; index < array.length; index++) {
     await callback(array[index], index, array);
   }
  }
  

  generateBusiness(business:any){
    let dato = {
      'id' : business.id,
      'begin_date' : business.begin_date,
      'end_date' :  business.end_date
    }
    return dato;
  }
  generateItems(Items:any,_datos_cabecera){
    let dato = {
      'trans' : _datos_cabecera.trans,
      'pos'  : _datos_cabecera.pos,
      'linetrans' : Items.linetrans,
      'articulo' : Items.articulo,
      'pludesc' : Items.pludesc,
      'price1' : Items.price1,
      'deptid' : Items.deptid,
      'impuestoid' : Items.impuestoid, 
      'amtsold': Items.amtsold,
      'totalivaproducto' : Items.totalivaproducto,
      'cantidadvendido' : Items.cantidadvendido,
      'devueltos' : 0,
      'anulado' : 0,
      'totalreal' : Items.totalreal,
      'descuentoitem' : 0
    }
    return dato;
  }
  generateHeader(_datos_cabecera){
    let dato = {
      'trans' : _datos_cabecera.trans,
      'pos'  : _datos_cabecera.pos,
      'linetrans' : _datos_cabecera.linetrans,
      'saletype' : _datos_cabecera.saletype,
      'printerstatus' : _datos_cabecera.printerstatus,
      'fechainicio' : _datos_cabecera.fechainicio,
      'horainicio' : _datos_cabecera.horainicio,
      'fechaculminacion' : '', 
      'horaculminacion': '',
      'cajero' : _datos_cabecera.cajero,
      'id_salebusiness' : _datos_cabecera.id_salebusiness
    }
    return dato;
  }
  generatePayments(_datos_pagos,_datos_cabecera){
    let dato = {
      'trans' : _datos_cabecera.trans,
      'pos'  : _datos_cabecera.pos,
      'linetrans' : _datos_pagos.linetrans,
      'formapagoid' : _datos_pagos.formapagoid,
      'descformapago' : _datos_pagos.descformapago,
      'monto' : _datos_pagos.monto,
      'vuelto' : _datos_pagos.vuelto,
      'moneda_local' : _datos_pagos.moneda_local,
      'monto_divisa' : _datos_pagos.monto_divisa,
      'tasa_calculo' : _datos_pagos.tasa_calculo
    }
    return dato;
  }
  generateFoot(_datos_foot,_datos_cabecera){
    let dato = {
      'trans' : _datos_cabecera.trans,
      'pos'  : _datos_cabecera.pos,
      'linetrans' : _datos_foot.linetrans,
      'hora' : _datos_foot.hora,
      'fecha' : _datos_foot.fecha,
      'neto' : _datos_foot.neto,
      'bruto' : _datos_foot.bruto,
      'iva' : _datos_foot.iva,
      'montoimpuesto' : _datos_foot.montoimpuesto,
      'numeroz' : _datos_foot.numeroz,
      'factura' : _datos_foot.factura,
      'impresora' : _datos_foot.impresora,
      'clienteid' : _datos_foot.clienteid,
      'nombre' : _datos_foot.nombre,
    }
    return dato;
  }
  async createJson(_datos_cabecera:any,_datos_item:any,_datos_pagos:any,_datos_foot:any,business:any){
    return new Promise(async (resolve) => {
      //Primero se crea la estructura para el business
      let jsonBusiness = this.generateBusiness(business);
      let Dato = {
        'business' : jsonBusiness
      };
      //Header
      let jsonHeader = this.generateHeader(_datos_cabecera[0]);
      Dato['header'] = jsonHeader;
      //Items
      let jsonItem :any[] = [];
      /*_datos_item.forEach(DatosItems => {
        jsonItem = jsonItem.concat(this.generateItems(DatosItems,_datos_cabecera[0]));
      });*/
      await this.asyncForEach(_datos_item, async (ItemSave:any) => {
        jsonItem = jsonItem.concat(this.generateItems(ItemSave,_datos_cabecera[0])); 
      });
      Dato['item'] = jsonItem;
      //Payments
      let jsonPayments :any = [];
      await this.asyncForEach(_datos_pagos, async (ItemSave:any) => {
        jsonPayments = jsonPayments.concat(this.generatePayments(ItemSave,_datos_cabecera[0])); 
      });
      Dato['payments'] = jsonPayments;
      //Foot
      let jsonFoot :any;
      _datos_foot.forEach(DatosFoot => {
        jsonFoot = this.generateFoot(DatosFoot,_datos_cabecera[0]);
        Dato['salefoot'] = jsonFoot;
      });
      console.log("DESDE AQUI PARA POSTMAN");
      console.log(Dato);
      resolve(Dato);
    });
  }

  async actualizoId(_id){
    this.db.actualizarRegistro('ULT_ID_BUSINESS',_id);
  }

  
  async sendPost(_url:any, body : any){
   
  }
  
  
  async EnviaInformacion(_id, modo: string = 'Venta'){
  
  }

  async sendDatos(modo: string = 'Venta'){
    console.log("Enviare sendDatos");
   
  }
  
  async enviarDatos(){
    
  }


}
