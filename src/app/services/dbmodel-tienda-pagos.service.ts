import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Pagos} from 'src/app/interfaces/generaldb';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { StartSeedService } from './start-seed.service';

@Injectable({
  providedIn: 'root'
})

export class DbmodelTiendaPagosService {
  private storage: SQLiteObject;
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables
  tablaClase = 'tienda_fpago';
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
            console.log("Estoy dentro de startSeed de dbmodel-tienda-ppago");
            this.sqlite.create({
              name: 'z012BPM.db',
              location: 'default'
            })
            .then((db: SQLiteObject) => {
                this.storage = db;
                console.log("Llamare a obtenerRegistros");
                this.obtenerRegistros();
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
      return this.itemList.asObservable();
    }else{
      let Data = [
        {id: '1', name_fpago:'DEBITO', mlocal: 'true', paridad: '0', recargo:'false', porcentaje_recargo:'3'},
        {id: '2', name_fpago:'CREDITO', mlocal: 'true', paridad: '0', recargo:'false', porcentaje_recargo:'3'},
        {id: '3', name_fpago:'DOLARES', mlocal: 'false', paridad: '1', recargo:'true', porcentaje_recargo:'3'}
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
        let impuesto: Pagos[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              impuesto.push({ 
                id: res.rows.item(i).id,
                name_fpago: res.rows.item(i).name_fpago,  
                mlocal: res.rows.item(i).mlocal,
                paridad: res.rows.item(i).paridad,
                recargo: res.rows.item(i).recargo,
                porcentaje_recargo: res.rows.item(i).porcentaje_recargo,
              });
            }
          }
          this.itemList.next(impuesto);
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
        .catch(error => alert("hubo error en obtenerRegistros con pagos: "+error));
    }
  }

  borrarRegistro(id){
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`DELETE FROM  ${this.tablaClase} WHERE id = ${id}`,[])
      .then(_ => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en borrarRegistro pagos: "+error));
    }else{
      console.log(this.tablaClase);
      console.log(id);
    }
  }

  obtenerRegistro(id): Promise<Pagos> {
    if(this.tipo_platform == 'cordova'){
      return this.storage.executeSql(`SELECT * FROM ${this.tablaClase} WHERE id = ${id}`, []).then(res => { 
        return {
          id: res.rows.item(0).id,
          name_fpago: res.rows.item(0).name_fpago,  
          mlocal: res.rows.item(0).mlocal,
          paridad: res.rows.item(0).paridad,
          recargo: res.rows.item(0).recargo,
          porcentaje_recargo: res.rows.item(0).porcentaje_recargo
        }
      });
    }else{
      //Escenarios de Prueba
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          name_fpago: 'DEBITO',  
          mlocal: 'true',
          paridad: '1',
          recargo: 'true',
          porcentaje_recargo:'3'
        }
        resolve(data);
      })
      
    }
      
  }
  actualizarRegistro(id,dataUpdate : Pagos){
    if(this.tipo_platform == 'cordova'){
        let data = [dataUpdate.name_fpago,dataUpdate.mlocal,dataUpdate.paridad,dataUpdate.recargo,dataUpdate.porcentaje_recargo];
         return this.storage.executeSql(`UPDATE ${this.tablaClase} SET 
         name_fpago = ?, mlocal = ?, paridad = ?, recargo = ?, porcentaje_recargo = ? WHERE id = ${id}`, data)
        .then(data => {
          this.obtenerRegistros();
        })
    }else{//Browser
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          name_fpago: 'DEBITO',  
          mlocal: 'true',
          paridad: '1',
          recargo : 'false',
          porcentaje_recargo : '3'
        }
        resolve(data);
      })
    }
  }
  agregarRegistro(dataInsert: Pagos) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : string = "name_fpago, mlocal, paridad, recargo, porcentaje_recargo";
      data = [dataInsert.name_fpago,dataInsert.mlocal,dataInsert.paridad,dataInsert.recargo,dataInsert.porcentaje_recargo];
      return this.storage.executeSql
      (`INSERT INTO ${this.tablaClase}(${campos}) 
      VALUES (?, ?, ?, ?, ?)`,data)
      .then(res => {
        this.obtenerRegistros();
      })
      .catch(error => alert("hubo error en agregarRegistro con tienda_fpago: "+error));
    }else{
      return new Promise(function (resolve, reject) {
        let data = {
          id: '1',
          name_fpago: 'DEBITO',  
          mlocal: 'true',
          paridad: '1',
          recargo : 'true',
          porcentaje_recargo : '3'
        }
        resolve(data);
      })
    }
  }
}

