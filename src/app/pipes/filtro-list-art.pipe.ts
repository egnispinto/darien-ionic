import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroListArt'
})
export class FiltroListArtPipe implements PipeTransform {

  transform(arreglo: any[], texto: string): any[] {
    
    if(texto === '')
      return arreglo;
      texto = texto.toLowerCase();
    return arreglo.filter(
      (item) => 
      (item.name_articulo.toLowerCase().includes(texto) ) ||
      (String(item['id']).toLowerCase().includes(texto)) || 
      (item.barras[0].cod_barra.toLowerCase().includes(texto))
      );
  }

}
