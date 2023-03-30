import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Items } from 'src/app/interfaces/generaldb'
import { HttpClient } from '@angular/common/http';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { StartSeedService } from './start-seed.service';
@Injectable({
  providedIn: 'root'
})
export class DbSaleItemsService {
  private storage: SQLiteObject;
  headerList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  itemListIndividual = new BehaviorSubject([]);
  itemListTotal = [];
  respIndividual = [];
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
  tableItems = 'saleitems';
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

  fetchRegistros(): Observable<any[]> {
    if(this.tipo_platform == 'cordova'){
      return this.itemList.asObservable();
    }else{
      return this.itemList.asObservable();
    }  
  }
  fetchRegistrosIndividual(): Observable<any[]> {
    if(this.tipo_platform == 'cordova'){
      return this.itemListIndividual.asObservable();
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
    let items : Items[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) { 
          items.push({ 
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
      this.itemList.next(items);
  }
  
  // Recupera Registros
  obtenerRegistros(trans){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * FROM ${this.tableItems} 
        where trans=${trans} order by linetrans asc`, []).then(res => {
          this.fillobservable(this.tableItems,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con tableItem: "+this.tableItems));
    }else{
      return new Promise((resolve) => {
        console.log(this.itemListTotal);
        resolve(this.itemListTotal);
      })
    }
  }

  //Insertar
  agregarRegistro(dataInsert: Items) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "trans,pos,linetrans,articulo,pludesc,price1,deptid,impuestoid,amtsold,totalivaproducto,cantidadvendido,totalreal";
      data = [dataInsert.trans,dataInsert.pos,dataInsert.linetrans,
        dataInsert.articulo,dataInsert.pludesc,dataInsert.price1,
        dataInsert.deptid,dataInsert.impuestoid,dataInsert.amtsold,
        dataInsert.totalivaproducto,dataInsert.cantidadvendido,dataInsert.totalreal];
      this.trans = dataInsert.trans;
      return this.storage.executeSql
      (`INSERT INTO ${this.tableItems} (${campos}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros(this.trans);
      })
      .catch(error => alert("hubo error en agregarRegistro con Articulos: "+error));
    }else{
      return new Promise((resolve) => {
        let data = {
          trans :dataInsert.trans,
          pos :dataInsert.pos,
          linetrans :dataInsert.linetrans,
          articulo :dataInsert.articulo,
          pludesc :dataInsert.pludesc,
          price1 :dataInsert.price1,
          deptid :dataInsert.deptid,
          impuestoid :dataInsert.impuestoid,
          amtsold :dataInsert.amtsold,
          totalivaproducto :dataInsert.totalivaproducto,
          cantidadvendido :dataInsert.cantidadvendido,
          devueltos :dataInsert.devueltos,
          anulado :dataInsert.anulado,
          totalreal :dataInsert.totalreal,
          descuentoitem :dataInsert.descuentoitem
        }
        let DataActual : any = this.itemList.value;
        DataActual.push(data);
       // this.itemList.next(data); 
       this.itemList.next(DataActual);
        this.itemListTotal.push(data); //Para simulacion correcta
        resolve(data);
      })
    }
  }
  cleanObservable(){
    let data = []
    this.itemList.next(data);
    return new Promise((resolve) => {resolve('OK')});
  }
  async obtenerRegistroIndividual(trans,linetrans){
    if(this.tipo_platform == 'cordova'){
      await this.storage.executeSql(`SELECT * FROM ${this.tableItems} 
      where trans=${trans} and linetrans=${linetrans}`, []).then(res => {
       // this.fillobservableIndividual(res);
       this.respIndividual = res;
      })
      return this.respIndividual;
     // .catch(error => alert("hubo error en obtenerRegistroIndividual con tableItem: "+this.tableItems));
    }else{
      return new Promise((resolve) => {
        let DataActual : any = this.itemList.value;
        console.log(DataActual);
        let data = DataActual.find(element => element.linetrans == linetrans);
        resolve(data);
      })
    }
  }
  actualizarRegistroIndividual(trans,linetrans,dataUpdate){
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      data = [dataUpdate.amtsold,dataUpdate.totalivaproducto,dataUpdate.cantidadvendido,dataUpdate.totalreal];
      return this.storage.executeSql(`UPDATE ${this.tableItems} SET 
      amtsold = ?, totalivaproducto = ?, cantidadvendido = ?, totalreal = ?
      WHERE trans = ${trans} and linetrans=${linetrans}`, data)
     .then(data => {
      this.obtenerRegistros(trans);
     })
      .catch(error => alert("hubo error en actualizarRegistroIndividual con tableItem: "+this.tableItems));
    }else{
      return new Promise((resolve) => {
        //Obtengo el array completo
        let DataActual : any = this.itemList.value;
        //Obtengo los resultados asociados
        let dataLinea = DataActual.find(element => element.linetrans == linetrans);
        //Busco el indice de esa linea
        let dataLineaIndex = DataActual.findIndex(element => element.linetrans == linetrans);
        //Modifico array
        dataLinea.amtsold=dataUpdate.amtsold;
        dataLinea.totalivaproducto=dataUpdate.totalivaproducto;
        dataLinea.cantidadvendido=dataUpdate.cantidadvendido;
        dataLinea.totalreal=dataUpdate.totalreal;
        console.log(dataLinea);
        DataActual.splice(dataLineaIndex,1,dataLinea);
        this.itemList.next(DataActual);
        resolve(dataLinea);
      })
    }
  }
  eliminarRegistro(trans,linetrans){
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`DELETE FROM ${this.tableItems}
      WHERE trans = ${trans} and linetrans=${linetrans}`, [])
     .then(data => {
      this.obtenerRegistros(trans);
     })
      .catch(error => alert("hubo error en eliminarRegistro con tableItem: "+this.tableItems));
    }else{
      return new Promise((resolve) => {
        //Obtengo el array completo
        let DataActual : any = this.itemList.value;
        //Obtengo los resultados asociados
        let dataLinea = DataActual.find(element => element.linetrans == linetrans);
        //Busco el indice de esa linea
        let dataLineaIndex = DataActual.findIndex(element => element.linetrans == linetrans);
        //Elimino
        let arrayEliminado = DataActual.splice(dataLineaIndex,1);
        this.itemList.next(DataActual);
        resolve(DataActual);
      })
    }
  }
  //Recuoerar la ultima linea de TRX
  async getLastTrx(trx){
    if(this.tipo_platform == 'cordova'){
      let trans;
      return await this.storage.executeSql(`SELECT max(linetrans) as linetrans FROM ${this.tableItems} 
      where trans=${trx}`, []).then(res => {      
        return {trans : res.rows.item(0).linetrans}
      });
    }else{
      return {trans : this.trans};
    }
  }
   //Obtener
   obtenerRegistroMoreMinusPorFecha(fechai,fechaf,action,number): Promise<any> {
    if(this.tipo_platform == 'cordova'){
      let actionSql : string;
      if(action == 'MenosVendido')
        actionSql = 'ASC';
      else
        actionSql = 'DESC';
      return this.storage.executeSql(`
        select a.pludesc ,sum(a.cantidadvendido) as cantidadvendido from  ${this.tableItems} as a
        INNER JOIN saleheader as b on b.trans=a.trans 
        WHERE
        date(b.fechainicio) BETWEEN
        DATE('${fechai}') AND DATE('${fechaf}') and  b.saletype=1 and b.salestatus = 5
        group by pludesc order by cantidadvendido ${actionSql} limit ${number}`, []).then(res => { 
        let trans : any[]= [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) { 
            trans.push({ 
              articulo: res.rows.item(i).pludesc,
              cantidad: res.rows.item(i).cantidadvendido
            });
          }
        }
        return trans;
      });
    }else{
      //Escenarios de Prueba
      return new Promise((resolve) => {
        let transactions = [
          {articulo: 'PERAS', cantidad : 1},
          {articulo: 'MANZANAS', cantidad : 2000},
          {articulo: 'UVAS', cantidad : 30000},
          {articulo: 'MANDARINA', cantidad : 150000},
          {articulo: 'MELON', cantidad : 2000000}
        ];
        resolve(transactions);
      })
      
    }
      
  }
}
