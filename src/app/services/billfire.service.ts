import { Injectable } from '@angular/core';
import { DbSaleHeaderService } from './db-sale-header.service';
import { Header, Items, Payments, Foot, Acumuladores } from 'src/app/interfaces/generaldb';
import { DatePipe } from '@angular/common';
import { DbmodelMaestraArticulosService } from './dbmodel-maestra-articulos.service';
import { DbmodelTiendaImpuestosService } from './dbmodel-tienda-impuestos.service';
import { DbmodelMaestraDptosService } from './dbmodel-maestra-dptos.service';
import { DbSaleItemsService } from './db-sale-items.service';
import { DbSalePaymentsService } from './db-sale-payments.service';
import { DbSaleFootService } from './db-sale-foot.service';
import { AlertController, Platform } from '@ionic/angular';
import { DbEndofdayService } from './db-endofday.service';
import { ConnectBackofficeService } from './servicio-de-producto.service';
import { DbmodelTiendaConfigService } from './dbmodel-tienda-config.service';
@Injectable({
  providedIn: 'root'
})
export class BillfireService {
  statusSale : any = 
    {
      ACTIVA : 1, 
      CANCELADA: 2,
      GUARDADA: 3,
      RECUPERADA: 4,
      FINALIZADA: 5,
    }
  
  saletype : any = {
    VENTA : 1,
    DEVOLUCION : 2
  }
  DataHeader :any;
  DataItems : any;
  DataPay : any;
  DataArticulo :any;
  dataDpto;
  DataImpuestos;
  line = 0;
  serial:string;
  tipo_platform:string;
  DataConf:any[] = [];
  numeroPos : any;
  usaBalanza : any;
  constructor(
    private DbSaleHeader : DbSaleHeaderService,
    private datePipe: DatePipe,
    private dbArticulo : DbmodelMaestraArticulosService,
    private dbImpuesto : DbmodelTiendaImpuestosService,
    private dbDpto : DbmodelMaestraDptosService,
    private dbItems : DbSaleItemsService,
    private DbSalePayments: DbSalePaymentsService,
    private DbSaleFoot : DbSaleFootService,
    private alertController: AlertController,
    private DbEndOfDay : DbEndofdayService,
    private connectBackOffice: ConnectBackofficeService,
    private dbConfig: DbmodelTiendaConfigService,
    private Patform: Platform,
  ) {
    this.Patform.ready().then((readySource) => {
      this.tipo_platform = readySource;
      if(this.tipo_platform == 'cordova'){
        this.dbConfig.dbState().subscribe(async(res) => {
          if(res){
            await this.dbConfig.obtenerRegistros().then(_ => {
              this.dbConfig.fetchRegistros().subscribe(item => {
                this.DataConf = item;
                this.numeroPos = this.DataConf.find(element => element.clave == 'NUMERO_DE_POS');
                this.usaBalanza = this.DataConf.find(element => element.clave == 'MANEJA_BALANZA');
              })
            })
          }
        });
      }else{
        this.dbConfig.obtenerRegistros().then( (item:any[]) => {
          this.DataConf = item;
          this.numeroPos = this.DataConf.find(element => element.clave == 'NUMERO_DE_POS');
          this.usaBalanza = this.DataConf.find(element => element.clave == 'MANEJA_BALANZA');
        });
      }
    })
  }

 
  async msjAlert(msj){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alertas para Debug',
      backdropDismiss: false,
      message: msj,
      buttons: [
       {
          text: 'Si',
          handler: () => {}
        }
      ]
    });

    await alert.present();
    
  }

  async getIdBusiness(){
    let idBusiness :any;
    await this.DbEndOfDay.obtenerRegistro().then(res =>{
      idBusiness = res;
    });
    if(idBusiness == undefined || idBusiness.length == 0){
      //No hay registro
      await this.DbEndOfDay.startofday().then(res => {
      })
      await this.DbEndOfDay.obtenerRegistro().then(res =>{
        idBusiness = res;
      });
    }
    return new Promise((resolve) => {
      resolve(idBusiness);
    })
  }
  async parametroVacio(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Parametro Vacio',
      backdropDismiss: false,
      message: 'No ingresaste ningún valor',
      mode:'ios',
      buttons: [
        {
          text: 'OK',
          handler: () => {}
        },
      ]
    });
    await alert.present();
  }
  async valorInvalido(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'El monto ingresado no es numerico',
      backdropDismiss: false,
      message: 'monto inválido',
      mode:'ios',
      buttons: [
        {
          text: 'OK',
          handler: () => {}
        },
      ]
    });
    await alert.present();
  }
  
   


  async InsertarArticulo(HeaderList:any[],id, cantidadparams:any = 1){
    
    let myDate = new Date();
    let Fecha = this.datePipe.transform(myDate, 'yyyy-MM-dd');
    let Hora = this.datePipe.transform(myDate, 'hh:mm:ss');
    //Recupero idBusiness activo
    let idBusiness :any;
    await this.getIdBusiness().then(res => idBusiness = res);
    if(HeaderList.length == 0){
      this.line = 0;
      let DataInsert : Header = {
          trans : 0, //Siempre viajara en cero porque es AUTOINCREMENT
          pos : 1,
          linetrans : this.line,
          saletype : this.saletype.VENTA,
          salestatus : this.statusSale.ACTIVA,
          printerstatus : 0,
          fechainicio: Fecha,
          horainicio : Hora,
          fechaculminacion : '',
          horaculminacion : '',
          cajero : '',
          id_salebusiness: idBusiness.id,
          recargo : 'false',
          porcentaje_recargo : 0
      }
      await this.DbSaleHeader.agregarRegistro(DataInsert);
      await this.DbSaleHeader.obtenerRegistroSinObservable().then(res => {
        this.DataHeader = res;
        this.line++;
      });
    }
    else{
      this.DataHeader = HeaderList;
      if(this.line == 0){
        //Recupero la ultima linea de TRX almacenadagetLastTrx
        await this.dbItems.getLastTrx(this.DataHeader[0].trans).then(res => {
          if(res != undefined)
            this.line = res.trans;
          this.line++;
        })
      }
    }
    //Averiguo datos del articulo que se clickeo
    await this.dbArticulo.obtenerRegistro(id)
    .then(res => {
      this.DataArticulo = res;
    })
    //Busco informacion del impuesto de ese articulo
    await this.dbImpuesto.obtenerRegistro(this.DataArticulo.id_impuesto)
    .then(res => {
      this.DataImpuestos = res;
    })
    //Busco informacion del Dpto
    await this.dbDpto.obtenerRegistro('maestra_departamentos',this.DataArticulo.id_dpto)
    .then(res => {
      this.dataDpto = res;
    })
    
    let cant;
   
    cant =1;
    let precio;
    
    precio = this.DataArticulo.price_bs;
    
    if(cantidadparams != 1)
      cant = cantidadparams
    //Construyo la data con la informacion que obtuve
    let iva : number = parseFloat((parseFloat(precio) * 
                        (this.DataImpuestos.valor_impuesto/10000)).toFixed(2))
    let total :number = parseFloat(precio) + iva;
    iva = iva*parseFloat(cant);
    total = total*parseFloat(cant);
    let amtsold = precio*parseFloat(cant);
    let DataInsert : Items = {
      trans : this.DataHeader[0].trans,
      pos : 1,
      linetrans : this.line,
      articulo :this.DataArticulo.id,
      pludesc :this.DataArticulo.name_articulo,
      price1 :this.DataArticulo.price_bs,
      deptid :this.DataArticulo.id_dpto,
      impuestoid : this.DataArticulo.id_impuesto,
      amtsold :amtsold,
      totalivaproducto :iva,
      cantidadvendido : cant,
      devueltos :0,
      anulado :0,
      totalreal : total,
      descuentoitem : 0
    }
    this.dbItems.agregarRegistro(DataInsert).then(res => {
      this.DataItems = res; 
      this.line++;
    })
    
  }

  async asyncForEach(array, callback) {
    let index = 0;
   for (index = 0; index < array.length; index++) {
     await callback(array[index], index, array);
   }
  }

  async insertarPagos(HeaderList:any[],PaymentsList:any[]){
    this.DataHeader = HeaderList;
    console.log(HeaderList);
    if(PaymentsList.length > 0){
      return new Promise(async(resolve) => {
        await this.asyncForEach(PaymentsList, async (element:any) => {
         // PaymentsList.forEach(async(element) => {
            //Construyo la data con la informacion que obtuve
            this.line++;
            let DataInsert : any = {
              trans : this.DataHeader[0].trans,
              pos : 1,
              linetrans : this.line,
              formapagoid :element.id,
              descformapago :element.desc,
              monto :element.monto,
              vuelto :element.vuelto,
              moneda_local :element.moneda_local,
              monto_divisa :element.monto_divisa,
              tasa_calculo :element.tasa_calculo,
              valor_recargo_igtf:element.valor_recargo_igtf,
              porcentaje_recargo_igtf:element.porcentaje_recargo_igtf
            }
            await this.DbSalePayments.agregarRegistro(DataInsert).then(res => {
              this.DataPay = res;
            })
         // });
        });
        resolve('OK');
      })
    }
  }
  async cleanObservables(){
    await this.DbSaleFoot.cleanObservable();
    await this.DbSalePayments.cleanObservable();
    await this.dbItems.cleanObservable();
    await this.DbSaleHeader.cleanObservable();
    return new Promise((resolve) => {
      resolve('OK');
    })
  }
  async imprimirTicket(HeaderList:any[],PaymentsList:any[], Acumuladores:any, Clientes:any,ItemsList:any){
    return new Promise(resolve =>{
      resolve("ok");
    })
  }
 
  async FinDeVenta(HeaderList:any[],PaymentsList:any[], Acumuladores:any, Clientes:any,ItemsList:any){
    this.DataHeader = HeaderList;
    let myDate = new Date();
    let Fecha = this.datePipe.transform(myDate, 'yyyy-MM-dd');
    let Hora = this.datePipe.transform(myDate, 'hh:mm:ss');
    let id:any = 0;
    let name:any = "";
    if(Clientes != undefined){
      if(Clientes.length > 0){
          id = Clientes[0].number_id;
          name = Clientes[0].name_cliente;
      }
    } 
    
    this.line++;
    
    if(this.serial == '')
      this.serial = "DEM0000001";
   
     let fac=0;
   
      
    let DataInsert : Foot = {
      trans :this.DataHeader[0].trans,
      pos : 1,
      linetrans : this.line,
      hora  :Hora,
      fecha :Fecha,
      neto : parseFloat(Acumuladores.SUBTOTAL),
      bruto :parseFloat(Acumuladores.TOTAL),
      iva :parseFloat(Acumuladores.IVA),
      montoimpuesto :parseFloat(Acumuladores.IVA),
      numeroz :0,
      factura :fac,
      impresora :this.serial, //Esto es referencial
      clienteid :id,
      nombre :name
    } 
    await this.DbSaleFoot.agregarRegistro(DataInsert).then(res => {
      this.DataItems = res;
      
      //Aqui llamo al metodo de impresion
    })
    //Cambio status en el header
    await this.DbSaleHeader.actualizarSaleTypeHeader(HeaderList[0].trans,this.statusSale.FINALIZADA);
    //Limpio Variables
    await this.imprimirTicket(HeaderList,PaymentsList, Acumuladores, Clientes,ItemsList);
    await this.cleanObservables(); 
    this.line = 0;
    //Envio la venta al backoffice
    this.connectBackOffice.sendDatos();
    return new Promise((resolve) => {
      resolve('OK');
    })

  }
  async cancelarVenta(HeaderList:any[]){
    await this.DbSaleHeader.actualizarSaleTypeHeader(HeaderList[0].trans,this.statusSale.CANCELADA);
    await this.cleanObservables();
    return new Promise((resolve) => {
      resolve('OK');
    })
  }
  
}
