import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Header } from 'src/app/interfaces/generaldb'
import { HttpClient } from '@angular/common/http';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { StartSeedService } from './start-seed.service';
@Injectable({
  providedIn: 'root'
})

export class DbSaleHeaderService {
  private storage: SQLiteObject;
  headerList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
  tableHeader = 'saleheader';
  trans : Number = 0;
  dataHeader : any[];
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
        })
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
  fetchRegistros(): Observable<any[]> {
    if(this.tipo_platform == 'cordova'){
     // this.obtenerRegistros();
      return this.itemList.asObservable();
    }else{
      let Data = [];
      this.itemList.next(Data);
      return this.itemList.asObservable();
    }  
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
  fillobservable(table,res){
    switch (table) {
      case this.tableHeader:
        let header: any[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              if(res.rows.item(i).salestatus == 1 && res.rows.item(i).saletype == 1){ //1 es Activa && 1 es Venta
                header.push({ 
                  trans: res.rows.item(i).trans,
                  pos: res.rows.item(i).pos,  
                  linetrans: res.rows.item(i).linetrans,
                  saletype: res.rows.item(i).saletype,
                  salestatus: res.rows.item(i).salestatus,
                  printerstatus: res.rows.item(i).printerstatus,
                  fechainicio: res.rows.item(i).fechainicio,
                  horainicio: res.rows.item(i).horainicio,  
                  fechaculminacion: res.rows.item(i).fechaculminacion,
                  horaculminacion: res.rows.item(i).horaculminacion,
                  cajero: res.rows.item(i).cajero,
                  id_salebusiness: res.rows.item(i).id_salebusiness,
                  recargo: res.rows.item(i).recargo,
                  porcentaje_recargo : res.rows.item(i).porcentaje_recargo
                });
              }
            }
          }
          this.itemList.next(header);
        break;
        
      default:
        break;
    }
  }
  fillHeader(res){
    let header: any[] = [];
    if (res.rows.length > 0) {
      for (var i = 0; i < res.rows.length; i++) { 
        header.push({ 
          trans: res.rows.item(i).trans,
          pos: res.rows.item(i).pos,  
          linetrans: res.rows.item(i).linetrans,
          saletype: res.rows.item(i).saletype,
          salestatus: res.rows.item(i).salestatus,
          printerstatus: res.rows.item(i).printerstatus,
          fechainicio: res.rows.item(i).fechainicio,
          horainicio: res.rows.item(i).horainicio,  
          fechaculminacion: res.rows.item(i).fechaculminacion,
          horaculminacion: res.rows.item(i).horaculminacion,
          cajero: res.rows.item(i).cajero,
          id_salebusiness: res.rows.item(i).id_salebusiness,
          recargo: res.rows.item(i).recargo,
          porcentaje_recargo : res.rows.item(i).porcentaje_recargo
        });
      }
    }
    return header;
  }
  // Recupera Registros
  obtenerRegistros(){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * FROM ${this.tableHeader}
        order by trans desc limit 1`, []).then(res => {
          this.fillobservable(this.tableHeader,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con tableHeader: "+this.tableHeader));
    }
  }
  obtenerRegistroSinObservable(){
    if(this.tipo_platform == 'cordova'){
      let header :any[] = [];
      return this.storage.executeSql(`SELECT * FROM ${this.tableHeader} 
      order by trans desc limit 1`, []).then(res => {
         //Prueba
         header.push({ 
            trans: res.rows.item(0).trans,
            pos: res.rows.item(0).pos,  
            linetrans: res.rows.item(0).linetrans,
            saletype: res.rows.item(0).saletype,
            salestatus: res.rows.item(0).salestatus,
            printerstatus: res.rows.item(0).printerstatus,
            fechainicio: res.rows.item(0).fechainicio,
            horainicio: res.rows.item(0).horainicio,  
            fechaculminacion: res.rows.item(0).fechaculminacion,
            horaculminacion: res.rows.item(0).horaculminacion,
            cajero: res.rows.item(0).cajero,
            id_salebusiness: res.rows.item(0).id_salebusiness,
            recargo: res.rows.item(0).recargo,
            porcentaje_recargo : res.rows.item(0).porcentaje_recargo
          });
          return header;
      })
      .catch(error => alert("hubo error en obtenerRegistroSinObservable con tableHeader: "+this.tableHeader));
    }else{
      this.trans = 1;
      return new Promise((resolve) => {
        let data = [
          {
            trans : 1,
            pos : 1,
            linetrans : 1,
            saletype : 1,
            salestatus : 1,
            printerstatus : 0,
            fechainicio : '2021-08-25',
            horainicio : '14:00',
            fechaculminacion : '',
            horaculminacion : '',
            cajero : 1,
            id_salebusiness : 1,
            recargo: 'true',
            porcentaje_recargo : '3'
          }
        ]
        this.itemList.next(data);
        resolve(data);
      })
    }
  }
  //Insertar
  async agregarRegistro(dataInsert: Header) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "pos,linetrans,saletype,salestatus,printerstatus,fechainicio,horainicio,fechaculminacion,horaculminacion,cajero,id_salebusiness";
      data = [dataInsert.pos,dataInsert.linetrans,dataInsert.saletype,
        dataInsert.salestatus,dataInsert.printerstatus,
        dataInsert.fechainicio,dataInsert.horainicio,dataInsert.fechaculminacion,
        dataInsert.horaculminacion,dataInsert.cajero,dataInsert.id_salebusiness];
      let header :any[] = [];
      await this.storage.executeSql
      (`INSERT INTO ${this.tableHeader}(${campos}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros();
        this.dataHeader = res;
      })
      .catch(error => console.log("hubo error en agregarRegistro con Header: "+error));
    }else{
      this.trans = 1;
      return new Promise((resolve) => {
        let data = [
          {
            trans : this.trans,
            pos : dataInsert.pos,
            linetrans : dataInsert.linetrans,
            saletype : dataInsert.saletype,
            salestatus : dataInsert.salestatus,
            printerstatus : dataInsert.printerstatus,
            fechainicio : dataInsert.fechainicio,
            horainicio : dataInsert.horainicio,
            fechaculminacion : dataInsert.fechaculminacion,
            horaculminacion : dataInsert.horaculminacion,
            cajero : dataInsert.cajero,
            id_salebusiness : dataInsert.id_salebusiness,
          }
        ]
        this.itemList.next(data);
        resolve(data);
      })
    }
  }
  actualizarSaleTypeHeader(trans,salestatus){
    if(this.tipo_platform == 'cordova'){
      let data : any [];
     return this.storage.executeSql(`UPDATE ${this.tableHeader} SET 
     salestatus = ${salestatus}
      WHERE trans = ${trans}`, [])
     .then(data => {
     })
      .catch(error => alert("hubo error en actualizarSaleTypeHeader con tableheader: "+this.tableHeader));
    }
  }
  cleanObservable(){
    let data = []
    this.itemList.next(data);
  }
  //Actualizar

  //Obtener
  obtenerRegistroPorFecha(fechai,fechaf): Promise<any> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT trans FROM ${this.tableHeader} WHERE date(fechainicio) BETWEEN 
      DATE('${fechai}') AND DATE('${fechaf}') and salestatus=5`, []).then(res => { 
        let trans : any[]= [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) { 
            trans.push({ 
              trans: res.rows.item(i).trans
            });
          }
        }
        return trans;
      });
    }else{
      //Escenarios de Prueba
      return new Promise((resolve) => {
        let transactions = [
          {trans: '1'},
          {trans: '2'},
          {trans: '3'},
          {trans: '5'},
          {trans: '7'},
          {trans: '8'},
        ];
        resolve(transactions);
      })
      
    }
      
  }


  //Usado para recargo
  //El porcentaje recargo ya no tendra el porcentaje sino el monto que se recargo
  actualizarRecargo(trans,recargo,porcentaje_recargo){
    console.log(`Recibi ${recargo} y ${porcentaje_recargo}`);
    if(this.tipo_platform == 'cordova'){
      let data : any [];
     return this.storage.executeSql(`UPDATE ${this.tableHeader} SET 
     recargo = ${recargo}, porcentaje_recargo = ${porcentaje_recargo}
      WHERE trans = ${trans}`, [])
     .then(data => {
      this.obtenerRegistros();
     })
      .catch(error => alert("hubo error en actualizarRecargo con tableheader: "+this.tableHeader));
    }
  }

  
}
