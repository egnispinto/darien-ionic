import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormat implements PipeTransform {
  transform(value: number,
      currencySign: string = '€ ',
      decimalLength: number = 2, 
      chunkDelimiter: string = '.', 
      decimalDelimiter:string = ',',
      chunkLength: number = 3): string {
        value /= 1;
      let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')';
      let num = value.toFixed(Math.max(0, ~~decimalLength));
      return currencySign+" "+(decimalDelimiter ? num.replace('.', decimalDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + chunkDelimiter);
  }
}

