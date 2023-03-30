import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { StartSeedService } from './start-seed.service';

@Injectable({
  providedIn: 'root'
})
export class DbEndofdayService {
  private storage: SQLiteObject;
  headerList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string;
  tablesalebusiness = 'salebusinessdate';
  constructor(
    private platform: Platform, 
    private sqlite: SQLite,
    private startSeed : StartSeedService,
    private datePipe: DatePipe,
  ) { 
    this.platform.ready().then((readySource) => {this.tipo_platform = readySource
      if(this.tipo_platform == 'cordova'){
        this.startSeed.dbState().subscribe((res) => {
          if(res){
            this.sqlite.create({
              name: 'z012BPM.db',
              location: 'default'
            })
            .then((db: SQLiteObject) => {
                this.storage = db;
            });
          }
        })
        
      }
    });
    
    //this.storage = startSeed.getStorage();
  }
  async obtenerRegistro(){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * FROM ${this.tablesalebusiness} 
        where begin_date is not null and end_date is null
        order by id desc limit 1`, []).then(async (res) => {
          return res.rows.item(0);
          
        })
        .catch(error => alert("hubo error en obtenerRegistros con tablesalebusiness: "+this.tablesalebusiness));
    }else{
      return new Promise((resolve) => {resolve({ id : '1', begin_date: '2021/08/25 19:20', end_date: ''})});
    }
  }
  async obtenerRegistroCloud(){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT id,begin_date,end_date FROM ${this.tablesalebusiness} `, []).then(async (res) => {
          let trans : any[]= [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              trans.push({ 
                id: res.rows.item(i).id,
                begin_date: res.rows.item(i).begin_date,
                end_date: res.rows.item(i).end_date
              });
            }
          }
          return trans;
          
        })
        .catch(error => alert("hubo error en obtenerRegistros con tablesalebusiness: "+this.tablesalebusiness));
    }else{
      return new Promise((resolve) => {
        let trans :any[] = [];
        let dato = { id : '1', begin_date: '2021/08/25 21:20', end_date: ''}
        trans.push(dato);
        resolve(trans)});
    }
  }
  async obtenerRegistroCloudFindOne(id){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT id,begin_date,end_date FROM ${this.tablesalebusiness} 
        where id=${id}`, []).then(async (res) => {
          let trans : any[]= [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              trans.push({ 
                id: res.rows.item(i).id,
                begin_date: res.rows.item(i).begin_date,
                end_date: res.rows.item(i).end_date
              });
            }
          }
          return trans;
          
        })
        .catch(error => alert("hubo error en obtenerRegistros con tablesalebusiness: "+this.tablesalebusiness));
    }else{
      return new Promise((resolve) => {
        let trans :any[] = [];
        let dato = { id : '1', begin_date: '2021/11/13 21:20', end_date: ''}
        trans.push(dato);
        resolve(trans)});
    }
  }
  startofday(){
    if(this.tipo_platform == 'cordova'){
      let myDate = new Date();
      let Fecha = this.datePipe.transform(myDate, 'yyyy-MM-dd hh:mm:ss');
      return this.storage.executeSql(`INSERT INTO ${this.tablesalebusiness}(begin_date)
      VALUES ('${Fecha}')`, []).then(res => {
        return res;
      })
      .catch(error => alert("hubo error en startOfday: "+this.tablesalebusiness));
    }
  }
  endofday(id){
    if(this.tipo_platform == 'cordova'){
      let myDate = new Date();
      let Fecha = this.datePipe.transform(myDate, 'yyyy-MM-dd hh:mm:ss');
      return this.storage.executeSql(`UPDATE ${this.tablesalebusiness} SET 
      end_date='${Fecha}' where id=${id}`, []).then(res => {
        return res;
      })
      .catch(error => alert("hubo error en UPDATE: startOfday: "+this.tablesalebusiness));
    }else{
      return new Promise((resolve) => {resolve('OK')});
    }
  }
}
