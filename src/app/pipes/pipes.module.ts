import { NgModule } from '@angular/core';
import { CurrencyFormat } from './currency-format.pipe';
import { FiltroListArtPipe } from './filtro-list-art.pipe';
import { TruncatePipe } from './truncate.pipe';



@NgModule({
  declarations: [FiltroListArtPipe, TruncatePipe, CurrencyFormat],
  providers: [
    CurrencyFormat
  ],
  exports: [
    FiltroListArtPipe,
    TruncatePipe,
    CurrencyFormat
  ],
  imports: [ ]
})
export class PipesModule { }
