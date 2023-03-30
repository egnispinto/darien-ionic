import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {
  positionConfigure : string = "portrait";
  Menu : Menu[] = [
    {ico : "hardware-chip" , name : "Personalización del sistema", routerLink : "/software-config"},
    {ico : "print" , name : "Configuración de impresora", routerLink : "/printer-fiscal"},
    {ico : "document-text" , name : "Personalización del Ticket", routerLink : "/print-ticket"},
    {ico : "cloud" , name : "Conexión remota", routerLink : "/conexion-remota"},
    {ico : "terminal" , name : "Comandos Fiscales", routerLink : "/comandos-fiscales"}
  ]
  constructor(
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {;
  }
  async parametrosVacios(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      subHeader: 'Fecha invalida',
      mode : 'ios',
      backdropDismiss: false,
      message: 'Parametro vacio',
      buttons: [
       {
          text: 'OK',
          handler: (e) => {}
        }
      ]
    });
    await alert.present();
    return new Promise((resolve) => {resolve('OK');});
  }
  async alertPrinter(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header:'Log de sistema',
      subHeader: 'Log de Impresion',
      message: `<ion-item>
      <ion-label>Fecha</ion-label>
      <ion-datetime id="fechaInicio" displayFormat="DD/MM/YYYY"
      monthShortNames="['s\u00f8n',Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'l\u00f8r']"
      placeholder="Fecha de Inicio"></ion-datetime>
    </ion-item>
    `,
      backdropDismiss: false,
      mode: 'ios',
     // message: msg,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
          }
        },
       {
          text: 'OK',
          handler: (e) => {
            var fechaInicio:any=document.getElementById("fechaInicio").lastElementChild;
            if(fechaInicio.value != ''){
                let navigateFrom : string = 
                `/printer-log/${fechaInicio.value.substring(0,10)}`;
                this.router.navigate([navigateFrom]);
            }else{
              this.parametrosVacios();
            }
          }//Fin del handler
        }
      ]
    });
    await alert.present();
    return new Promise((resolve) => {resolve('OK');});
  }
  ModalFecha(){
    this.alertPrinter();
  }
}

interface Menu{
  ico : string
  name : string
  routerLink : string
}

