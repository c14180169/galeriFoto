import { Injectable } from '@angular/core';
import { CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';

const { Camera, Storage, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  public dataFoto : Photo[] = [];
  private keyFoto : string = "foto";
  private platform : Platform;

  constructor(platform : Platform) { 
    this.platform = platform;
  }

  public async tambahFoto(){
    const foto = await Camera.getPhoto ({
      resultType : CameraResultType.Uri,
      source : CameraSource.Camera,
      quality : 100
    });

    this.dataFoto.unshift({
      filePath : "Load",
      webViewPath : foto.webPath
    });

    Storage.set({
      key : this.keyFoto,
      value : JSON.stringify(this.dataFoto)
    });

    this.simpanFoto(foto);
  }

  public async simpanFoto(foto : CameraPhoto){
    const base64Data = await this.readAsBase64(foto);

    const namaFile = new Date().getTime + '.jpeg';
    const simpanFile = await Filesystem.writeFile({
      path : namaFile,
      data : base64Data,
      directory : FilesystemDirectory.Data
    });

    if(this.platform.is('hybrid')){
      return {
        filePath: simpanFile.uri,
        webViewPath : Capacitor.convertFileSrc(simpanFile.uri)
      }
    }
    else{
      return {
        filePath : namaFile,
        webViewPath : foto.webPath
      }
    }
  }

  public async loadFoto(){
    const listFoto = await Storage.get({
      key : this.keyFoto
    });
    this.dataFoto = JSON.parse(listFoto.value) || [];

    if(!this.platform.is('hybrid')){
      for(let foto of this.dataFoto){
        const readFile = await Filesystem.readFile({
          path : foto.filePath,
          directory : FilesystemDirectory.Data
        });
        foto.webViewPath = `data:image/jpeg:base64, ${readFile.data}`;
      }
    }
    console.log(this.dataFoto);
  }

  private async readAsBase64(foto : CameraPhoto){
    if(this.platform.is('hybrid')){
      const file = await Filesystem.readFile({
        path : foto.path
      });
      return file.data;
    }
    else {
      const response = await fetch(foto.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    } 
  }

  convertBlobToBase64 = (blob : Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    }
    reader.readAsDataURL(blob);
  });
}

export interface Photo{
  filePath : string;
  webViewPath : string;
}