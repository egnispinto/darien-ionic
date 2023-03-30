import { Injectable } from '@angular/core';
import { DbSaleItemsService } from './db-sale-items.service';
import {  Items } from 'src/app/interfaces/generaldb';
import { DbmodelTiendaImpuestosService } from './dbmodel-tienda-impuestos.service';
import { Platform } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class ItemModifyService {
  DataItem :any;
  DataImpuestos : any;
  DataModificada :any;
  tipo_platform: string = 'cordova';
  constructor(
    private dbItems : DbSaleItemsService,
    private dbImpuesto : DbmodelTiendaImpuestosService,
    private platform: Platform
    )
    { 
      this.platform.ready().then((readySource) => {
        this.tipo_platform = readySource;
      })
    }
    fillobservableIndividual(res){
      let items : Items[] = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) { 
            items.push({ 
              trans: res.rows.item(i).trans,
              pos: res.rows.item(i).pos,  
              linetrans: res.rows.item(i).linetrans,
              articulo: res.rows.item(i).articulo,
              pludesc: res.rows.item(i).pludesc,
              price1: res.rows.item(i).price1,  
              deptid: res.rows.item(i).deptid,
              impuestoid: res.rows.item(i).impuestoid,
              amtsold: res.rows.item(i).amtsold,
              totalivaproducto: res.rows.item(i).totalivaproducto,
              cantidadvendido: res.rows.item(i).cantidadvendido,  
              devueltos: res.rows.item(i).devueltos,
              anulado: res.rows.item(i).anulado,
              totalreal: res.rows.item(i).totalreal,
              descuentoitem: res.rows.item(i).descuentoitem
            });
          }
        }
        return items;
    }
  async itemQtyModify(Qty :Number,Trx :Number,LineTrans :Number)
  {
     if(Qty > 0){
       //GetInfoItemStruct
        let res = await this.dbItems.obtenerRegistroIndividual(Trx,LineTrans);
        if(this.tipo_platform == 'cordova'){
          let arrayres = this.fillobservableIndividual(res);
          this.DataItem = arrayres[0]
        }
        else
          this.DataItem = res;
        console.log(this.DataItem);
        if(this.DataItem){
        await  this.modificarCantidadMonto(Qty,this.DataItem)
          .then(res => {
            this.DataModificada = res;
          })
         await this.dbItems.actualizarRegistroIndividual(Trx,LineTrans,this.DataModificada)
          .then(res => {
            return new Promise((resolve) => {
              resolve(res);
            })
          })
          .catch(res =>{
            alert(`Hubo error en actualizarRegistroIndividual`);
            alert(this.DataModificada);
          })
        }
     } 
  }
  async modificarCantidadMonto(Qty,DataItem : any){
    let cantidadvendido = Qty;
    let price1 = DataItem.price1;
    let impuestoid = DataItem.impuestoid;
    await this.dbImpuesto.obtenerRegistro(impuestoid)
    .then(res => {
      this.DataImpuestos = res;
    });
    let iva : number = (parseFloat(price1)*cantidadvendido) * (this.DataImpuestos.valor_impuesto/10000);
    let total :number = (parseFloat(price1)*cantidadvendido) + iva;
    let totalsiniva = (parseFloat(price1)*cantidadvendido);
    let data = {
      'cantidadvendido' : cantidadvendido, 'totalivaproducto' : iva , 
      'amtsold' : totalsiniva, 'totalreal':total};
    return new Promise((resolve) => {
      resolve(data);
    })
  }
  async deleteItem(Trx,LineTrans){
    await this.dbItems.eliminarRegistro(Trx,LineTrans)
    .then(res =>{
      return new Promise((resolve) => {
        resolve(res);
      })
    })
    
  }
}
