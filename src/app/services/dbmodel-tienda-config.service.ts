import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Configuracion} from 'src/app/interfaces/generaldb';
import { StartSeedService } from './start-seed.service';
@Injectable({
  providedIn: 'root'
})
export class DbmodelTiendaConfigService {
  private storage: SQLiteObject;
  itemList = new BehaviorSubject([]);
  //Nuevos registros para observables
  tablaClase = 'tienda_configuracion';
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string;
  seedSubscription: Subscription;
  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
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
              console.log("Soy obtener registros de DB Configuration");
                this.storage = db;
                await this.obtenerRegistros().then(res =>{                  
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
        let item: Configuracion[] = [];
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
  // Recupera Registros
  obtenerRegistros(){
    if(this.tipo_platform == 'cordova'){
        return this.storage.executeSql(`SELECT * from ${this.tablaClase}`, []).then(res => {
          this.fillobservable(this.tablaClase,res);
          let item: Configuracion[] = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
              item.push({ 
                clave: res.rows.item(i).clave,
                valor: res.rows.item(i).valor
              });
            }
          }
          return item;
        })
        .catch(error => alert("hubo error en obtenerRegistros con tienda-config: "+error));
    }else{
      return new Promise((resolve) => {
        let Data = [
          {clave : 'STORE_NAME' , valor : ''},
          {clave : 'MONEDA_LOCAL' , valor : 'VEF'},
          {clave : 'MONEDA_EXTRANJERA' , valor : 'USD'},
          {clave : 'SIMBOLO_MONEDA_LOCAL' , valor : 'Bs'},
          {clave : 'SIMBOLO_MONEDA_EXTRANJERA' , valor : 'Ref:'},
          {clave : 'ORIENTACION' , valor : 'portrait'},
          {clave : 'TRABAJAR_SIN_IMPRESORA' , valor : 'true'},
          {clave : 'IP_IMPRESORA' , valor : '192.168.1.2'},
          {clave : 'PUERTO_IMPRESORA' , valor : '5000'},
          {clave : 'CONECTAR_IMPRESORA_INICIAR' , valor : 'false'},
          {clave : 'IMPRIMIR_TRANSACCION' , valor : 'true'},
          {clave : 'IMPRIMIR_PAGOS' , valor : 'true'},
          {clave : 'IMPRIMIR_ESPACIO_FIRMA' , valor : 'true'},
          {clave : 'NUMERO_DE_POS' , valor : '0'}
        ];
        this.itemList.next(Data);
        resolve(Data)
      });
    }
  }
  async actualizarRegistro(clave:any,valor:any){ 
    if(this.tipo_platform == 'cordova'){
         return this.storage.executeSql(`UPDATE ${this.tablaClase} SET 
         valor='${valor}' where clave='${clave}'`,[]) 
        .then(data => {
          this.obtenerRegistros();
          return data;
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
        resolve(dataLinea);
      })
    }
  }
}
