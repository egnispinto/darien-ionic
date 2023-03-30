import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Impuestos} from 'src/app/interfaces/generaldb';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { StartSeedService } from './start-seed.service';

@Injectable({
  providedIn: 'root'
})

export class DbmodelTiendaImpuestosService {
  private storage: SQLiteObject;
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables
  impuestosList = new BehaviorSubject([]);
  tablaClase = 'tienda_impuestos';
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
                //this.getFakeData();
            });
          }
        });
        
        //Add
        this.tipo_platform = readySource;
      }else{ //Fin de Cordova
        this.tipo_platform = "browser";
        this.isDbReady.next(true); 
      }
        
    });
  }

  dbState() {
      return this.isDbReady.asObservable();
  }

  fetchRegistros(): Observable<any[]> {
        return this.impuestosList.asObservable();
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
        let impuesto: Impuestos[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              impuesto.push({ 
                id: res.rows.item(i).id,
                name_impuesto: res.rows.item(i).name_impuesto,  
                valor_impuesto: res.rows.item(i).valor_impuesto,
                letra_impuesto: res.rows.item(i).letra_impuesto
              });
            }
          }
          this.impuestosList.next(impuesto);
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
          let impuesto: Impuestos[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              impuesto.push({ 
                id: res.rows.item(i).id,
                name_impuesto: res.rows.item(i).name_impuesto,  
                valor_impuesto: res.rows.item(i).valor_impuesto,
                letra_impuesto: res.rows.item(i).letra_impuesto
              });
            }
          }
          return impuesto;
        })
        .catch(error => alert("hubo error en obtenerRegistros con impuestos: "+error));
    }else{
       return new Promise((resolve) => {
        
        let data = [
          {id: '1', name_impuesto:'IVA 16%', valor_impuesto: '1600', letra_impuesto : 'G'},
          {id: '2', name_impuesto:'IVA 8%', valor_impuesto: '800', letra_impuesto : 'R'},
          {id: '3', name_impuesto:'IVA 31%', valor_impuesto: '3100', letra_impuesto : 'A'},
          {id: '4', name_impuesto:'EXENTO', valor_impuesto: '0', letra_impuesto : 'E'},
          {id: '5', name_impuesto:'PERCIBIDO', valor_impuesto: '0', letra_impuesto : 'P'},
        ];
        resolve(data);
       })
      
    }
  }

  borrarRegistro(id){
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`DELETE FROM  ${this.tablaClase} WHERE id = ${id}`,[])
      .then(_ => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en borrarRegistro Impuestos: "+error));
    }else{
      console.log(this.tablaClase);
      console.log(id);
    }
  }

  obtenerRegistro(id): Promise<Impuestos> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT * FROM ${this.tablaClase} WHERE id = ${id}`, []).then(res => { 
        return {
          id: res.rows.item(0).id,
          name_impuesto: res.rows.item(0).name_impuesto,  
          valor_impuesto: res.rows.item(0).valor_impuesto,
          letra_impuesto: res.rows.item(0).letra_impuesto
        }
      });
    }else{
      //Escenarios de Prueba
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          name_impuesto: 'IVA 16%',  
          valor_impuesto: '1600',
          letra_impuesto: 'G'
        }
        resolve(data);
      })
      
    }
      
  }
  actualizarRegistro(id,dataUpdate : Impuestos){
    if(this.tipo_platform == 'cordova'){
        let data = [dataUpdate.name_impuesto,dataUpdate.valor_impuesto,dataUpdate.letra_impuesto];
         return this.storage.executeSql(`UPDATE ${this.tablaClase} 
         SET name_impuesto = ?, valor_impuesto = ?, letra_impuesto = ? WHERE id = ${id}`, data)
        .then(data => {
          this.obtenerRegistros();
        })
    }else{//Browser
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          name_impuesto: 'IVA 16%',  
          valor_impuesto: '1600',
          letra_impuesto: 'G'
        }
        resolve(data);
      })
    }
  }
  agregarRegistro(dataInsert: Impuestos) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "name_impuesto, valor_impuesto, letra_impuesto";
      data = [dataInsert.name_impuesto,dataInsert.valor_impuesto,dataInsert.letra_impuesto];
      return this.storage.executeSql
      (`INSERT INTO ${this.tablaClase}(${campos}) 
      VALUES (?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en agregarRegistro con impuestos: "+error));
    }else{
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          name_impuesto: 'IVA 16%',  
          valor_impuesto: '1600',
          letra_impuesto: 'G'
        }
        resolve(data);
      })
    }
  }
}

