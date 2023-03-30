import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.scss'],
})
export class CabeceraComponent implements OnInit {
  myColor : string = '';
  COMPILACION:string='1.0.1';
  RutaBackoffice: string = '';
  constructor(
    public menu: MenuController,
    private Patform : Platform,
    private alertController: AlertController
    ) { 
      this.Patform.ready().then((readySource) => {
      
      })
    }

  ngOnInit() { }


  async mostrarcompilacion(){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Reto Darien',
      subHeader : 'Información',
      backdropDismiss: false,
      message: `
      Todos los derechos reservados<br>
      Versión: <b>${this.COMPILACION}</b>`,
      mode:'ios',
      buttons: [
        {
          text: 'Ok',
          handler:async () => {
          }
        }
      ]
    });
    await alert.present();
  }

  abrirBackOffice(){
    window.open(this.RutaBackoffice, '_system', 'location=yes');
  }
}
