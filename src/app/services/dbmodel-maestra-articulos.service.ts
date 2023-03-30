import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Articulos} from 'src/app/interfaces/generaldb';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { StartSeedService } from './start-seed.service';

@Injectable({
  providedIn: 'root'
})

export class DbmodelMaestraArticulosService {
  private storage: SQLiteObject;
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables
  tablaClase = 'maestra_articulos';
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
    private startSeed : StartSeedService
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
              this.obtenerRegistros();
              this.isDbReady.next(true);
             // this.getFakeData();
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
      //return this.isDbReady.asObservable();
      if(this.tipo_platform == 'cordova'){
        return this.isDbReady.asObservable();
      }else{
        //Browser
        this.isDbReady.next(true);
        return this.isDbReady.asObservable();
      }
  }

  fetchRegistros(): Observable<any[]> {
    if(this.tipo_platform=='cordova'){
      return this.itemList.asObservable();
    }else{
      let Data = [
        {id: '1', name_articulo:'Greninja', price_bs: 1900000.05, price_usd: '1', id_dpto : '1',
          id_impuesto : '2', url_img: 'https://cdn.traction.one/pokedex/pokemon/657.png', requiere_peso:'false',
          requiere_precio:'false'},
        {id: '2', name_articulo:'Camisa', price_bs: 1000000.85, price_usd: '1', id_dpto : '2',
          id_impuesto : '2', url_img: '', requiere_peso:'false',
          requiere_precio:'true'},
        {id: '3', name_articulo:'Reloj', price_bs: 5000000.987, price_usd: '1', id_dpto : '2',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
        {id: '4', name_articulo:'Pizza', price_bs: 2100000.14, price_usd: '1', id_dpto : '2',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
           {id: '5', name_articulo:'Zapatos', price_bs: 1900000.05, price_usd: '1', id_dpto : '2',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
        {id: '6', name_articulo:'Camisa', price_bs: 1000000.85, price_usd: '1', id_dpto : '2',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
        {id: '7', name_articulo:'Reloj', price_bs: 5000000.987, price_usd: '1', id_dpto : '1',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
        {id: '8', name_articulo:'Pizza', price_bs: 2100000.14, price_usd: '1', id_dpto : '1',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
          {id: '9', name_articulo:'Zapatos', price_bs: 1900000.05, price_usd: '1', id_dpto : '1',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
        {id: '10', name_articulo:'Camisa', price_bs: 1000000.85, price_usd: '1', id_dpto : '1',
          id_impuesto : '2', url_img: '/assets/items/Imagen1.gif', requiere_peso:'false',
          requiere_precio:'false'},
       
      ]
      this.itemList.next(Data);
      return this.itemList.asObservable();
    }
  }
  // Render fake data
  getFakeData() {
    this.httpClient.get(
      'assets/dump.sql', 
      {responseType: 'text'}
    ).subscribe(data => {
      this.sqlPorter.importSqlToDb(this.storage, data)
        .then(_ => {
          this.obtenerRegistros();
          this.isDbReady.next(true);
        })
        .catch(error => alert("hubo error en FakeData: "+error));
    });
  }
 
  fillobservable(table,res){
    switch (table) {
      case this.tablaClase:
        let item: Articulos[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              item.push({ 
                id: res.rows.item(i).id,
                name_articulo: res.rows.item(i).name_articulo,  
                price_bs: res.rows.item(i).price_bs,
                price_usd: res.rows.item(i).price_usd,
                id_dpto: res.rows.item(i).id_dpto,
                id_impuesto: res.rows.item(i).id_impuesto,
                url_img: res.rows.item(i).url_img,
                requiere_peso: res.rows.item(i).requiere_peso,
                requiere_precio: res.rows.item(i).requiere_precio,
              });
            }
          }
          this.itemList.next(item);
        break;
        
      default:
        break;
    }
  }
  // Recupera Registros
  obtenerRegistros(){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT a.id,a.name_articulo,
        (a.price_bs*(CAST(b.valor_impuesto as FLOAT)/10000))+a.price_bs as price_bs,
        (a.price_usd*(CAST(b.valor_impuesto as FLOAT)/10000))+a.price_usd as price_usd,
        a.id_dpto,a.id_impuesto,a.url_img,a.requiere_peso,a.requiere_precio
        FROM ${this.tablaClase} as a
        left join tienda_impuestos as b on a.id_impuesto=b.id`, []).then(res => {
          this.fillobservable(this.tablaClase,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con Articulos: "+error.message));
    }
  } 

  borrarRegistro(id){
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`DELETE FROM  ${this.tablaClase} WHERE id = ${id}`,[])
      .then(_ => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en borrarRegistro Articulos: "+error));
    }else{
      console.log(this.tablaClase);
      console.log(id);
      return new Promise((resolve) => {resolve('OK')});
    }
  }

  obtenerRegistro(id): Promise<Articulos> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT * FROM ${this.tablaClase} WHERE id = "${id}"`, []).then(res => { 
        return {
          id: res.rows.item(0).id,
          name_articulo: res.rows.item(0).name_articulo,  
          price_bs: res.rows.item(0).price_bs,
          price_usd: res.rows.item(0).price_usd,
          id_dpto: res.rows.item(0).id_dpto,
          id_impuesto: res.rows.item(0).id_impuesto,
          url_img: res.rows.item(0).url_img,
          requiere_peso: res.rows.item(0).requiere_peso,
          requiere_precio: res.rows.item(0).requiere_precio,
        }
      });
    }else{
      //Escenarios de Prueba
      return new Promise((resolve) => {
        let dataToda = this.itemList.value;
        let data = dataToda.find(element => element.id == id);
        resolve(data);
      })
      
    }
      
  }
  actualizarRegistro(id,dataUpdate : Articulos){
    if(this.tipo_platform == 'cordova'){
      let priceBs = dataUpdate.price_bs;
      let data = [dataUpdate.name_articulo,priceBs,dataUpdate.price_usd,
        dataUpdate.id_dpto,dataUpdate.id_impuesto,dataUpdate.url_img,dataUpdate.requiere_peso,
        dataUpdate.requiere_precio];
        return this.storage.executeSql(`UPDATE ${this.tablaClase} SET 
        name_articulo = ?, price_bs = ?, price_usd = ?, id_dpto = ?, id_impuesto = ?, url_img = ?,
        requiere_peso = ?, requiere_precio = ?
        WHERE id = "${id}"`, data)
      .then(data => {
        this.obtenerRegistros();
      })
    }else{//Browser
      return new Promise(function (resolve, reject) {
        let priceBs = dataUpdate.price_bs.split('.').join('');
        priceBs = priceBs.replace(',','.');
        let data = {
          id: '1',
          name_articulo: 'Articulo Prueba',  
          price_bs: priceBs,
          price_usd: '1',
          id_dpto : '1',
          id_impuesto : '2',
          url_img : '/assets/items/Imagen1.gif'
        }
        resolve(data);
      })
    }
  }
  agregarRegistro(dataInsert: Articulos) {
    if(this.tipo_platform == 'cordova'){
      console.log(dataInsert);
      let data : any [];
      let campos : string = "name_articulo, price_bs, price_usd,id_dpto,id_impuesto,url_img,requiere_peso,requiere_precio";
      let priceBs = dataInsert.price_bs.split('.').join('');
      priceBs = priceBs.replace(',','.');
      data = [dataInsert.name_articulo,priceBs,dataInsert.price_usd,
        dataInsert.id_dpto,dataInsert.id_impuesto,dataInsert.url_img,dataInsert.requiere_peso,dataInsert.requiere_precio];
      return this.storage.executeSql
      (`INSERT INTO ${this.tablaClase}(${campos}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros();
        return res;
      })
      .catch(error => alert("hubo error en agregarRegistro con Articulos: "+error));
    }else{
      let priceBs = dataInsert.price_bs.split('.').join('');
      priceBs = priceBs.replace(',','.');
      console.log(priceBs);
      return new Promise(function (resolve, reject) {
        let data = {
          insertId: 1,
          id: '1',
          name_articulo: 'Articulo Prueba',  
          price_bs: '1900000',
          price_usd: '1',
          id_dpto : '1',
          id_impuesto : '2',
          url_img : '/assets/items/Imagen1.gif'
        } 
        resolve(data);
      })
    }
  }

  agregarRegistroCloud(dataInsert: Articulos) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "id,name_articulo, price_bs, price_usd,id_dpto,id_impuesto,url_img,requiere_peso";
      let priceBs = dataInsert.price_bs;
      priceBs = priceBs.replace(',','.');
      data = [dataInsert.id,dataInsert.name_articulo,priceBs,dataInsert.price_usd,
        dataInsert.id_dpto,dataInsert.id_impuesto,dataInsert.url_img,dataInsert.requiere_peso];
      return this.storage.executeSql
      (`INSERT INTO ${this.tablaClase}(${campos}) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en agregarRegistro con Articulos: "+error));
    }else{
      let priceBs = dataInsert.price_bs.split('.').join('');
      priceBs = priceBs.replace(',','.');
      return new Promise(function (resolve, reject) {
        let data = {
          insertId: 1,
          id: '1',
          name_articulo: 'Articulo Prueba',  
          price_bs: '1900000',
          price_usd: '1',
          id_dpto : '1',
          id_impuesto : '2',
          url_img : '/assets/items/Imagen1.gif'
        } 
        resolve(data);
      })
    }
  }

  actualizarPrecioTasa(tasa){
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      return this.storage.executeSql(`UPDATE ${this.tablaClase} SET 
         price_bs=round(price_usd*${tasa},2) where price_usd > 0`, data)
        .then(data => {
          this.obtenerRegistros();
        })
      .catch(error => alert("hubo error en actualizarPrecioTasa con Articulos: "+error));
    }else{
      return new Promise(function (resolve, reject) {
        resolve('OK');
      })
    }
  }
}

