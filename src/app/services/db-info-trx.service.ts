import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { StartSeedService } from './start-seed.service';

@Injectable({
  providedIn: 'root'
})
export class DbInfoTrxService {
  private storage: SQLiteObject;
  tipo_platform : string;
  tableHeader = 'saleheader';
  tableItems = 'saleitems';
  tablePayments = 'salepayments';
  tableFoot = 'salefoot';
  openDatabase:boolean = false;
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private platform : Platform,
    private startSeed: StartSeedService,
    private sqlite: SQLite,
  ) {
    this.platform.ready().then((readySource) =>{
      this.tipo_platform = readySource;
      if(this.tipo_platform == 'cordova'){
        this.startSeed.dbState().subscribe((res) => {
          if(res){
            this.sqlite.create({
              name: 'z012BPM.db',
              location: 'default'
            })
            .then((db: SQLiteObject) => {
                this.storage = db;
                this.isDbReady.next(true);
            });
          }
        })
        
      }
    });
   }

  getMaxId(){
    if(this.tipo_platform == 'cordova'){
      if(this.isDbReady){
        return this.storage.executeSql(`SELECT max(trans) as trans FROM ${this.tableHeader} `, []).then(res => {
          let trans : any[]= [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              trans.push({ 
                trans: res.rows.item(i).trans
              });
            }
          }
          return trans;
        })
      }
     
    }else{
      return new Promise((resolve) => {
        let trans : any[]= [];
        let data = {
          trans : '1'
        }
        trans.push(data);
        resolve(trans);
      });
    }
  }

  //Obtengo datos de la cabecera
  obtenerRegistroCabecera(Trx){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT trans,pos,linetrans,saletype,salestatus,
        fechainicio,horainicio,cajero,id_salebusiness FROM ${this.tableHeader} 
        where trans=${Trx}`, []).then(res => {
          let trans : any[]= [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              trans.push({ 
                trans: res.rows.item(i).trans,
                pos: res.rows.item(i).pos,
                linetrans: res.rows.item(i).linetrans,
                saletype: res.rows.item(i).saletype,
                salestatus: res.rows.item(i).salestatus,
                fechainicio: res.rows.item(i).fechainicio,
                horainicio: res.rows.item(i).horainicio,
                cajero: res.rows.item(i).cajero,
                id_salebusiness: res.rows.item(i).id_salebusiness,
              });
            }
          }
          return trans;
        })
        .catch(error => alert("hubo error en obtenerRegistros con obtenerRegistroCabecera: "+this.tableHeader));
    }else{
      return new Promise((resolve) => {
        let trans : any[]= [];
        let data = {
          trans : 1,
          pos : 1,
          linetrans : '1',
          saletype : '1',
          salestatus : '3',
          fechainicio : '2021/11/13',
          horainicio : '14:00',
          cajero : '1',
          id_salebusiness : '1'
        }
        trans.push(data);
        resolve(trans);
      });
        
    }
  }

  //Aqui empieza eldetalle de ITEMS
  obtenerRegistroItemsDetalle(Trx){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT linetrans,articulo,price1,pludesc,amtsold,totalivaproducto,
        cantidadvendido,totalreal,deptid,impuestoid from ${this.tableItems} where trans = ${Trx} order by linetrans`, [])
        .then(res => {
          let trans : any[]= [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              trans.push({ 
                linetrans: res.rows.item(i).linetrans,
                articulo: res.rows.item(i).articulo,
                price1: res.rows.item(i).price1,
                pludesc: res.rows.item(i).pludesc,
                amtsold: res.rows.item(i).amtsold,
                totalivaproducto: res.rows.item(i).totalivaproducto,
                cantidadvendido: res.rows.item(i).cantidadvendido,
                totalreal: res.rows.item(i).totalreal,
                deptid: res.rows.item(i).deptid,
                impuestoid: res.rows.item(i).impuestoid
              });
            }
          }
          return trans;
        })
        .catch(error => alert("hubo error en obtenerRegistros con obtenerRegistroItemsDetalle "+this.tableItems));
    }else{
      return new Promise((resolve) => {
        let trans : any[]= [];
        let data = {
          linetrans : '1',
          articulo : '1',
          price1 : 1000,
          pludesc : 'Articulo de Prueba',
          amtsold : 1000,
          totalivaproducto : 160,
          cantidadvendido : 1,
          totalreal : 1160,
          deptid : 1,
          impuestoid : 2
        };
        trans.push(data);
        resolve(trans);
      });
        
    }
  }
  //Fin deldetalle de Items

  //Detalle de los PAGOS
  obtenerRegistroPaymentsDetalle(Trx){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT linetrans,formapagoid,descformapago,monto,
        vuelto,moneda_local,monto_divisa,tasa_calculo
         from ${this.tablePayments} where trans = ${Trx} order by linetrans`, [])
        .then(res => {
          let trans : any[]= [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              trans.push({ 
                linetrans: res.rows.item(i).linetrans,
                formapagoid: res.rows.item(i).formapagoid,
                descformapago: res.rows.item(i).descformapago,
                monto: res.rows.item(i).monto,
                vuelto: res.rows.item(i).vuelto,
                moneda_local: res.rows.item(i).moneda_local,
                monto_divisa: res.rows.item(i).monto_divisa,
                tasa_calculo: res.rows.item(i).tasa_calculo
              });
            }
          }
          return trans;
        })
        .catch(error => alert("hubo error en obtenerRegistros con obtenerRegistroPaymentsDetalle "+this.tablePayments));
    }else{
      return new Promise((resolve) => {
        let trans : any[]= [];
        let data = {
          
        };
        trans.push(data);
        resolve(trans);
      });
    }
  }
  //Fin de Detalle de los PAGOS

  //Aqui empieza eldetalle del Pie
  obtenerRegistroFootDetalle(Trx){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT linetrans,hora,fecha,neto,bruto,iva,montoimpuesto,
        numeroz,factura,impresora,clienteid,nombre
         from ${this.tableFoot} where trans = ${Trx} order by linetrans`, [])
        .then(res => {
          let trans : any[]= [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              trans.push({ 
                linetrans: res.rows.item(i).linetrans,
                hora: res.rows.item(i).hora,
                fecha: res.rows.item(i).fecha,
                neto: res.rows.item(i).neto,
                bruto: res.rows.item(i).bruto,
                iva: res.rows.item(i).iva,
                montoimpuesto: res.rows.item(i).montoimpuesto,
                numeroz: res.rows.item(i).numeroz,
                factura: res.rows.item(i).factura,
                impresora: res.rows.item(i).impresora,
                clienteid: res.rows.item(i).clienteid,
                nombre: res.rows.item(i).nombre
              });
            }
          }
          return trans;
        })
        .catch(error => alert("hubo error en obtenerRegistros con obtenerRegistroFootDetalle "+this.tableFoot));
    }else{
      return new Promise((resolve) => {
        let trans : any[]= [];
        let data = {
          
        };
        trans.push(data);
        resolve(trans);
      });
    }
  }
  //Fin del detalle  de Pie de TRX
  //Actualizo el numero de Pos de las transacciones que ya se han hecho

  updateNumPos(Pos){
    let intPos : any = parseInt(Pos);
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`update  ${this.tableHeader} set pos=${intPos}
      where pos=0`, []).then(res => {
        return res;
      })
      .catch(error => alert(`hubo error en updateNumPos ${this.tableHeader}`));
    }else{
      return new Promise((resolve) => {
        resolve("ok");
      });
    }
  }

}
