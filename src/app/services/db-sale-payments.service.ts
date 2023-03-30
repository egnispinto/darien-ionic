import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Payments, Items } from 'src/app/interfaces/generaldb'
import { HttpClient } from '@angular/common/http';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { StartSeedService } from './start-seed.service';
@Injectable({
  providedIn: 'root'
})
export class DbSalePaymentsService {
  private storage: SQLiteObject;
  headerList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  trans;
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
  tablePayments = 'salepayments';
  constructor(
    private platform: Platform, 
    private sqlite: SQLite,
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
    private startSeed: StartSeedService
  ) 
  {
    this.platform.ready().then((readySource) => {
      if(readySource=='cordova'){
        this.startSeed.dbState().subscribe((res) => {
          if(res){
            this.sqlite.create({
              name: 'z012BPM.db',
              location: 'default'
            })
            .then((db: SQLiteObject) => {
                this.storage = db;
                this.isDbReady.next(true);
                //this.getFakeData();
            });
          }
        });
       
        //Add
        this.tipo_platform = readySource;
      }else{ //Fin de Cordova
        this.tipo_platform = "browser";
      }
        
    });
  }

  dbState() {
    return this.isDbReady.asObservable();
  }
  getFakeData() {
    this.httpClient.get(
      'assets/dump.sql', 
      {responseType: 'text'}
    ).subscribe(data => {
      this.sqlPorter.importSqlToDb(this.storage, data)
        .then(_ => {
          this.isDbReady.next(true);
        })
        .catch(error => alert("hubo error en FakeData: "+error));
    });
  }
  fetchRegistros(): Observable<any[]> {
    if(this.tipo_platform == 'cordova'){
      console.log(this.itemList.value);
      return this.itemList.asObservable();
    }else{
      return this.itemList.asObservable();
    }  
  }
  fillobservable(table,res){
    switch (table) {
      case this.tablePayments:
        let payments: Payments[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              payments.push({ 
                trans: res.rows.item(i).trans,
                pos: res.rows.item(i).pos,  
                linetrans: res.rows.item(i).linetrans,
                formapagoid: res.rows.item(i).formapagoid,
                descformapago: res.rows.item(i).descformapago,
                monto: res.rows.item(i).monto,
                vuelto: res.rows.item(i).vuelto,
                moneda_local: res.rows.item(i).moneda_local,
                monto_divisa: res.rows.item(i).monto_divisa,
                tasa_calculo : res.rows.item(i).tasa_calculo,
                valor_recargo_igtf: res.rows.item(i).valor_recargo_igtf,
                porcentaje_recargo_igtf : res.rows.item(i).porcentaje_recargo_igtf,
              });
            }
          }
          this.itemList.next(payments);
        break;
        
      default:
        break;
    }
  }
  // Recupera Registros
  obtenerRegistros(trans:any){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * FROM ${this.tablePayments} where trans=${trans}`, []).then(res => {
          this.fillobservable(this.tablePayments,res);
          let payments: Payments[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              payments.push({ 
                trans: res.rows.item(i).trans,
                pos: res.rows.item(i).pos,  
                linetrans: res.rows.item(i).linetrans,
                formapagoid: res.rows.item(i).formapagoid,
                descformapago: res.rows.item(i).descformapago,
                monto: res.rows.item(i).monto,
                vuelto: res.rows.item(i).vuelto,
                moneda_local: res.rows.item(i).moneda_local,
                monto_divisa: res.rows.item(i).monto_divisa,
                tasa_calculo : res.rows.item(i).tasa_calculo,
                valor_recargo_igtf: res.rows.item(i).valor_recargo_igtf,
                porcentaje_recargo_igtf : res.rows.item(i).porcentaje_recargo_igtf,
              });
            }
          }
          return payments;
        })
        .catch(error => alert("hubo error en obtenerRegistros con tablePayments: "+this.tablePayments));
    }else{
      return new Promise((resolve) => {
        resolve(this.itemList.value)
      });
    }
  }
  //Insertar
  agregarRegistro(dataInsert: Payments) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = `trans,pos,linetrans,formapagoid,descformapago,monto,vuelto,moneda_local,monto_divisa,tasa_calculo,
      valor_recargo_igtf,porcentaje_recargo_igtf`;
      this.trans = dataInsert.trans;
      data = [dataInsert.trans,dataInsert.pos,dataInsert.linetrans,
        dataInsert.formapagoid,dataInsert.descformapago,dataInsert.monto,
        dataInsert.vuelto,dataInsert.moneda_local,dataInsert.monto_divisa,dataInsert.tasa_calculo,
        dataInsert.valor_recargo_igtf,dataInsert.porcentaje_recargo_igtf];
      return this.storage.executeSql
      (`INSERT INTO ${this.tablePayments}(${campos}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros(dataInsert.trans);
        return res;
      })
      .catch(error => alert("hubo error en agregarRegistro con tablePayments: "+error.message));
    }else{
      return new Promise((resolve) => {
        let data = {
          trans :dataInsert.trans,
          pos :dataInsert.pos,
          linetrans :dataInsert.linetrans,
          formapagoid :dataInsert.formapagoid,
          descformapago :dataInsert.descformapago,
          monto :dataInsert.monto,
          vuelto :dataInsert.vuelto,
          moneda_local :dataInsert.moneda_local,
          monto_divisa :dataInsert.monto_divisa,
          tasa_calculo :dataInsert.tasa_calculo,
          valor_recargo_igtf :dataInsert.valor_recargo_igtf,
          porcentaje_recargo_igtf :dataInsert.porcentaje_recargo_igtf,
        };
        let DataActual:any = this.itemList.value;
        DataActual.push(data)
        this.itemList.next(DataActual);
        resolve(DataActual);
      })
    }
  }
  cleanObservable(){
    let data = []
    this.itemList.next(data);
  }
  //Obtener
  obtenerRegistroTotalPorFecha(fechai,fechaf): Promise<any> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`
                select a.descformapago ,sum(a.monto-a.vuelto) as monto from  ${this.tablePayments} as a
                INNER JOIN saleheader as b on b.trans=a.trans 
                WHERE
                date(b.fechainicio) BETWEEN
                DATE('${fechai}') AND DATE('${fechaf}') and  b.saletype=1 and b.salestatus = 5
                group by descformapago`, []).then(res => { 
        let trans : any[]= [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) { 
            trans.push({ 
              formaDePago: res.rows.item(i).descformapago,
              total: res.rows.item(i).monto
            });
          }
        }
        return trans;
      });
    }else{
      //Escenarios de Prueba
      return new Promise((resolve) => {
        let transactions = [
          {formaDePago: 'EFECTIVO', total : 1000},
          {formaDePago: 'DEBITO', total : 2000},
          {formaDePago: 'DOLARES', total : 3000}
        ];
        resolve(transactions);
      })
    }
  }
  obtenerRegistroTotalPorBusiness(idbusiness): Promise<any> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`
                select a.descformapago ,sum(a.monto-a.vuelto) as monto,a.vuelto from  ${this.tablePayments} as a
                INNER JOIN saleheader as b on b.trans=a.trans 
                WHERE
                b.id_salebusiness = ${idbusiness} and b.saletype=1 and b.salestatus = 5
                group by descformapago`, []).then(res => { 
        console.log(res);
        let trans : any[]= [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) { 
            console.log(res.rows.item(i).vuelto);
            trans.push({ 
              formaDePago: res.rows.item(i).descformapago,
              total: res.rows.item(i).monto
            });
          }
        }
        return trans;
      });
    }else{
      //Escenarios de Prueba
      return new Promise((resolve) => {
        let transactions = [
          {formaDePago: 'EFECTIVO', total : 1000},
          {formaDePago: 'DEBITO', total : 2000},
          {formaDePago: 'DOLARES', total : 3000}
        ];
        resolve(transactions);
      })
    }
  }
}
