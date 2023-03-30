import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatAccordionTogglePosition } from '@angular/material/expansion';
import { MatExpansionModule } from '@angular/material/expansion';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { DbSaleHeaderService } from 'src/app/services/db-sale-header.service';
import { ItemModifyService } from 'src/app/services/item-modify.service';
import { DbSaleItemsService } from 'src/app/services/db-sale-items.service';
import { Items, Configuracion } from 'src/app/interfaces/generaldb';
import { Subscription } from 'rxjs';
import { DbmodelTiendaConfigService } from 'src/app/services/dbmodel-tienda-config.service';
@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {
  @Input() cabecera      : boolean;
  @Input() flagMonedaLocal      : boolean;
  @Input() Acumuladores : any[];
  @Input() togglePosition : MatAccordionTogglePosition;
  tipo_platform : string;
  Items : Subscription [];
  Journal: any[] = [];
  active: boolean = false;
  itemSubs: Subscription;
  dbStateSubs: Subscription;
  panelState : any;
  transAct : Number = 0;
  lineAct : Number = 0;
  listadoTasas:any[] = [
    {id : '', monto_tasa: '', fecha_cambio: '', hora_cambio: '', vigente:''}
  ];
  itemSubsConf : Subscription;
  itemSubs2Conf : Subscription;
  DataConf:any[] = [];
  simboloMonedaExtranjera:any = {clave : '', valor:''};
  constructor(
    private Patform: Platform,
    private Modalctrl: ModalController,
    private itemModify: ItemModifyService,
    private alertController: AlertController,
    private DbSaleItemsService : DbSaleItemsService,
    private DbSaleHeaderService: DbSaleHeaderService,
    private dbConfig: DbmodelTiendaConfigService,
    ) 
    { 
      this.Patform.ready().then((readySource) => {
        this.tipo_platform = readySource;
        if(this.tipo_platform == 'cordova'){
           //ITEMS
           this.dbStateSubs = this.DbSaleItemsService.dbState().subscribe((res) => {
            if(res){
              this.active = true;
            this.itemSubs = this.DbSaleItemsService.fetchRegistros().subscribe(item => {
                this.Items = item;
                this.fillJournal(this.Items);
              })
            }
          });
        }else{
          //Items
          this.itemSubs =  this.DbSaleItemsService.fetchRegistros().subscribe(item => {
            this.Items = item;
            //Lleno el Journal justo aqui, dentro de la respuesta del observable
            this.fillJournal(this.Items);
          })
        }
        //Tasa Vigente
        
        //Conf de simbolo
        //Simbolo de Sistema
      if(this.tipo_platform == 'cordova'){
        this.itemSubsConf = this.dbConfig.dbState().subscribe((res) => {
          if(res){
            this.dbConfig.obtenerRegistros().then(_ => {
              this.itemSubs2Conf = this.dbConfig.fetchRegistros().subscribe(item => {
                this.DataConf = item;
                this.simboloMonedaExtranjera = this.DataConf.find(element => element.clave == 'SIMBOLO_MONEDA_EXTRANJERA');
                console.log(this.simboloMonedaExtranjera.valor);
              })
            })
          }
        });
      }else{
        this.dbConfig.obtenerRegistros().then( (item:Configuracion[]) => {
          this.DataConf = item;
          this.simboloMonedaExtranjera = this.DataConf.find(element => element.clave == 'SIMBOLO_MONEDA_EXTRANJERA');
        });
      }
      })
    }
  ngOnDestroy(){
    //Esto es Optimizacion del codigo
    this.itemSubs.unsubscribe();
    if(this.active){
      this.dbStateSubs.unsubscribe();
      this.active = false;
    }
    //new
    this.transAct = 0;
    this.lineAct = 0;
    if(this.tipo_platform == 'cordova'){
      this.itemSubsConf.unsubscribe();
      this.itemSubs2Conf.unsubscribe();
    }
  }
  ngOnInit() {
  }

  async salirConArgumentos(){
    await this.Modalctrl.dismiss({
      Journal: this.Journal
    });
  }
  async closeWindowsJournal(){
    await this.Modalctrl.dismiss({
      Journal: this.Journal
    });
  }
  async moodifyQty(cantidad, accion, trans,linenmbr){
    let validate : boolean;
    validate = false;
    if(accion == 'minus'){
      if(parseInt(cantidad) > 1){
        cantidad = parseInt(cantidad) - 1;
        validate = true;
      }
      else
        console.log("No puedes dismuniur una cantidad que ya vale 1")
    }
    if(accion == 'more'){
      cantidad = parseInt(cantidad) + 1;
      validate = true;     
    }
    if(validate){
      this.transAct = trans;
      this.lineAct = linenmbr;
      this.itemModify.itemQtyModify(cantidad,trans,linenmbr)
      .then(res =>{
      })
      .catch(res => {console.log(res)})
    }
  }
  async deleteItem(trans,linenmbr){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Eliminar Registro',
      backdropDismiss: false,
      message: `¿Desea Eliminar este articulo?`,
      buttons: [
       {
          text: 'Si',
          handler: () => {
            this.itemModify.deleteItem(trans,linenmbr).then(res =>{
              //console.log("Todo Ok");
            })
          }
        },
        {
          text: 'No',
          handler: () => {}
        }
      ]
    });

    await alert.present();
    
  }
  fillJournal(Items){
    this.Journal = [];
    //Items.forEach(element => {
      Items.forEach( e => {
        let expanded : boolean = false;
        let nopesable:boolean;
        let mostrarBoton:boolean = false;
        if(this.lineAct == e.linetrans && this.transAct == e.trans)
          expanded = true;
        if (Number.isInteger(e.cantidadvendido)) {
          nopesable = true;
          mostrarBoton = true;
        }else{
          nopesable= false;
          mostrarBoton = false;
        }
        //Para el requiere precio
        if(e.cantidadvendido == 1 && e.amtsold != e.price1){
          //Usare el mismo flag de pesable
          mostrarBoton = false; 
        }else{
          mostrarBoton = true; 
        }
        let array = {
          currency: 'Bs', price: parseInt(e.price1)*e.cantidadvendido, cod: e.articulo, item: e.pludesc,
          trans : e.trans, line: e.linetrans, iva : e.totalivaproducto,
          cantidad: e.cantidadvendido, amtsold : e.amtsold, expanded : expanded , pesable: mostrarBoton
        }
        this.Journal.push(array);
      });
   // });
  }
}

  
  