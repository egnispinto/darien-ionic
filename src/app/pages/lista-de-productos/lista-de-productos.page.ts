
import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController, IonSearchbar, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { JournalComponent } from 'src/app/components/carrito-de-compras/journal.component';
import { PagosPage } from '../pagos/pagos.page';
import {Articulos,Configuracion} from 'src/app/interfaces/generaldb'
import { DbmodelMaestraArticulosService } from 'src/app/services/dbmodel-maestra-articulos.service';
import { Header, Items, Payments, Foot, Barras } from 'src/app/interfaces/generaldb'
import { DbSaleHeaderService } from 'src/app/services/db-sale-header.service';
import { BillfireService } from 'src/app/services/billfire.service';
import { DbSaleItemsService } from 'src/app/services/db-sale-items.service';
import { DbConfigCloudService } from 'src/app/services/db-config-cloud.service';
//Animation
import { Animation, AnimationController } from '@ionic/angular';
import { DbSalePaymentsService } from 'src/app/services/db-sale-payments.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DbmodelMaestraBarrasService } from 'src/app/services/dbmodel-maestra-barras.service';
import { DbmodelTiendaConfigService } from 'src/app/services/dbmodel-tienda-config.service';
import { File } from '@ionic-native/file/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DbmodelMaestraDptosService } from 'src/app/services/dbmodel-maestra-dptos.service';
import { IonInfiniteScroll } from '@ionic/angular';
@Component({
  selector: 'app-layout',
  templateUrl: './lista-de-productos.page.html',
  styleUrls: ['./lista-de-productos.page.scss'],
})
export class LayoutPage implements OnInit{
  hostElement: HTMLElement;
  articuloBuscar = '';
  Articulos: any[] = [];
  ArticulosAll: any[] = [];
  InicioPaginate : number = 0;
  TopPaginate : number = 1000;
  ElementsPaginate :  number = 20;
  Departamentos : any = [];
  Header : Header [];
  Items : Items [];
  Payments : any[];
  Journal: any[] = [];
  tipo_platform : string;
  Acumuladores :any = {
    valid : false,
    TOTAL  : 0,
    IVA : 0,
    SUBTOTAL : 0
  }
  subtotal : number = 0;
  iva: number = 0;
  total: number = 0;
  active : boolean = false;
  segment: string;
  clientes : any[];
  Barras : Barras[] = [];
  BarraScanner : string = '';
  itemFetchBarras: Subscription;
  itemdbStateBarras: Subscription;
  itemSubsConf : Subscription;
  itemSubs2Conf : Subscription;
  @ViewChild('div') div: ElementRef;
  @ViewChild('searchInput', {static: false}) searchInput: IonSearchbar;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  //Variables de multimoneda
  flagMonedaLocal:boolean = true;
  flagMonedaExtranjera:boolean = false;
  hideDpto:boolean = true;
  findDpto:boolean = false;
  DataConf:any[] = [];
  simboloMonedaExtranjera:any;
  flagPayments:boolean = false;
  trabajarSinImpresora:any;
  backbutton: Subscription;
  lastTimeBackPress = 0;
  isCustomerNoSelected : boolean = true;
  private isConnectReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  DataConfigCloudService :any;
  _token:any;
  _activarBoton:boolean = false;
  constructor(private Modalctrl : ModalController, private PopoverCtrl: PopoverController,
    private barcodeScanner: BarcodeScanner,  
    private Patform: Platform,
    private dbArticulo: DbmodelMaestraArticulosService,
    private DbSaleHeaderService: DbSaleHeaderService,
    private DbSaleItemsService : DbSaleItemsService,
    private DbSalePayments : DbSalePaymentsService,
    private billfire : BillfireService,
    private animationCtrl: AnimationController,
    private alertController: AlertController,
    private dbBarra: DbmodelMaestraBarrasService,
    private dbConfig: DbmodelTiendaConfigService,
    private file : File, 
    public DomSanitizer : DomSanitizer, //No borrar, se llama desde el htmll una funcion de sanizater
    private toast: ToastController,
    private router : Router,
    private dbDpto : DbmodelMaestraDptosService,
    private DbConfigCloudService: DbConfigCloudService
    )
  {
  
    this.Patform.ready().then(async (readySource) => {
      this.tipo_platform = readySource;
      
      //Simbolo de Sistema
      if(this.tipo_platform == 'cordova'){
        this.itemSubsConf = this.dbConfig.dbState().subscribe((res) => {
          if(res){
            this.dbConfig.obtenerRegistros().then(_ => {
              this.itemSubs2Conf = this.dbConfig.fetchRegistros().subscribe(item => {
                this.DataConf = item;
                this.simboloMonedaExtranjera = this.DataConf.find(element => element.clave == 'SIMBOLO_MONEDA_EXTRANJERA');
                this.trabajarSinImpresora = this.DataConf.find(element => element.clave == 'TRABAJAR_SIN_IMPRESORA');
              })
            })
          }
        });
      }else{
        this.dbConfig.obtenerRegistros().then( (item:Configuracion[]) => {
          this.DataConf = item;
          this.simboloMonedaExtranjera = this.DataConf.find(element => element.clave == 'SIMBOLO_MONEDA_EXTRANJERA');
          this.trabajarSinImpresora = this.DataConf.find(element => element.clave == 'TRABAJAR_SIN_IMPRESORA');
        });
      }
      if(this.tipo_platform == 'cordova'){
        //Recuperare las Barras
        this.itemdbStateBarras = this.dbBarra.dbState().subscribe(async(res) => {
          
          if(res){
            await this.dbBarra.obtenerRegistros().then(_ => {
              this.itemFetchBarras = this.dbBarra.fetchRegistros().subscribe((item:Barras[]) => {
                this.Barras = item;
              })
            })
            //Lista de Articulos
            this.dbArticulo.dbState().subscribe(async(res) => {
              if(res){
                this.dbArticulo.fetchRegistros().subscribe(item => {
                this.Articulos = [];
                const itemEmpty = new Array({ id: '', cod_barra: '', id_articulo: '' });
                  let arrayTemp : any[] = [];
                  item.forEach((element:any) => {
                    let barras = this.Barras.filter(elemento => elemento.id_articulo == element.id);
                    if(barras.length > 0)
                      element['barras']=barras;
                    else
                      element['barras']=itemEmpty;
                      if(element.url_img != null){
                        if(element.url_img.indexOf("/files-external/") == 0){
                          let arr = element.url_img.split("/files-external/");
                          this.file.readAsDataURL(this.file.externalDataDirectory, arr[1]).then(dataurl => {
                            element.url_img = dataurl;
                            arrayTemp.push(element);
                          });
                        }else{
                          arrayTemp.push(element);
                        }   
                      }else{
                        element.url_img = "";
                        arrayTemp.push(element);
                      }
                    this.Articulos.push(element);    
                    this.ArticulosAll.push(element);
                  });
                 
                  this.ordenarArticulos(1);
                })
              }
            });
          }//fIN DEL IF RES
        });
        
        //Cabecera
        this.DbSaleHeaderService.dbState().subscribe((res) => {
          if(res){
            this.DbSaleHeaderService.obtenerRegistros().then(_ => {
             this.DbSaleHeaderService.fetchRegistros().subscribe(item => {
                this.Header = item;
                this.fillItem();
              })
            })
          }
        });
       
        //BackButton
         //Back buutton con confirmacion
        //https://forum.ionicframework.com/t/how-to-exit-app-with-device-back-button-from-a-particular-page/84644/9
        this.lastTimeBackPress = 0;
        var timePeriodToExit  = 2000;
        Patform.backButton.subscribe(async()=>{
          if(this.router.url == '/layout'){
            if (new Date().getTime() - this.lastTimeBackPress < timePeriodToExit) {
              ///this.platform.exitApp(); //Exit from app
              this.lastTimeBackPress = 0;
              navigator['app'].exitApp(); //Exit from app
            } else {
              let toast = await this.toast.create({
                message: 'Presiona nuevamente para salir',
                position: 'bottom',
                duration: 2000
              });
              toast.present(); 
              this.lastTimeBackPress = new Date().getTime();
            }
          }
        });
       
      }else{
        //Recuperare las Barras
        await this.dbBarra.obtenerRegistros().then((item:Barras[]) => {
            this.Barras = item;
        })
        //Data para browser
        //Lista de articulos
        this.dbArticulo.fetchRegistros().subscribe(item => {
          const itemEmpty = new Array({ id: '', cod_barra: "", id_articulo: "" });
          this.ArticulosAll = [];
          item.forEach(val =>{
            let barras = this.Barras.filter(element => element.id_articulo == val.id);
            if(barras.length > 0)
              val['barras']=barras;
            else
              val['barras']=itemEmpty;
                          
            //val);
            this.ArticulosAll.push(val);
            this.Articulos.push(val);
            
          })
          this.ordenarArticulos(1);
          //Prueba de paginacion
          this.Articulos = this.ArticulosAll.slice(this.InicioPaginate, this.TopPaginate);
          this.InicioPaginate = this.TopPaginate;
          this.TopPaginate = this.TopPaginate+this.ElementsPaginate;
        })
        //Cabecera
        this.DbSaleHeaderService.fetchRegistros().subscribe(item => {
          this.Header = item;
        })
        //Items
        this.DbSaleItemsService.fetchRegistros().subscribe(item => {
          this.Items = item;
          //Lleno el Journal justo aqui, dentro de la respuesta del observable
          this.fillJournal(this.Items);
          this.fillTotales(this.Items);
        })
        //Payments
        this.DbSalePayments.fetchRegistros().subscribe(item => {
          this.Payments = item;
        })
      }
      
      if(this.Header){
        if(this.Header.length === 0){
          this.limpiarAcumuladores();
        }
      }

      //OBTENER TODOS LOS DEPARTAMENTOS
      this.Departamentos.push(
        {id : '0', name_dpto: 'Todos los Dptos', cod_dpto: '0', url_dpto : ''}
      )
      if(this.tipo_platform == 'cordova'){
        this.dbDpto.dbState().subscribe((res) => {
          if(res){
            this.dbDpto.obtenerRegistros('maestra_departamentos').then(_ => {
              this.dbDpto.fetchRegistros('maestra_departamentos').subscribe((item:any) => {
                this.Departamentos = [];
                this.Departamentos.push(
                  {id : '0', name_dpto: 'Todos los Dptos', cod_dpto: '0', url_dpto : ''}
                );          
                item.forEach(element => {
                  this.Departamentos.push(element);
                });
              })
            })
            
          }
        });
      }else{
        this.dbDpto.obtenerRegistros('maestra_departamentos').then((item:any) => {
          this.Departamentos = [];
          this.Departamentos.push(
            {id : '0', name_dpto: 'Todos los Dptos', cod_dpto: '0', url_dpto : ''}
          );     
          item.forEach(element => {
            this.Departamentos.push(element);
          });     
        })
      }
    })
  }

  //Prueba de Scanner
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: any) { //KeyboardEvent
    if(event.srcElement.nodeName == 'BODY'){
      if(event.key == 'Enter'){
        this.articuloBuscar = this.BarraScanner ;
        this.vendeArticulo(false);
        this.BarraScanner = '';
      }else{
        this.BarraScanner = this.BarraScanner + event.key;
      }
    }
  }

  ngOnInit(){
    
  }

  autofocus(){
      setTimeout(() => {
          this.searchInput.setFocus();
      }, 100);
  }

  async asyncForEach(array, callback) {
    let index = 0;
   for (index = 0; index < array.length; index++) {
     await callback(array[index], index, array);
   }
  }
  fillItem(){
    if(!this.active){
      this.active = true;
      //ITEMS
      this.DbSaleItemsService.dbState().subscribe((res) => {
        if(res){
          //Busco registros solo si hace falta
          if(this.Header){
            if(this.Header.length > 0)
              this.DbSaleItemsService.obtenerRegistros(this.Header[0].trans).then(res => {
              })
          }
          //Fin de la busqueda
          this.DbSaleItemsService.fetchRegistros().subscribe(item => {
            this.Items = item;
            this.fillJournal(this.Items);
            this.fillTotales(this.Items);
          })
        }
      });
    }
      
  }

  ordenarArticulos(tipo){
    //Ordenare por nombre
    if(tipo == 1){
      this.Articulos.sort(function(a, b) {
  
        var nameA = a.name_articulo.toUpperCase();
        var nameB = b.name_articulo.toUpperCase();
        if (nameA < nameB) {     return -1;   }      if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    }
    //Ordenare por Dpto
    if(tipo == 2){
       this.Articulos.sort(function (a:any, b:any) {
        return parseInt(a.id_dpto) - parseInt(b.id_dpto);
      })
    }
  }

  ngOnDestroy(){
    //Optimizacion
    this.itemdbStateBarras.unsubscribe();
    this.itemFetchBarras.unsubscribe();
  }
  ionViewWillUnload(){
  }
  ionViewDidLeave() {
   
  }
  async mensajeNoFacturar(){
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Impresora fuera de línea',
        mode:'ios',
        backdropDismiss: false,
        message: `<p>Por favor ponga en línea la impresora y luego proceda a pagar.</p>`,
        buttons: [
          {
            text: 'Continuar',
            handler: () => {
              resolve(false);
            }
          }
        ]
      });
      await alert.present();
    });
  }
  async facturacionNoFinalizada(){
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Impresora fuera de línea',
        backdropDismiss: false,
        message: `<p>No se pudo concluir el proceso de facturación. Ponga en línea la impresora y intentelo nuevamente</p>`,
        buttons: [
          {
            text: 'Continuar',
            handler: () => {
              resolve(false);
            }
          }
        ]
      });
      await alert.present();
    });
  }
  async mensajeNoConexion(){
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Impresora fuera de línea',
        backdropDismiss: false,
        mode:'ios',
        message: `<p>La impresora se encuentra fuera de línea. <br> ¿Desea cancelar la operación 
        para luego conectarse o desea Continuar sin la impresora en línea?</p>`,
        buttons: [
         {
            text: 'Cancelar',
            handler: () => {
              resolve(false);
            }
          },
          {
            text: 'Continuar',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
    });
  }
  async openWindowsPayments(){
    //Aqui hago validacion de si la impresora esta en linea
    let action:boolean = true;
    
    //Esta validación es de si la bandera de permitir trabajar sin conexion esta en false
    
    
      const modal = await this.Modalctrl.create({
        component: PagosPage,
        backdropDismiss:false,
        cssClass: 'my-custom-class-pagos',
        componentProps: {
          'Journal': this.Journal,
          'Acumuladores': this.Acumuladores,
          'Header':this.Header
        }
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data != undefined){
        //Averiguo la bandera
        //action ya vale TRUE en este punto

          await this.insertarPago(data.DBPayments).then(async (res) =>{ //Primero el Pago
            await this.insertarfoot(); //Luego el Pie de la TRX
          })
       
      }
    
  }

 async openWindowsJournal(){
  const modal = await this.Modalctrl.create({
    component: JournalComponent,
   // cssClass: 'my-custom-class',
    componentProps: {
      'cabecera': true,
      'flagMonedaLocal': this.flagMonedaLocal
    }
  });
  await modal.present();
  const { data } = await modal.onDidDismiss();
 }

  

  buscarArticulos(event){
   this.articuloBuscar = event.detail.value;
  }

  vendeArticulo(event){
    if(this.articuloBuscar){
      //Busco por barras
      let barra = this.Barras.find(element => element.cod_barra == this.articuloBuscar);
       if(!barra){
        this.mensajeNoVenta(`No existe la barra ${this.articuloBuscar}`);
        this.articuloBuscar = "";
        return;
      }
      this.insertarItem(barra.id_articulo);
      this.articuloBuscar = "";
    }
  }
  
  buscarArticulo(barra){
    return this.Barras.find(element => element.cod_barra == barra);
  }
  async noExisteItem(){
    if(this.tipo_platform == 'cordova'){
      let toast = await this.toast.create({
        message: 'Articulo no encontrado',
        position: 'middle',
        duration: 2000
      });
      toast.present(); 
    }
  }
  scanBarcode(){
    this.barcodeScanner.scan().then(barcodeData => {
      if(barcodeData.text != ''){
        let articulo = this.buscarArticulo(barcodeData.text);
        if(articulo != undefined){
          this.insertarItem(articulo.id_articulo);
        }
      }else{
        //No existe articulo
        this.noExisteItem();
      }
     }).catch(err => {
         alert(err);
     });
  }
  
  limpiarAcumuladores(){
    this.Journal = [];
  }


 
  /*
  SECCION DISEÑADA PARA LA INSERCION DE ARTICULOS
  */

  insertarItem(id){
    //let promise1 = this.triggerImg(id);
    let promise2 = this.billfire.InsertarArticulo(this.Header, id);
    Promise.all(
      [/*promise1,*/ promise2]
    ).then(res => {})
    
    //this.autofocus();
  }

  async insertarPago(DBPayments){
    return new Promise(async (resolve) => {
        await this.billfire.insertarPagos(this.Header, DBPayments).then(res => {
          resolve('OK');
        });
    })
  } 
  async insertarfoot(){
    //Recupero informacion de los Pagos
    await this.DbSalePayments.obtenerRegistros(this.Header[0].trans).then((item:Payments[]) => {
      this.Payments = item;
    })
    await this.billfire.FinDeVenta(this.Header, this.Payments,this.Acumuladores,this.clientes,this.Items);
    await this.DbSaleHeaderService.obtenerRegistros();
    this.clientes = [];
    this.isCustomerNoSelected = true;
    return new Promise((resolve) => {
      resolve('OK' );
    })
  }
  
  triggerImg(id){
    const elementToAnimate = document.querySelector('.imagen-'+id);
    const flyTo = document.querySelector('.BotonPagar');
    // First
    const first = elementToAnimate.getBoundingClientRect();
    const clone = elementToAnimate.cloneNode();

    const clonedElement = this.div.nativeElement.appendChild(clone);
    // Last
    const flyToPosition = flyTo.getBoundingClientRect();
    clonedElement.style.cssText = `position: fixed; top: ${flyToPosition.top}px; left: ${flyToPosition.left}px; height: 50px; width: 50px;`;
    const last = clonedElement.getBoundingClientRect();
    // Invert
    const invert = {
      x: first.left - last.left,
      y: first.top - last.top,
      scaleX: first.width / last.width,
      scaleY: first.height / last.height,
    };
    //Play
     const flyAnimation = this.animationCtrl.create()
     .addElement(clonedElement)
     .duration(50)
     .beforeStyles({
       ["transform-origin"]: "0 0",
       ["clip-path"]: "circle()",
       ["z-index"]: "10",
     })
     .easing("ease-in")
     .fromTo(
       "transform",
       `translate(${invert.x}px, ${invert.y}px) scale(${invert.scaleX}, ${invert.scaleY})`,
       "translate(0, 0) scale(1, 1)"
     )
     .fromTo("opacity", "1", "0.5");

   flyAnimation.onFinish(() => {
     clonedElement.remove();
   });

   flyAnimation.play();
    return new Promise(async (resolve) => {
      resolve('OK');
    })
  }
  

  fillJournal(Items){
    this.Journal = [];
    //Items.forEach(element => {
      Items.forEach( e => {
        let array = {
          currency: 'Bs', price: parseInt(e.price1)*e.cantidadvendido, cod: e.articulo, item: e.pludesc,
          trans : e.trans, line: e.linetrans, iva : e.totalivaproducto,
          cantidad: e.cantidadvendido, amtsold : e.amtsold       
        }
        this.Journal.push(array);
      });
   // });
  }
  fillTotales(Items){
    this.subtotal = 0;
    this.iva = 0;
    this.total = 0;
    //Items.forEach(element => {
      Items.forEach(e => {
        this.subtotal += parseFloat(e.amtsold);
        this.iva += e.totalivaproducto;
        this.total += e.totalreal;
      });
   // })
    this.Acumuladores.TOTAL = this.total;
    this.Acumuladores.SUBTOTAL = this.subtotal;
    this.Acumuladores.IVA = this.iva;
    this.Acumuladores.TOTAL > 0 ? this.Acumuladores.valid = true : this.Acumuladores.valid = false;
  }
  clearJournal(){
      this.Journal = [];
  }

  clearTotales(){
      this.subtotal = 0;
      this.iva = 0;
      this.total = 0;
    this.Acumuladores.TOTAL = 0;
    this.Acumuladores.SUBTOTAL = 0;
    this.Acumuladores.IVA = 0;
    this.Acumuladores.TOTAL > 0 ? this.Acumuladores.valid = true : this.Acumuladores.valid = false;
  }

  async cancelarVenta(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cancelar Venta',
      backdropDismiss: false,
      message: '¿Desea cancelar la venta actual?',
      buttons: [
       {
          text: 'Si',
          handler: () => {
            this.billfire.cancelarVenta(this.Header);
            this.clientes = [];
            this.isCustomerNoSelected = true;
          }
        },
        {
          text: 'No',
          handler: () => {}
        }
      ]
    });
    await alert.present();
    await this.DbSaleHeaderService.obtenerRegistros();
    return new Promise((resolve) => {resolve('OK');});
  }

  async mensajeNoVenta(msg){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Ventas',
      backdropDismiss: false,
      message: msg,
      buttons: [
       {
          text: 'OK',
          handler: () => {}
        }
      ]
    });
    await alert.present();
    return new Promise((resolve) => {resolve('OK');});
  }

  async EliminarCliente(msg){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cliente seleccionado',
      subHeader: this.clientes[0].name_cliente,
      mode: 'ios',
      backdropDismiss: false,
      message: msg,
      buttons: [
        {
          text: 'No',
          handler: () => {}
        },
       {
          text: 'Si',
          handler: () => {
            this.clientes = [];
            this.isCustomerNoSelected = true;
          }
        }
      ]
    });
    await alert.present();
    return new Promise((resolve) => {resolve('OK');});
  }

  


  async asyncSwitch(e:any){
    return new Promise(async (resolve) => {
      switch (e.detail.value){
        
        case 'cancelSale':
          if(this.Header && this.Header.length > 0){
              await this.cancelarVenta().then(res => resolve('ok'));
          }else{
            let msg = "No posee ventas para cancelar";
            await this.mensajeNoVenta(msg).then(res => resolve('ERR'));
          }  
          break;  
       
        default:
          resolve('OK');
          break;
      }
      
    })
  }
  async functionsSales(e:any){
    await this.asyncSwitch(e);
    if(e.detail.value!='0'){
      document.getElementById('segmentFunction1').setAttribute('value','0');
      document.getElementById('segmentFunction2').setAttribute('value','0');
    }
  }


  
  appendItems(number){
    let newArray = this.ArticulosAll.slice(this.InicioPaginate, this.TopPaginate);
    this.InicioPaginate = (this.TopPaginate);
    this.TopPaginate = this.TopPaginate+this.ElementsPaginate;
    newArray.forEach(element => {
      this.Articulos.push(element);
    });
    console.log(this.Articulos.length);
    console.log(this.ArticulosAll.length);
  }
}
