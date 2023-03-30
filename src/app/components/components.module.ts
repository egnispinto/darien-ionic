import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CabeceraComponent } from './cabecera/cabecera.component';
import {RouterModule} from '@angular/router';
import { JournalComponent } from './carrito-de-compras/journal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ImagenesComponent } from './imagenes/imagenes.component';
import { File } from '@ionic-native/file/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatCardModule} from '@angular/material/card'; 
import { FilePath } from '@ionic-native/file-path/ngx';
@NgModule({
  declarations: [
    CabeceraComponent,
    JournalComponent,
    ImagenesComponent,
  ],
  exports: [
    CabeceraComponent,
    JournalComponent,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule
  ],
  providers: [
    File,
    PhotoLibrary,
    Camera,
    FilePath
  ],
  imports: [
    RouterModule,
    CommonModule,
    IonicModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatCardModule
  ]/*,
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]*/
})
export class ComponentsModule { }