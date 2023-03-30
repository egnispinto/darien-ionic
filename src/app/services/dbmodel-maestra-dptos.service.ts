import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Dpto} from './maestra';
import { DptoInterface} from 'src/app/interfaces/generaldb';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { StartSeedService } from './start-seed.service';
//Ejemplo sacado de https://www.positronx.io/ionic-sqlite-database-crud-app-example-tutorial/
@Injectable({
  providedIn: 'root'
})

export class DbmodelMaestraDptosService {
  private storage: SQLiteObject;
  dptoList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables
  departamentosList = new BehaviorSubject([]);

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
    this.platform.ready().then( (readySource) => {
      if(readySource=='cordova'){
        this.startSeed.dbState().subscribe((res) => {
          if(res){
            this.sqlite.create({
              name: 'z012BPM.db',
              location: 'default'
            })
            .then( (db: SQLiteObject) => {
                this.storage = db;
                this.obtenerRegistros('maestra_departamentos');
                this.isDbReady.next(true);
                //await this.getFakeData();
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
  fetchRegistros(table): Observable<any[]> {
    switch (table) {
      case 'maestra_departamentos':
        return this.departamentosList.asObservable();
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
          this.isDbReady.next(true);
        })
        .catch(error => alert("hubo error en FakeData: "+error));
    });
  }
  

  
  fillobservable(table,res){
    switch (table) {
      case 'maestra_departamentos':
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
          //070421 add await y return list object
          this.fillobservable(table,res);
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
          return items;
        })
        .catch(error => alert("hubo error en obtenerRegistros con departamentos: "+error));
      }
    }else{
      return new Promise((resolve) => {
        
        let data = [
          {id : '1', name_dpto: 'Prueba 1', cod_dpto: '0001', url_dpto : 'https://cdn.traction.one/pokedex/pokemon/150.png'}, 
          {id : '2', name_dpto: 'Prueba 2', cod_dpto: '0002', url_dpto : 'https://cdn.traction.one/pokedex/pokemon/149.png'},
          {id : '3', name_dpto: 'Prueba 3', cod_dpto: '0003', url_dpto : 'https://cdn.traction.one/pokedex/pokemon/149.png'},
          {id : '4', name_dpto: 'Prueba 4', cod_dpto: '0004', url_dpto : 'https://cdn.traction.one/pokedex/pokemon/130.png'}
        ];
        resolve(data);
      })
      
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
      });
    }else{
      //Escenarios de Prueba
      return new Promise(function (resolve, reject) {
        let data ;
        data = {id:'1', name_dpto:'Prueba',cod_dpto:'P001'}
        return resolve(data);
      })
    }
      
  }
  actualizarRegistro(tabla,id,dataUpdate : any){
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      if(tabla == 'maestra_departamentos'){
        data = [dataUpdate.name_dpto];
        return this.storage.executeSql(`UPDATE ${tabla} SET name_dpto = ? WHERE id = ${id}`, data)
        .then(data => {
          this.obtenerRegistros(tabla);
        })
      }
    }else{//Browser
      let data : any [];
      if(tabla == 'maestra_departamentos'){
        data = [dataUpdate.name_dpto];
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
        data = [dataInsert.name_dpto];
        return this.storage.executeSql('INSERT INTO maestra_departamentos (name_dpto) VALUES (?)',data)
        .then(res => {
          this.obtenerRegistros(table);
        })
        .catch(error => alert("hubo error en agregarRegistro con departamentos: "+error));
      }
    }else{
      let data = [dataInsert.name_dpto];
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
  agregarRegistroCloud(table,dataInsert: any) {
    if(this.tipo_platform == 'cordova'){
      let data : any [];
      let campos : any [];
      if(table == 'maestra_departamentos'){
        data = [dataInsert.id,dataInsert.name_dpto];
        return this.storage.executeSql('INSERT INTO maestra_departamentos (id,name_dpto) VALUES (?,?)',data)
        .then(res => {
          this.obtenerRegistros(table);
        })
       // .catch(error => alert("hubo error en agregarRegistro con departamentosCloud: "+error));
      }
    }else{
      let data = [dataInsert.id,dataInsert.name_dpto];
      let campos = ['id','name_dpto'];
      return new Promise(function (resolve, reject) {
        let datosReturn = [
          {ok : 'OK'}
        ]
        return resolve(datosReturn);
      })
    }
  }
}