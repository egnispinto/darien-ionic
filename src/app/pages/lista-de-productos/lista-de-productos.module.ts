import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LayoutPageRoutingModule } from './lista-de-productos-routing.module';

import { LayoutPage } from './lista-de-productos.page';

//Componente 
import { ComponentsModule } from '../../components/components.module';
//Material Design
import { MatExpansionModule } from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTabsModule} from '@angular/material/tabs'; 
import {MatCardModule} from '@angular/material/card'; 
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button'; 
import {MatInputModule} from '@angular/material/input'; 
import {MatIconModule} from '@angular/material/icon'; 
import { PagosPage } from '../pagos/pagos.page';
import { PagosPageModule } from '../pagos/pagos.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import {MatListModule} from '@angular/material/list';
import { File } from '@ionic-native/file/ngx';
@NgModule({
  entryComponents:[
    PagosPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LayoutPageRoutingModule,
    ComponentsModule,
    MatExpansionModule, //MD
    MatGridListModule, //MD
    MatTabsModule, //MD
    MatCardModule, //MD
    MatPaginatorModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    PagosPageModule,
    PipesModule,
    MatListModule
  ],
  declarations: [LayoutPage],
  providers: [
    File
  ]
})
export class LayoutPageModule {}
