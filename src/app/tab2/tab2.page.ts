import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  num : Number;
  answer : Number = 0;
  check : Boolean = false;

  constructor(public toastController : ToastController, public fotoService : FotoService) {}

  ionViewWillEnter(){
    this.num = Math.floor(Math.random() * 10);
    this.check = false;
    console.log(this.num);
    
  }
  async ngOnInit(){
    await this.fotoService.loadFoto();
  }

  checkNumber(){
    if(this.answer == this.num){
      this.check = true;
      this.presentToast("Correctly guessed the number");
    }
    else{
      this.answer = 0;
      this.presentToast("Wrong guess");
    }
    console.log(this.answer);
  }

  async presentToast(msg : string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}
