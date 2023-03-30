import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StartSeedService {
  private storage: SQLiteObject;
  headerList = new BehaviorSubject([]);
  itemList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tipo_platform: string;
  constructor(
    private platform: Platform, 
    private sqlite: SQLite,
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter
  ) { 
    this.platform.ready().then((readySource) => {
      this.tipo_platform = readySource; 
      /*if(this.tipo_platform == 'cordova'){
        this.sqlite.create({
          name: '121221.db',
          location: 'default'
        })
        .then(async(db: SQLiteObject) => {
            this.storage = db;
            //await this.seedData(db);
            this.isDbReady.next(true);
        });
      }  */ 
    });
  }
  /**************
   * Recibe el objeto de creacion de la BD y hace las migraciones
   */

  async opendataBase(){
    return new Promise((resolve) => {
      this.platform.ready().then((readySource) => {
        this.tipo_platform = readySource;   
        console.log(this.tipo_platform); 
        if(this.tipo_platform == 'cordova'){
          this.sqlite.create({
            name: 'z012BPM.db',
            location: 'default'
          })
          .then((db: SQLiteObject) => {
              this.storage = db;
              resolve(db);
          });
        }   
      });
    })
  }
  async verifyTable(db,name){
    return new Promise(async (resolve,reject) => {
    //select DISTINCT tbl_name from sqlite_master where tbl_name =
    await db.executeSql(`select DISTINCT tbl_name from sqlite_master where tbl_name ='${name}'`, 
      []).then(res => {
        resolve(res);
      })
    .catch(error => {
      alert("hubo error verificandoverifyTable: "+error.message);
      reject(error);
    });
    })
  }

  async verifyColumn(db,nameTable, columnTable){
    return new Promise(async (resolve,reject) => {
    await db.executeSql(`select ${columnTable} from ${nameTable} where 1 = 0`, 
      []).then(res => {
        resolve(true);
      })
    .catch(error => {
      resolve(false);
    });
    })
  }
  async addColumn(db,nameTable, columnTable, typeColumn){
    return new Promise(async (resolve,reject) => {
    await db.executeSql(`alter table ${nameTable} add column ${columnTable} ${typeColumn}`, 
      []).then(res => {
        resolve(true);
      })
    .catch(error => {
      reject(error.message);
    });
    })
  }
  async seedData(){
    let db = this.storage;
    //Tabla de Prueba
    //La tabla de prueba sera articulos
    //Validacion de si las  tablas Exiisten
    let dep : boolean = false;
   /* await this.verifyTable(db,'maestra_departamentos').then((res:any) =>{
      if (res.rows.length > 0) {
        dep = true;
      }
    }).catch(err =>{
      alert(err.message);
    });*/
    let cliente : boolean =  false;
    /*await this.verifyTable(db,'maestra_clientes').then((res:any) =>{
      if (res.rows.length > 0) {
        cliente = true;
      }
    }).catch(err =>{
      alert(err.message);
    });*/
    let impuestos : boolean = false; 
   /* await this.verifyTable(db,'tienda_impuestos').then((res:any) =>{
      if (res.rows.length > 0) {
        impuestos = true;
      }
    }).catch(err =>{
      alert(err.message);
    });*/
    let fpago : boolean = false; 
    /*await this.verifyTable(db,'tienda_fpago').then((res:any) =>{
      if (res.rows.length > 0) {
        fpago = true;
      }
    }).catch(err =>{
      alert(err.message);
    });*/
    //Tabla 1
    if(!dep){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS maestra_departamentos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_dpto TEXT, 
        cod_dpto TEXT,
        url_dpto TEXT,
        created_at TEXT,
        update_at TEXT
        )`, []).then(async(res) => {
          let data = [1,'Departamento de Pruebas', '1'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO maestra_departamentos (id, name_dpto, cod_dpto) 
                                VALUES (?, ?, ?)`,data);
      })
      .catch(error => alert("hubo error creando maestra_departamentos: "+error.message));
    }
    
    //Tabla 2
    if(!cliente){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS maestra_clientes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_cliente TEXT, 
        number_id TEXT,
        email TEXT,
        number_tlf TEXT
      )`, []).then(res => {
      })
      .catch(error => alert("hubo error creando maestra_clientes: "+error.message));
    }
    
    //Tabla 3
    if(!impuestos){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS tienda_impuestos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_impuesto TEXT, 
        valor_impuesto TEXT,
        letra_impuesto TEXT
        )`, 
        []).then(async(res) => {
            let data = [1, 'IVA 16%', '1600', 'G'];
           await  this.storage.executeSql(`INSERT or IGNORE  INTO tienda_impuestos (id, name_impuesto, valor_impuesto, letra_impuesto) 
                      VALUES (?, ?, ?, ?)`,data);
            data = [2, 'IVA 8%', '800', 'R'];
            await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_impuestos (id, name_impuesto, valor_impuesto, letra_impuesto) 
                      VALUES (?, ?, ?, ?)`,data);
            data = [3, 'IVA 31%', '3100', 'A'];
            await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_impuestos (id, name_impuesto, valor_impuesto, letra_impuesto) 
                    VALUES (?, ?, ?, ?)`,data);
            data = [4, 'IVA EXENTO', '0', 'E'];
          await   this.storage.executeSql(`INSERT or IGNORE  INTO tienda_impuestos (id, name_impuesto, valor_impuesto, letra_impuesto) 
                   VALUES (?, ?, ?, ?)`,data);
            data = [5, 'IVA PERCIBIDO', '0', 'P'];
           await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_impuestos (id, name_impuesto, valor_impuesto, letra_impuesto) 
                    VALUES (?, ?, ?, ?)`,data);
                              
      })
      .catch(error => alert("hubo error creando tienda_impuestos: "+error.message));
    }
    
    //Tabla 4
    if(!fpago){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS tienda_fpago(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_fpago TEXT,
        mlocal TEXT,
        paridad TEXT,
        recargo text,
        porcentaje_recargo integer
        )`, 
        []).then(async(res) => {
          let data = [1, 'EFECTIVO', 'true', '0'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_fpago (id, name_fpago, mlocal,paridad) 
          VALUES (?, ?, ?, ?)`,data);
          data = [2, 'DEBITO', 'true', '0'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_fpago (id, name_fpago, mlocal,paridad) 
          VALUES (?, ?, ?, ?)`,data);
          data = [3, 'CREDITO', 'true', '0'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_fpago (id, name_fpago, mlocal,paridad) 
          VALUES (?, ?, ?, ?)`,data);
          data = [4, 'DOLARES', 'false', '1', 'true', 3];
          await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_fpago (id, name_fpago, mlocal,paridad,recargo,porcentaje_recargo) 
          VALUES (?, ?, ?, ?, ?, ?)`,data);
      })
      .catch(error => alert("hubo error creando tienda_fpago: "+error.message));
    }
    let articulo : boolean = false; 
   /* await this.verifyTable(db,'maestra_articulos').then((res:any) =>{
      if (res.rows.length > 0) {
        articulo = true;
      }
    }).catch(err =>{
      alert(err.message);
    });*/
    //Tabla 5
    if(!articulo){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS maestra_articulos(
        id TEXT,
        name_articulo TEXT, 
        price_bs TEXT,
        price_usd TEXT,
        id_dpto TEXT,
        id_impuesto TEXT,
        url_img TEXT,
        requiere_peso TEXT,
        requiere_precio TEXT
        )`, 
        []).then(async(res) => {
         
      })
      .catch(error => alert("hubo error creando maestra_articulos: "+error.message));
    }
    let barra : boolean = false; 
  
    //Tabla 6
    if(!barra){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS maestra_barras(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cod_barra TEXT, 
        id_articulo TEXT
      )`, 
        []).then(res => {
          console.log(res);
      })
      .catch(error => alert("hubo error creando maestra_barras: "+error.message));
    }
    let business : boolean = false; 
    /*await this.verifyTable(db,'salebusinessdate').then((res:any) =>{
      if (res.rows.length > 0) {
        business = true;
      }
    }).catch(err =>{
      alert(err.message);
    });*/
    //Tabla 7
    if(!business){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS salebusinessdate(
        id integer PRIMARY KEY  AUTOINCREMENT,
        begin_date text,
        end_date text
      )`, 
        []).then(res => {
          console.log(res);
      })
      .catch(error => alert("hubo error creando salebusinessdate: "+error.message));
    }
  let salereturn : boolean = false; 
   /* await this.verifyTable(db,'salereturn').then((res:any) =>{
      if (res.rows.length > 0) {
        salereturn = true;
      }
    }).catch(err =>{
      alert(err.message);
    });  */ 
  

  let saleheader : boolean = false; 
  
  //Tabla 10
  if(!saleheader){
    await db.executeSql(`CREATE TABLE IF NOT EXISTS saleheader(
      trans integer PRIMARY KEY  AUTOINCREMENT,
      pos integer ,
      linetrans integer,
      saletype integer,
      salestatus integer,
      printerstatus integer,
      fechainicio text,
      horainicio text,
      fechaculminacion text,
      horaculminacion text,
      cajero text,
      id_salebusiness integer,
      recargo text default 'false',
      porcentaje_recargo integer
    )`, 
      []).then(res => {
        console.log(res);
    })
    .catch(error => alert("hubo error creando saleheader "+error.message));
  }
  let saleitems : boolean = false; 
 /* await this.verifyTable(db,'saleitems').then((res:any) =>{
    if (res.rows.length > 0) {
      saleitems = true;
    }
  }).catch(err =>{
    alert(err.message);
  }); */  
  //Tabla 11
  if(!saleitems){
    await db.executeSql(`CREATE TABLE IF NOT EXISTS saleitems(
      trans integer,
      pos integer,
      linetrans integer,
      articulo bigint,
      pludesc text,
      price1 bigint,
      deptid text,
      impuestoid integer,
      amtsold bigint,
      totalivaproducto bigint,
      cantidadvendido integer,
      devueltos integer,
      anulado integer,
      totalreal integer,
      descuentoitem integer
    )`, 
      []).then(res => {
        console.log(res);
    })
    .catch(error => alert("hubo error creando saleitems: "+error.message));
  }
  let salepayments : boolean = false; 
  /*await this.verifyTable(db,'salepayments').then((res:any) =>{
    if (res.rows.length > 0) {
      salepayments = true;
    }
  }).catch(err =>{
    alert(err.message);
  });   */
  //Tabla 12
  if(!salepayments){
    await db.executeSql(`CREATE TABLE IF NOT EXISTS salepayments(
      trans integer,
      pos integer,
      linetrans integer,
      formapagoid integer,
      descformapago text,
      monto bigint,
      vuelto bigint,
      moneda_local text,
      monto_divisa text,
      tasa_calculo text,
      valor_recargo_igtf text,
      porcentaje_recargo_igtf text
    )`, 
      []).then(res => {
        console.log(res);
    })
    .catch(error => alert("hubo error creando salepayments: "+error.message));
  }
  let salefoot : boolean = false; 
  /*await this.verifyTable(db,'salefoot').then((res:any) =>{
    if (res.rows.length > 0) {
      salefoot = true;
    }
  }).catch(err =>{
    alert(err.message);
  });   */
   //Tabla 13
   if(!salefoot){
    await db.executeSql(`CREATE TABLE IF NOT EXISTS salefoot(
      trans integer,
      pos integer,
      linetrans integer,
      hora text,
      fecha text,
      neto bigint,
      bruto bigint,
      iva bigint,
      montoimpuesto bigint,
      numeroz bigint,
      factura bigint,
      impresora text,
      clienteid text,
      nombre text
  )`, 
      []).then(res => {
        console.log(res);
    })
    .catch(error => alert("hubo error creando salefoot: "+error.message));
   }
  let tienda_tasas : boolean = false; 
 
  //Tabla 14
  
  let tienda_configuracion : boolean = false; 
 /* await this.verifyTable(db,'tienda_configuracion').then((res:any) =>{
    if (res.rows.length > 0) {
      tienda_configuracion = true;
    }
  }).catch(err =>{
    alert(err.message);
  });   */
  //Tabla 15
  if(!tienda_configuracion){
    await db.executeSql(`CREATE TABLE IF NOT EXISTS tienda_configuracion(
      clave  text PRIMARY KEY,
      valor   text
    )`, 
      []).then(async(res) => {
        let data = ['STORE_NAME',''];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
       data = ['MONEDA_LOCAL','VEF'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['MONEDA_EXTRANJERA','USD'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['SIMBOLO_MONEDA_LOCAL','Bs'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['SIMBOLO_MONEDA_EXTRANJERA','$'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['ORIENTACION','portrait'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['TRABAJAR_SIN_IMPRESORA','false'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['IMPRIMIR_TRANSACCION','true'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['IMPRIMIR_PAGOS','false'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
        data = ['IMPRIMIR_ESPACIO_FIRMA','false'];
        await this.storage.executeSql(`INSERT or IGNORE  INTO tienda_configuracion (clave, valor) 
        VALUES (?, ?)`,data);
      
    })
    .catch(error => alert("hubo error creando tienda_configuracion: "+error.message));
  }

 
  this.isDbReady.next(true);
}

  async seedConfigNew(){
    let db = this.storage;
    let tienda_configuracion : boolean = false;
    if(!tienda_configuracion){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS cloud_configuracion(
        clave  text PRIMARY KEY,
        valor   text
      )`, 
        []).then(async(res) => {
          let data = ['SERVER_CLOUD','https://reto-darien-back.onrender.com'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
          data = ['USER_CLOUD',''];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
         data = ['PASS_CLOUD',''];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
          data = ['_TOKEN_CLOUD',''];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
          data = ['EMPRESA_CLOUD',''];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
          data = ['NOMBRE_EMPRESA_CLOUD',''];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
          data = ['SIG_ID','0'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
          data = ['ULT_ID_BUSINESS','0'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_configuracion (clave, valor) 
          VALUES (?, ?)`,data);
      })
      .catch(error => alert("hubo error creando cloud_configuracion: "+error.message));
    }
    //Control de Envios
    if(!tienda_configuracion){
      await db.executeSql(`CREATE TABLE IF NOT EXISTS cloud_task_sendfile(
        id  integer PRIMARY KEY  AUTOINCREMENT,
        id_send   text,
        statussend text
      )`, 
        []).then(async(res) => {
          let data = [1,'0','0'];
          await this.storage.executeSql(`INSERT or IGNORE  INTO cloud_task_sendfile (id, id_send,statussend) 
          VALUES (?, ?, ?)`,data);
      })
      .catch(error => alert("hubo error creando cloud_configuracion: "+error.message));
    }
  }
  
  fireStartSeed(){
    return true;
  }
  getActivedStatus(){
    this.isDbReady.next(true);
  }
  ActivedStatus(){
    this.isDbReady.next(true);
  }
  dbState() {
    return this.isDbReady.asObservable();
  }
  async getStartDB(){
    if(this.tipo_platform == 'cordova'){
      let db1 : SQLiteObject;
     await this.sqlite.create({
        name: 'prubaBP.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          db1 = db;
      });
      return db1;
    }
  }
  getStorage(){
    return this.storage;
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
        .catch(error => alert("hubo error en FakeData: en startSeed "+error));
    });
  }
}
