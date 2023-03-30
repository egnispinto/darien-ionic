import { Component, OnInit} from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { DomSanitizer } from '@angular/platform-browser';

export interface img {
  data : any;
  fullPath : any;
};

@Component({
  selector: 'app-imagenes',
  templateUrl: './imagenes.component.html',
  styleUrls: ['./imagenes.component.scss'],
})

export class ImagenesComponent implements OnInit {
  tipo_platform : string;
  fotos:img[] = [];
  options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }
  base64Image;
  picture;
  imageURLSanitized:any;
  imageSrc;
  imageSrc2:img;
  constructor(
    private Patform: Platform,
    private Modalctrl: ModalController,
    private file : File,
    private photoLibrary: PhotoLibrary,
    private alertController: AlertController,
    private camera: Camera,
    public DomSanitizer: DomSanitizer
  ) 
  { 
    this.Patform.ready().then((readySource) => {
      this.tipo_platform = readySource;
      this.renderingPictures();
     
      
    });
  }

  renderingPictures(){
   // if(this.tipo_platform == 'cordova'){
    this.fotos= [];
      if(this.file.applicationDirectory){
        this.file
        .checkDir(this.file.applicationDirectory + 'www/assets/', 'items')
        .then(async(result) => {
          if(result){
            await this.file.listDir(this.file.applicationDirectory + 'www/assets/', 'items')
            .then(res => {
              res.forEach(element => {
                if(element.isFile){
                  element.fullPath = element.fullPath.replace('/www','');
                  let data =  {
                    data : element.fullPath,
                    fullPath : element.fullPath
                  }
                  this.fotos.push(data);
                }
              })
            })
          }
        }).catch((error) => {
        console.log('error:' + JSON.stringify(error));
        });
      }
      if(this.file.externalDataDirectory){
        this.file
        .checkDir(this.file.externalDataDirectory, '')
        .then(result => {
          if(result){
            this.file.listDir(this.file.externalDataDirectory, '')
            .then(res => {
              res.forEach(async(element) => {
                console.log(element);
                if(element.isFile){//SI ES UN ARCHIVO
        
                    //Otra prueba 
                    this.file.readAsDataURL(this.file.externalDataDirectory, element.name).then(dataurl => {
                      let database64 = this.DomSanitizer.bypassSecurityTrustResourceUrl((dataurl));
                      let fullPath = '/files-external/'+element.name;
                      let res = fullPath.indexOf("/files-external/");
                      console.log(res); //0
                      console.log(res);
                      let data =  {
                        data : dataurl,
                        fullPath : fullPath
                      }
                      this.fotos.push(data);
                    },
                  (error) =>{
                    console.log(error.message);
                  });
                }
              });
            })
          }
        }).catch((error) => {
          this.file.createDir(this.file.externalDataDirectory, 'items', false);
        });
      }
    
  }

  
  ngOnInit() {}
  async closeWindows(){
    await this.Modalctrl.dismiss({
      srcImg: ''
    });
  }

  async seleccionarImagen(img){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Agregar Imagen',
      backdropDismiss: false,
      message: `¿Desea Agregar?`,
      buttons: [
       {
          text: 'Si',
          handler: () => {
            console.log(img);
            this.Modalctrl.dismiss({
              srcImg: img
            });
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

  base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);
  
  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);
  
      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
  }

   AccessGallery(){
    this.camera.getPicture({
       sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
       destinationType: this.camera.DestinationType.DATA_URL, //DATA_URL FILE_URI
       allowEdit: true,
       encodingType:0
      }).then((imageData) => {
       let img = this.base64toBlob(imageData,'image/jpeg');
       console.log(img);
       //cordova.file.externalDataDirectory
       //const tempFilename = imageData.substr(imageData.lastIndexOf('/') + 1);
       var tempFilename =  new Date().getTime() + '.jpeg'; 
       this.file.createFile(this.file.externalDataDirectory, tempFilename,true).then(
        function(success){
          console.log('createFile');
          console.log(success)
        },
        function(error){
          console.log("Error createFile");
          alert(error);
        }
       )
       let that = this;
       this.file.writeFile(this.file.externalDataDirectory, tempFilename, img,{append: true, replace: true}).then(
        (success) => {
          that.renderingPictures();
          console.log(success)
        },
        (error) => {
          alert(error);
        }
      )
        
        }, 
      (err) => {
        console.log(err);
      });
   }

   
   
 
}
