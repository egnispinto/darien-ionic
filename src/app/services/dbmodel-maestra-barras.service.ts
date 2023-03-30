import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Barras} from 'src/app/interfaces/generaldb';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { StartSeedService } from './start-seed.service';

@Injectable({
  providedIn: 'root'
})

export class DbmodelMaestraBarrasService {
  private storage: SQLiteObject;
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables
  tablaClase = 'maestra_barras';
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
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
    if(this.tipo_platform == 'cordova'){
      return this.isDbReady.asObservable();
    }else{
      //Browser
      this.isDbReady.next(true);
      return this.isDbReady.asObservable();
    }
  }

  fetchRegistros(): Observable<any[]> {
        return this.itemList.asObservable();
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
          .catch(error => alert("hubo error en FakeData:maestra_barras"+error));
      });
    
  }
 
  fillobservable(table,res){
    switch (table) {
      case this.tablaClase:
        let items: Barras[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              items.push({ 
                id: res.rows.item(i).id,
                cod_barra: res.rows.item(i).cod_barra,  
                id_articulo: res.rows.item(i).id_articulo
              });
            }
          }
          this.itemList.next(items);
        break;
        
      default:
        break;
    }
  }
  // Recupera Registros
  obtenerRegistros(){
    if(this.tipo_platform == 'cordova'){ 
        return this.storage.executeSql(`SELECT * FROM ${this.tablaClase}`, []).then(res => {
          this.fillobservable(this.tablaClase,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con maestra_barras: "+error));
    }else{
      let Data = [
        {id:1, cod_barra:'123456', id_articulo:'1'},
        {id:2, cod_barra:'252525', id_articulo:'2'},
        {id:3, cod_barra:'353535', id_articulo:'3'},
        {id:4, cod_barra:'454545', id_articulo:'4'},
        {id:5, cod_barra:'555555', id_articulo:'5'},
        {id:6, cod_barra:'656565', id_articulo:'6'},
        {id:7, cod_barra:'757575', id_articulo:'7'},
      ];
        this.itemList.next(Data);
        return new Promise(function (resolve) {
          resolve(Data);
        })
    }
  }

  borrarRegistro(id){
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`DELETE FROM  ${this.tablaClase} WHERE id = ${id}`,[])
      .then(_ => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en borrarRegistro maestra_barras: "+error));
    }else{
      console.log(this.tablaClase);
      console.log(id);
    }
  }
  borrarRegistroCloud(id){
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`DELETE FROM  ${this.tablaClase} WHERE cod_barra = ${id}`,[])
      .then(_ => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en borrarRegistro maestra_barras: "+error));
    }else{
      console.log(this.tablaClase);
      console.log(id);
    }
  }
  obtenerRegistro(id): Promise<Barras> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT * FROM ${this.tablaClase} WHERE id = ${id}`, []).then(res => { 
        return {
          id: res.rows.item(0).id,
          cod_barra: res.rows.item(0).cod_barra,  
          id_articulo: res.rows.item(0).id_articulo
        }
      });
    }else{
      //Escenarios de Prueba
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          cod_barra: '1',  
          id_articulo: '1'
        }
        resolve(data);
      })
      
    }
      
  }
  actualizarRegistro(id,dataUpdate : Barras){
    if(this.tipo_platform == 'cordova'){
        let data = [dataUpdate.id_articulo,dataUpdate.cod_barra];
         return this.storage.executeSql(`UPDATE ${this.tablaClase} SET 
         id_articulo = ?, cod_barra = ? WHERE id = ${id}`, data)
        .then(data => {
          this.obtenerRegistros();
        })
    }else{//Browser
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          id_articulo: '1',  
          cod_barra: '1'
        }
        resolve(data);
      })
    }
  }
  actualizarRegistroCloud(id,dataUpdate : Barras){
    if(this.tipo_platform == 'cordova'){
        let data = [dataUpdate.id_articulo];
         return this.storage.executeSql(`UPDATE ${this.tablaClase} SET 
         id_articulo = ? WHERE cod_barra = ${id}`, data)
        .then(data => {
          this.obtenerRegistros();
        })
    }else{//Browser
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          id_articulo: '1',  
          cod_barra: '1'
        }
        resolve(data);
      })
    }
  }
  agregarRegistro(dataInsert: Barras) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "cod_barra, id_articulo";
      data = [dataInsert.cod_barra,dataInsert.id_articulo];
      return this.storage.executeSql
      (`INSERT INTO ${this.tablaClase}(${campos}) 
      VALUES (?, ?)`,data)
      .then(res => {
        this.obtenerRegistros();
        return res;
      })
      .catch(error => alert("hubo error en agregarRegistro con maestra_barras: "+error));
    }else{
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          id_articulo: '1',  
          cod_barra: '1'
        }
        resolve(data);
      })
    }
  }
  borrarRegistroArticulo(idCodArticulo:any) {
    if(this.tipo_platform == 'cordova'){
      let data : any []
      return this.storage.executeSql
      (`DELETE FROM ${this.tablaClase} WHERE id_articulo=${idCodArticulo}`,data)
      .then(res => {
        this.obtenerRegistros();
        return res; 
      })
      .catch(error => alert("hubo error en borrarRegistroArticulo con maestra_barras: "+error));
    }else{
      return new Promise(function (resolve) {
        let data = {
          id: '1',
          id_articulo: '1',  
          cod_barra: '1'
        }
        resolve(data);
      })
    }
  }
}

