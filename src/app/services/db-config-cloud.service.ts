import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { StartSeedService } from './start-seed.service';
import { CloudConfiguracion} from 'src/app/interfaces/generaldb';
@Injectable({
  providedIn: 'root'
})
export class DbConfigCloudService {
  private storage: SQLiteObject;
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables       
  tablaClase = 'cloud_configuracion';
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string;
  seedSubscription: Subscription;
  constructor(
    private platform: Platform, 
    private sqlite: SQLite,
    private seed: StartSeedService
  ) {
    this.seedSubscription = this.seed.dbState().subscribe((res) => {
      if(res){
        this.platform.ready().then((readySource) => {
          if(readySource=='cordova'){
            this.sqlite.create({
              name: 'z012BPM.db',
              location: 'default'
          })
          .then(async(db: SQLiteObject) => {
              this.storage = db;  
              await this.seed.opendataBase().then(async(res) =>{
                let varDataBase = res;
                await this.seed.verifyTable(varDataBase,'cloud_configuracion').then(async(res:any) =>{
                  if (res.rows.length > 0)
                    await this.obtenerRegistros();
                    
                });
              })                               
              this.isDbReady.next(true); 
          });
          //Add
          this.tipo_platform = readySource;
          }else{ //Fin de Cordova
            this.tipo_platform = "browser";
          }
        });
      } 
    });
   }
   dbState() {
    return this.isDbReady.asObservable();
  }

  fetchRegistros(): Observable<any[]> {
      return this.itemList.asObservable();
  }
  fillobservable(table,res){
    switch (table) {
      case this.tablaClase:
        let item: CloudConfiguracion[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              item.push({ 
                clave: res.rows.item(i).clave,
                valor: res.rows.item(i).valor
              });
            }
          }
          this.itemList.next(item);
        break;
        
      default:
        break;
    }
  }
  obtenerRegistros(){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * from ${this.tablaClase}`, []).then(res => {
          this.fillobservable(this.tablaClase,res);
          let item: CloudConfiguracion[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              item.push({ 
                clave: res.rows.item(i).clave,
                valor: res.rows.item(i).valor
              });
            }
            //Prueba 23/1/23
            this.itemList.next(item);
          }
          return item;
        })
       // .catch(error => alert("hubo error en obtenerRegistros con ConfigCloud"+error));
    }else{
      return new Promise((resolve) => {
        let Data = [
          {clave : 'SERVER_CLOUD' , valor : 'https://reto-darien-back.onrender.com/'},
          {clave : 'USER_CLOUD' , valor : 'admin '},
          {clave : 'PASS_CLOUD' , valor : '12345678'},
          //{clave : '_TOKEN_CLOUD' , valor : 'EPNikcLnrzVQQqp6OYgYwLrBTSk4jUqy1jAvFI9YINFoOTNkR1hjJ4fvHw02'},
         {clave : '_TOKEN_CLOUD' , valor : ''},
          {clave : 'EMPRESA_CLOUD' , valor : '2'},
          {clave : 'NOMBRE_EMPRESA_CLOUD' , valor : ''},
          {clave : 'SIG_ID' , valor : '0'},
          {clave : 'ULT_ID_BUSINESS' , valor : '0'}
        ];
        this.itemList.next(Data);
        resolve(Data)
      });
    }
  }
  actualizarRegistro(clave:any,valor:any){ 
    if(this.tipo_platform == 'cordova'){
         return this.storage.executeSql(`UPDATE ${this.tablaClase} SET 
         valor='${valor}' where clave='${clave}'`,[]) 
        .then( async(data) => {
          await this.obtenerRegistros();
        })
    }else{//Browser
      return new Promise((resolve) => {
        //Obtengo el array completo
        let DataActual : any = this.itemList.value;
        //Obtengo los resultados asociados
        let dataLinea = DataActual.find(element => element.clave == clave);
         //Busco el indice de esa linea
         let dataLineaIndex = DataActual.findIndex(element => element.clave == clave);
         dataLinea.valor=valor;
         DataActual.splice(dataLineaIndex,1,dataLinea);
        this.itemList.next(DataActual);
        console.log(DataActual); 
        resolve(dataLinea);
      })
    }
  }
}
