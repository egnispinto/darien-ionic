import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbmodelSaleService {
  private storage: SQLiteObject;
  headerList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
  tableHeader = 'saleheader';
  tableItem = 'saleitems';
  tablePayments = 'salepayments';
  tableFoot = 'salefoot';
  //Arrays de datos para pruebas
  DataHeader : any[];
  DataItem : any[];
  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
  ) { 
    this.platform.ready().then((readySource) => {
      if(readySource=='cordova'){
        this.sqlite.create({
          name: 'z012BPM.db',
          location: 'default'
        })
        .then((db: SQLiteObject) => {
            this.storage = db;
            this.isDbReady.next(true);
            //this.getFakeData();
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
  // Render fake data
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
  /* 
    Busca la ultima TRX insertada en la tabla saleheader
  */
  async getLastTrx(): Promise<any>{
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT trans FROM ${this.tableHeader} limit 1 order by desc`, []).then(res => { 
        return {
          trans: res.rows.item(0).trans
        }
      });
    }else{
      //Escenarios de Prueba
      return new Promise(function (resolve, reject) {
        let data = {
          trans: '1'
        }
        resolve(data);
      })
    }
  }
  async findStatusRowHeader(valorTrx,campo:string): Promise<any>{
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT ${campo} as field FROM ${this.tableHeader} where trans='${valorTrx}'`, []).then(res => { 
        return {
          trans: res.rows.item(0).field
        }
      });
    }else{
      //Escenarios de Prueba
      return new Promise(function (resolve, reject) {
        let data = {
          field: '5'
        }
        resolve(data);
      })
    }
  }

  //Tablas para recuperar datos ddel articulo

  fetchRegistrosItem(): Observable<any[]> {
    if(this.tipo_platform=='cordova'){
      return this.itemList.asObservable();
    }else{
      this.itemList.next(this.DataItem);
      return this.itemList.asObservable();
    }
  }
  fillobservableItem(table,res){
    let itemslist: any[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) { 
          itemslist.push({ 
            trans: res.rows.item(i).trans,  
            pos: res.rows.item(i).pos,
            linetrans: res.rows.item(i).linetrans,
            articulo: res.rows.item(i).articulo,
            pludesc: res.rows.item(i).pludesc,
            price1: res.rows.item(i).price1,
            deptid: res.rows.item(i).deptid,
            impuestoid: res.rows.item(i).impuestoid,
            amtsold: res.rows.item(i).amtsold,
            totalivaproducto: res.rows.item(i).totalivaproducto,
            cantidadvendido: res.rows.item(i).cantidadvendido,
            devueltos: res.rows.item(i).devueltos,
            anulado: res.rows.item(i).anulado,
            totalreal: res.rows.item(i).totalreal,
            descuentoitem: res.rows.item(i).descuentoitem
          });
        }
      }
      this.itemList.next(itemslist);
       
  }
  obtenerRegistrosItem(trx){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * FROM ${this.tableItem} where trans = '${trx}'`)
        .then(res => {
          this.fillobservableItem(this.tableItem,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con obtenerRegistrosItem: "+error));
    }
  }


  //metodos para recuperar datos del header
  fetchRegistrosHeader(): Observable<any[]> {
    if(this.tipo_platform=='cordova'){
      return this.headerList.asObservable();
    }else{
      this.headerList.next(this.DataHeader);
      return this.headerList.asObservable();
    }
  }
  crearHeader(dataInsert) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "pos,linetrans,saletype,fechainicio,horainicio,fechaculminacion,horaculminacion,cajero";
      data = [dataInsert.pos,dataInsert.linetrans,dataInsert.saletype,
        dataInsert.fechainicio,dataInsert.horainicio,dataInsert.fechaculminacion,
        dataInsert.horaculminacion,dataInsert.cajero
      ];
      return this.storage.executeSql
      (`INSERT INTO ${this.tableHeader}(${campos}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,data)
      .then(res => {
        console.log(this.getLastTrx());
      })
      .catch(error => alert("hubo error en agregarRegistro con Articulos: "+error));
    }else{
      return new Promise(function (resolve, reject) {
        let data = {
          pos : '1',
          linetrans : '0',
          saletype : '1',
          fechainicio : Date,
          horainicio : Date,
          fechaculminacion : '',
          horaculminacion : '',
          cajero : '1'
        }
        this.DataHeader.push(data)
        resolve('ok');
      })
    }
  }

} //Fin de la clase del servicio
