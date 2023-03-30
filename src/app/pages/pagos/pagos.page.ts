import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { DbmodelTiendaPagosService } from 'src/app/services/dbmodel-tienda-pagos.service';
import {Pagos, Acumuladores, Header} from 'src/app/interfaces/generaldb'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {formatCurrency, getCurrencySymbol} from '@angular/common';
import { DbSaleHeaderService } from 'src/app/services/db-sale-header.service';
import { CurrencyFormat } from 'src/app/pipes/currency-format.pipe';
@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  mainForm: FormGroup;
  @Input() Journal: any[];
  @Input() Acumuladores: Acumuladores;
  @Input() Header: Header;
  idSelected: string = "";
  montoPagado: string = "";
  montoRestante: string = "";
  Payments : any[] = [];
  tipo_platform : string;
  Pago :any = {
    RESTANTE : 0,
    PAGADO  : 0
  }
  DBPayments : any = [];
  ultimoPago : any;
  idSelectBol : boolean = false;
  cantidadIngresada;
  myColor : string = '';
  ConecctionPrinter : boolean;
  NumeroDeNota:any[]=[];
  valorIngresado:any;
  valorConvertido:any="";
  //Tasa
  listadoTasas:any[] = [
    {id : '', monto_tasa: '', fecha_cambio: '', hora_cambio: '', vigente:''}
  ];
  flagRecargo : boolean = false;
 constructor(private Modalctrl: ModalController, private alertController: AlertController,
  private db: DbmodelTiendaPagosService,
  private Patform: Platform,
  public formBuilder: FormBuilder,
  private toast : ToastController,
  private DbSaleHeader : DbSaleHeaderService,
  private CurrencyFormat: CurrencyFormat
  ) 
  {
    this.Patform.ready().then((readySource) => {
      this.tipo_platform = readySource;
      
      if(this.tipo_platform == 'cordova'){
        this.db.dbState().subscribe((res) => {
          if(res){
            this.db.fetchRegistros().subscribe(item => {
              item.forEach(element => {
                let Data : any;

                switch (element.id) {
                  case 1:
                    Data = {id:element.id, name_fpago:element.name_fpago, 
                      mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/efectivo.png',
                      recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                    break;
                  case 2:
                    Data = {id:element.id, name_fpago:element.name_fpago, 
                      mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/debito.png',
                      recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                    break;
                  case 3:
                    Data = {id:element.id, name_fpago:element.name_fpago, 
                      mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/visa.png',
                      recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                    break;
                  case 4: 
                    Data = {id:element.id, name_fpago:element.name_fpago, 
                      mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/dolar.png',
                      recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                    break;
                  default:
                    Data = {id:element.id, name_fpago:element.name_fpago, 
                      mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/default.png',
                      recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                    break;
                }
                this.Payments.push(Data);
              });
              
              //
            })
          }
        });
      }else{
        //Data para browser
        this.db.fetchRegistros().subscribe(item => {
          item.forEach(element => {
            let Data : any;

            switch (element.id) {
              case '1':
                Data = {id:element.id, name_fpago:element.name_fpago, 
                  mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/efectivo.png',
                  recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                break;
              case '2':
                Data = {id:element.id, name_fpago:element.name_fpago, 
                  mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/debito.png',
                  recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                break;
              case '3':
                Data = {id:element.id, name_fpago:element.name_fpago, 
                  mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/visa.png',
                  recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                break;
              case '4': 
                Data = {id:element.id, name_fpago:element.name_fpago, 
                  mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/dolar.png',
                  recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                break;
              default:
                Data = {id:element.id, name_fpago:element.name_fpago, 
                  mlocal:element.mlocal, paridad:element.paridad, imagen:'/assets/img/default.png',
                  recargo:element.recargo, porcentaje_recargo:element.porcentaje_recargo}
                break;
            }
            this.Payments.push(Data);
          });
        })
      }
      this.Pago.RESTANTE = this.Acumuladores.TOTAL;
      this.Pago.PAGADO = 0;
      this.DBPayments = [];
      //Tasa Vigente
      if(this.tipo_platform == 'cordova'){
      }
    })
  }
  
  ngOnInit() {
    this.mainForm = this.formBuilder.group({
      monto: ['', [Validators.required]]
    });
  }
  
  async closeWindowsPayments(){
    (this.Pago.PAGADO > 0) ? this.presentAlertErrorClear() : this.Modalctrl.dismiss();

  }
 
  async parametroVacio(){
    if(this.tipo_platform == 'cordova'){
      let toast = await this.toast.create({
        message: 'No ingreso ningun numero de nota de crédito',
        position: 'middle',
        duration: 1000
      });
      toast.present();  
      return new Promise((resolve) => {resolve('ERROR');});
    }else{
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class-pagos',
        header: 'Notas de Credito',
        subHeader : 'pagar con nota de credito',
        backdropDismiss: false,
        message: 'No ingreso ningun numero de nota de crédito',
        mode:'ios',
        buttons: [
          {
            text: 'OK',
            handler: () => {}
          }
        ]
      });
      await alert.present();
      return new Promise((resolve) => {resolve('ERROR');});
    }
      
  }
  
  async trxNotFound(){
    if(this.tipo_platform == 'cordova'){
      let toast = await this.toast.create({
        message: 'El número de nota de crédito ingresado no es válido',
        position: 'middle',
        duration: 1000
      });
      toast.present();  
    }else{
      alert('Trx no existe');
    }
  }

  
  async mensajeSoloDivisa(){
    if(this.tipo_platform == 'cordova'){
      let toast = await this.toast.create({
        message: 'Ingrese el monto de la divisa recibida',
        position: 'middle',
        duration: 1000
      });
      toast.present();  
    }else{
      alert('Ingrese el monto de la divisa recibida');
    }
  }
  quitarMediaPayments(id){
    if(id)
      document.getElementById(id).style.border = "none";
    this.idSelected = '';
    this.idSelectBol = false;
  }
  async mostrarDivisa(monto){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class-pagos', 
      header: `Monto a Pagar`,
      backdropDismiss: false,
      message: `<div style="font-size:25px !important;"><b>El monto a Pagar es ${monto}</b></div>`,
      buttons: [
       {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }

  async pagarTotalidad(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Desea pagar el monto total',
      backdropDismiss: false,
      buttons: [
       {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Si',
          handler: () => {
            this.pagar();
          }
        }
      ]
    });

    await alert.present();
  }

  MediaPayments(id){
    if(this.idSelected)
      document.getElementById(this.idSelected).style.border = "none";
    document.getElementById(id).style.border = "3px solid #b86a04";
    this.idSelected = id;
    this.idSelectBol = true;
    //Validar si es forma de pago extranjera
    let data = this.Payments.find(element => element.id == id);
    let valorRecargo:any = 0;
    console.log(data);
    if(data.mlocal == 'false'){
      //Muestro Equivalente
      let price:any = this.mainForm.value.monto.split('.').join('');
      if(price != ""){
        //Si el pago fue Divisa es necesario actualizar el monto Restante, y e Total
        if(data.recargo == 'true')
          //valorRecargo = (data.porcentaje_recargo / 100);
          valorRecargo = (3 / 100);
        if(!this.flagRecargo){
          this.flagRecargo = false; //Es irrelevante mantenerlo en TRUE ya que el recargo puede ser parcial
          //Evaluo la tasa
          let tasa = Number(this.listadoTasas[0].monto_tasa) * Number(data.paridad);
          //Tengo que evaluar si el monto recibido en divisas es mayor al subtotal
          let recibido = tasa * parseFloat(price);
          //Si el recibido es mayor al subtotal, solo recalculo el subtotal
          if(recibido > this.Acumuladores.TOTAL){
            this.Pago.RESTANTE = this.Pago.RESTANTE  + (this.Acumuladores.TOTAL * valorRecargo);
            this.Acumuladores.TOTAL = this.Acumuladores.TOTAL + (this.Acumuladores.TOTAL * valorRecargo);
           
          }
          else{//En este escenario solo recalculo el monto recibido
            this.Pago.RESTANTE = this.Pago.RESTANTE  + (recibido * valorRecargo);
            this.Acumuladores.TOTAL = this.Acumuladores.TOTAL + (recibido * valorRecargo);
           
          } 
        
        
          
        }
        this.pagar()
      }else{
        //En este punto debo averiguar si la moneda extranjera tiene un recargo
        if(data.recargo == 'true')
          valorRecargo = (data.porcentaje_recargo / 100);
        document.getElementById(id).style.border = "none";
        let tasa = Number(this.listadoTasas[0].monto_tasa) * Number(data.paridad);
        let montoCompleto:any = this.Pago.RESTANTE + (this.Pago.RESTANTE * valorRecargo);
        let divisa = parseFloat(montoCompleto)/tasa;
        this.mostrarDivisa(divisa.toFixed(2));
      }
    }else{
      //Si es moneda Local
      let price:any = this.mainForm.value.monto.split('.').join('');
      if(price != ""){
        this.pagar();
      }else{
        //Mensaje de si desea Pagar la totalidad de la factura
        this.pagarTotalidad();
      }
    }
      
  }
  //Metodo llamado al usar una forma de pago
  pagar(){
    let monto;
    let price:any = this.mainForm.value.monto.split('.').join('');
    if(price == "" || price == undefined){
      price = this.Pago.RESTANTE;
      price = String(price);
    }
    price = price.replace(',','.');
    if(Number(price) > 0 || !isNaN(price)){
      let data = this.Payments.find(element => element.id == this.idSelected);
      //Validacion de si es divisa
      if(data.mlocal == 'false'){
        let tasa = Number(this.listadoTasas[0].monto_tasa) * Number(data.paridad);
        monto = parseFloat(price)*tasa;
        this.valorIngresado = price;
      }else{
        monto = price;
        this.valorIngresado = 0;
      }
      if(!isNaN(monto)){ // False si es numero
        this.actualizarMontosUpdate(monto);
        this.agregarPago(monto);
        this.actualizaMontos(monto);
        if(this.Pago.RESTANTE > 0){
          this.valorConvertido = '';
          this.quitarMediaPayments(this.idSelected);
        }
      }
      
    }else{
      this.presentAlertError();
    }
  }
  actualizarMontosUpdate(monto){
    if(monto > 0){
      let restante = parseFloat(this.Pago.RESTANTE) - monto;
      let pagado = parseFloat(this.Pago.PAGADO) + parseFloat(monto);
      this.Pago.RESTANTE = restante;
      this.Pago.PAGADO = pagado;
    }
  }
  actualizaMontos(monto){
    if(monto > 0){
      //Movido a actualizarMontosUpdate
      /*let restante = parseFloat(this.Pago.RESTANTE) - monto;
      let pagado = parseFloat(this.Pago.PAGADO) + parseFloat(monto);
      this.Pago.RESTANTE = restante;
      this.Pago.PAGADO = pagado;*/
      this.paymentsSale();
    }
  }
  agregarPago(monto){
    let data = this.Payments.find(element => element.id == this.idSelected);
    let descformapago = data.name_fpago;
    let formapagoid = this.idSelected;
    //Actualizacion para manejar Vuelto
    let vuelto = 0;
    if(this.Pago.RESTANTE < 0){
      vuelto = Number(this.Pago.RESTANTE) * -1;
      
    }
    console.log(vuelto);
    //Averiguo si es moneda extranjera
    let local = 'true';
    let tasa = 0;
    if(data.mlocal == 'false'){
      local = 'false';
      tasa = Number(this.listadoTasas[0].monto_tasa) * Number(data.paridad);
    }
    let Data = {'id' : formapagoid, 'desc': descformapago, 'moneda': 'Bs', 'monto': monto, 
    'vuelto': vuelto, 'moneda_local' : local, 'monto_divisa' : this.valorIngresado, 'tasa_calculo': tasa, 
    };
    this.ultimoPago = Data;
    console.log(Data);
    this.DBPayments.push(Data);
  }
  paymentsSale(){
    if(this.Pago.RESTANTE <= 0){
      let vuelto = this.Pago.RESTANTE * -1;
      this.presentAlertConfirm(vuelto);
    }
    
  }
  async cerrarModal(){
    this.flagRecargo = false;
   await  this.Modalctrl.dismiss({
      DBPayments : this.DBPayments
    });
  }
  async asyncForEach(array, callback) {
    let index = 0;
   for (index = 0; index < array.length; index++) {
     await callback(array[index], index, array);
   }
  }
  async presentAlertConfirm(vuelto) {
    vuelto = this.formato(vuelto);
    //Verifico si solo hay una forma de pago ya que si el pago es combinado mantengo los Bs
  //  console.log(this.ultimoPago);
    if(this.DBPayments.length == 1){
      await this.asyncForEach(this.DBPayments, async (element:any) => {
   //     console.log(element);
        let idPago = element.id;
        let PagoRealizado = this.Payments.find(element => element.id == idPago);
        //console.log(PagoRealizado);
        if(PagoRealizado.mlocal == 'false'){
          let tasa = Number(this.listadoTasas[0].monto_tasa) * Number(PagoRealizado.paridad);
          vuelto = vuelto.replace('Bs','');
          vuelto = vuelto.split('.').join('');
          vuelto = vuelto.replace(',','.');
          vuelto = parseFloat(vuelto)/tasa;
          console.log(tasa,vuelto);
          vuelto = parseFloat(vuelto).toFixed(2);
        }
      });
         
    }
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Pago Finalizado',
      backdropDismiss: false,
      message: `<p>VUELTO <strong>${vuelto}</strong></p>
                <img class="my-custom-img" src="assets/img/check.png"></img>`,
      buttons: [
       {
          text: 'Finalizar',
          handler: () => {
              this.cerrarModal();
          }
        }
      ]
    });

    await alert.present();
  } 

  async presentAlertError() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'ERROR',
      backdropDismiss: false,
      message: 'El monto no puede viajar vacio',
      buttons: [
       {
          text: 'Cerrar',
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }
  async presentAlertErrorClear() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class-pagos',
      header: 'ERROR',
      backdropDismiss: false,
      message: 'Si presiona continuar se perderan los registros de los pagos realizados',
      buttons: [
       {
          text: 'Cerrar',
          handler: () => {

          }
        },
        {
          text: 'Continuar',
          handler: () => {
            //Aqui cambio el status de las cabeceras de NC otra vez a 5
            this.NumeroDeNota.forEach(async (element) => {
              await this.DbSaleHeader.actualizarSaleTypeHeader(element,5);
            });
            //Ahora cambio el recargo en la cabecera
           
            this.DbSaleHeader.actualizarRecargo(this.Header[0].trans,'false',0);
            this.Modalctrl.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }
  updateValue(value: string) {
    let dec;
    let dec2; 
    dec = String(value).split(",");
    if(dec.length == 2){
      dec2 = dec.pop();
      if(dec2.length < 3)
        return
    }
    let price:any = value.split('.').join('');
    price = price.replace(',','.');
    if(!isNaN(price)){ // False si es numero
      console.log(price);
      let priceconvert = this.CurrencyFormat.transform(price,'',0,'.',',',3);
      console.log(priceconvert);
      this.valorConvertido = priceconvert;
    }
  }

  formato(value){
    return formatCurrency(value, 'es-VE', getCurrencySymbol('Bs', 'wide'));
  }

}

interface Payments {
  name: string;
  ico: string;
  style: string;
  idPayment: string;
}