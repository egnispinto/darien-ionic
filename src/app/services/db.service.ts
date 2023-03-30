/*
  Este servicio fue el que se uso para integrar la funcionalidad SQLite
*/
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Dpto, Impuestos, FPago, Articulos, Barras, Clientes } from './maestra';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
//Ejemplo sacado de https://www.positronx.io/ionic-sqlite-database-crud-app-example-tutorial/
@Injectable({
  providedIn: 'root'
})

export class DbService {
  private storage: SQLiteObject;
  dptoList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables
  departamentosList = new BehaviorSubject([]);
  impuestosList = new BehaviorSubject([]);
  formasdepagoList = new BehaviorSubject([]);
  articulosList = new BehaviorSubject([]);
  clientesList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string = 'cordova';
  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
  ) 
  {
    this.platform.ready().then((readySource) => {
      if(readySource=='cordova'){
        this.sqlite.create({
          name: 'z012BPM.db',
          location: 'default'
        })
        .then((db: SQLiteObject) => {
            this.storage = db;
            this.getFakeData();
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
  fetchRegistros(table): Observable<any[]> {
    switch (table) {
      case 'maestra_departamentos':
        return this.departamentosList.asObservable();
        case 'maestra_clientes':
          return this.clientesList.asObservable();
      default:
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
          this.obtenerRegistros('maestra_departamentos');
          this.obtenerRegistros('maestra_clientes');
          this.isDbReady.next(true);
        })
        .catch(error => alert("hubo error en FakeData: "+error));
    });
  }
  

  
  fillobservable(table,res){
    switch (table) {
      case 'maestra_departamentos':
      //if(table == 'maestra_departamentos'){
        let items: Dpto[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              items.push({ 
                id: res.rows.item(i).id,
                name_dpto: res.rows.item(i).name_dpto,  
                cod_dpto: res.rows.item(i).cod_dpto,
                created_at: res.rows.item(i).created_at,
                updated_at: res.rows.item(i).updated_at
              });
            }
          }
          this.departamentosList.next(items);
      //}
        break;
        case 'maestra_clientes':
        //if(table == 'maestra_clientes'){
          let clientes: Clientes[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              clientes.push({ 
                id: res.rows.item(i).id,
                name_cliente: res.rows.item(i).name_cliente,  
                number_id: res.rows.item(i).number_id,
                email: res.rows.item(i).email,
                number_tlf: res.rows.item(i).number_tlf
              });
            }
          }
          this.clientesList.next(clientes);
       // }
        break;
      default:
        break;
    }
  }
  // Recupera Registros
  obtenerRegistros(table){
    if(this.tipo_platform == 'cordova'){
      if(table == 'maestra_departamentos'){
        return this.storage.executeSql('SELECT * FROM maestra_departamentos', []).then(res => {
          this.fillobservable(table,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con departamentos: "+error));
      }
      if(table == 'maestra_clientes'){
        return this.storage.executeSql('SELECT * FROM maestra_clientes', []).then(res => {
          this.fillobservable(table,res);
        })
        .catch(error => alert("hubo error en obtenerRegistros con clientes: "+error));
      }
    }
  }

  borrarRegistro(tabla, id){
    if(this.tipo_platform == 'cordova'){
      if(tabla == 'maestra_departamentos'){}
      return this.storage.executeSql(`DELETE FROM  ${tabla} WHERE id = ${id}`,[])
      .then(_ => {
        this.obtenerRegistros(tabla);
      })
      .catch(error => alert("hubo error en borrarRegistro: "+error));
    }else{
      console.log(tabla);
      console.log(id);
    }
  }

  obtenerRegistro(tabla,id): Promise<any> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT * FROM ${tabla} WHERE id = ${id}`, []).then(res => { 
        if(tabla == 'maestra_departamentos'){
          return {
            id: res.rows.item(0).id,
            name_dpto: res.rows.item(0).name_dpto,  
            cod_dpto: res.rows.item(0).cod_dpto,
            created_at: res.rows.item(0).created_at,
            updated_at: res.rows.item(0).updated_at
          }
        }
        if(tabla == 'maestra_clientes'){
          return {
            id: res.rows.item(0).id,
            name_cliente: res.rows.item(0).name_cliente,  
            number_id: res.rows.item(0).number_id,
            email: res.rows.item(0).email,
            number_tlf: res.rows.item(0).number_tlf
          }
        }
      });
    }else{
      //Escenarios de Prueba
      return new Promise(function (resolve, reject) {
        let data : any[];
        if(tabla == 'maestra_departamentos'){
          data = [
            {id:'1', name_dpto:'Prueba',cod_dpto:'P001'}
          ]
        }
        if(tabla == 'maestra_clientes'){
          data = [
            {id:'1', name_cliente:'Prueba',number_id:'V-20300215',email:'V-20300215',number_tlf:'04242827763'}
          ]
        }
        return resolve(data);
      })
    }
      
  }
  

  actualizarRegistro(tabla,id,dataUpdate : any){
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      if(tabla == 'maestra_departamentos'){
        data = [dataUpdate.name_dpto,dataUpdate.cod_dpto];
        return this.storage.executeSql(`UPDATE ${tabla} SET name_dpto = ?, cod_dpto = ? WHERE id = ${id}`, data)
        .then(data => {
          this.obtenerRegistros(tabla);
        })
      }
      if(tabla == 'maestra_clientes'){
        data = [dataUpdate.name_cliente,dataUpdate.number_id,dataUpdate.email,dataUpdate.number_tlf];
         return this.storage.executeSql(`UPDATE ${tabla} SET name_cliente = ?, number_id = ?, email = ?, number_tlf = ? WHERE id = ${id}`, data)
        .then(data => {
          this.obtenerRegistros(tabla);
        })
      }
    }else{//Browser
      let data : any [];
      if(tabla == 'maestra_departamentos'){
        data = [dataUpdate.name_dpto,dataUpdate.cod_dpto];
      }
      return new Promise(function (resolve, reject) {
        let datosReturn = [
          {ok : 'OK'}
        ]
        return resolve(datosReturn);
      })
    }
  }
  agregarRegistro(table,dataInsert: any) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : any [];
      if(table == 'maestra_departamentos'){
        data = [dataInsert.name_dpto,dataInsert.cod_dpto];
        return this.storage.executeSql('INSERT INTO maestra_departamentos (name_dpto, cod_dpto) VALUES (?, ?)',data)
        .then(res => {
          this.obtenerRegistros(table);
        })
        .catch(error => alert("hubo error en agregarRegistro con departamentos: "+error));
      }
      if(table == 'maestra_clientes'){
        data = [dataInsert.name_cliente,dataInsert.number_id,dataInsert.email,dataInsert.number_tlf];
        return this.storage.executeSql('INSERT INTO maestra_clientes (name_cliente, number_id, email, number_tlf) VALUES (?, ?, ?, ?)',data)
        .then(res => {
          this.obtenerRegistros(table);
        })
        .catch(error => alert("hubo error en agregarRegistro con clientes: "+error));
      }
      
    }else{
      let data = [dataInsert.name_dpto,dataInsert.cod_dpto];
      let campos = ['name_dpto, cod_dpto'];
      console.log([data,campos]);
      return new Promise(function (resolve, reject) {
        let datosReturn = [
          {ok : 'OK'}
        ]
        return resolve(datosReturn);
      })
    }
  }
}//Fin de la cclase