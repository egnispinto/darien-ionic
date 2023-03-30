import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Foot } from 'src/app/interfaces/generaldb'
import { HttpClient } from '@angular/common/http';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { StartSeedService } from './start-seed.service';
@Injectable({
  providedIn: 'root'
})
export class DbSaleFootService {
  private storage: SQLiteObject;
  headerList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
  tableFooter = 'salefoot';
  trans;
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
      return this.itemList.asObservable();
    }else{
      let Data = [];
      this.itemList.next(Data);
      return this.itemList.asObservable();
    }  
  }
  fillobservable(table,res){
    switch (table) {
      case this.tableFooter:
        let foot: Foot[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {     
              foot.push({ 
                trans: res.rows.item(i).trans,
                pos: res.rows.item(i).pos,  
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
                nombre: res.rows.item(i).nombre,
              });
            }
          }
          this.itemList.next(foot);
        break;
        
      default:
        break;
    }
  }
  // Recupera Registros
  obtenerRegistros(trans){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * FROM ${this.tableFooter} where trans=${trans}`, []).then(res => {
          this.fillobservable(this.tableFooter,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con tableFooter: "+this.tableFooter));
    }
  }
  //Insertar
  agregarRegistro(dataInsert: Foot) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "trans,pos,linetrans,hora,fecha,neto,bruto,iva,montoimpuesto,numeroz,factura,impresora,clienteid,nombre";
      console.log(campos);
      data = [dataInsert.trans,dataInsert.pos,dataInsert.linetrans,
        dataInsert.hora,dataInsert.fecha,dataInsert.neto,
        dataInsert.bruto,dataInsert.iva,dataInsert.montoimpuesto,
        dataInsert.numeroz,dataInsert.factura,dataInsert.impresora,
        dataInsert.clienteid,dataInsert.nombre];
      this.trans = dataInsert.trans;
      console.log(data);
      return this.storage.executeSql
      (`INSERT INTO ${this.tableFooter}(${campos}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros(this.trans);
      })
      .catch(error => {console.log(error); console.log(`esto es Agregar en Footer`)});
    }else{
      return new Promise((resolve) => {
        let data = [{
          trans :dataInsert.trans,
          pos :dataInsert.pos,
          linetrans :dataInsert.linetrans,
          hora :dataInsert.hora,
          fecha :dataInsert.fecha,
          neto :dataInsert.neto,
          bruto :dataInsert.bruto,
          iva :dataInsert.iva,
          montoimpuesto :dataInsert.montoimpuesto,
          numeroz :dataInsert.numeroz,
          factura :dataInsert.factura,
          impresora :dataInsert.impresora,
          clienteid :dataInsert.clienteid,
          nombre :dataInsert.nombre
        }]
      
        this.itemList.next(data);
        resolve(data);
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
                select b.fechainicio as fecha,sum(a.bruto) as bruto from  ${this.tableFooter} as a
                INNER JOIN saleheader as b on b.trans=a.trans 
                WHERE
                date(b.fechainicio) BETWEEN
                DATE('${fechai}') AND DATE('${fechaf}') and  b.saletype=1 and b.salestatus = 5`, []).then(res => { 
        let trans : any[]= [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) { 
            trans.push({ 
              fecha: res.rows.item(i).fecha,
              bruto: res.rows.item(i).bruto
            });
          }
        }
        return trans;
      });
    }else{
      //Escenarios de Prueba
      return new Promise((resolve) => {
        let transactions = [
          {fecha: '2021-04-01', bruto : 1000},
          {fecha: '2021-04-02', bruto : 2000},
          {fecha: '2021-04-03', bruto : 3000},
          {fecha: '2021-04-04', bruto : 4000},
          {fecha: '2021-04-05', bruto : 5000},
          {fecha: '2021-04-06', bruto : 6000}
        ];
        resolve(transactions);
      })
      
    }
  }
  //Obtener
  obtenerRegistroTotalPorBusiness(idbusiness,saletype,salestatus): Promise<any> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`
                select  sum(a.neto) as neto,  sum(a.iva) as iva, sum(a.bruto) as bruto 
                from  ${this.tableFooter} as a
                INNER JOIN saleheader as b on b.trans=a.trans 
                WHERE
                b.id_salebusiness = ${idbusiness} and  b.saletype=${saletype} 
                and b.salestatus = ${salestatus}`, []).then(res => { 
        let trans : any[]= [];
        console.log(res);
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) { 
            trans.push({ 
              neto: res.rows.item(i).neto,
              iva: res.rows.item(i).iva,
              bruto: res.rows.item(i).bruto
            });
          }
        }
        return trans;
      });
    }else{
      //Escenarios de Prueba
      return new Promise((resolve) => {
        let transactions = [
          {neto: 1000, iva: 200, bruto : 1200}
        ];
        resolve(transactions);
      })
      
    }
  }
}
