import { Component, OnInit } from '@angular/core';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx'
import { Papa } from 'ngx-papaparse';
import { FilePath } from '@ionic-native/file-path/ngx'
import { SMS } from '@ionic-native/sms/ngx';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(private fileChooser: FileChooser, private file: File, private papa: Papa, private filePath: FilePath, private sms: SMS, private toastController: ToastController, private storage:Storage, public loadingController: LoadingController ) { 
    this.setContacts = this.setContacts.bind(this)
    this.parseCsv = this.parseCsv.bind(this)
  }
  excelPath: '';
  csvString: any = '';
  parsedContacts: any[] = [];
  message: '';
  includeName: boolean = false;
  templates: any[] = [];
  sendStatus: any[] = []

  ngOnInit() {
    //get all templates
    this.storage.get('Templates')
        .then((result) => {
          let templates = JSON.parse(result)
          console.log(templates)
          this.templates = templates
        })
  }

  changeTemplate($event) {
    let selectedTemplate = $event.target.value
    this.templates.map((template) => {
      if (template.Title == selectedTemplate) {
        this.message = template.Content
      }
    })
  }
  
  updateIncludeName() {
    // let nameCheck = this.includeName
    // this.includeName  = !nameCheck
    console.log(this.includeName)
  }


  async send() {

    const loading = await this.loadingController.create({
      message: 'Sending Messages..',
    });

    loading.present()

    await Promise.all(this.parsedContacts.map(async (contact, index) => {
      console.log(index)
      console.log('Phone number received => '+contact['Phone Number'])
      let rawPhone = contact['Phone Number']
      // console.log(rawPhone)
      let phone = this.padder(rawPhone)
      
      let content
  
      //Get the message and prepare based on include name check
      if (this.includeName == true) {
        content = 'Dear '+contact['Firstname']+', '+this.message
      }

      if (this.includeName == false) {
        content = this.message
      }
      console.log('Message to be sent => '+content)
      console.log('phone number to be fed into sms API => '+phone)
      
     await this.sms.send( phone, content)
          .then((response) => {
            console.log(response)
            let status = {}
            status['Phone'] = phone
            status['Status'] = response
            this.sendStatus.push(status)
            
          })
          .catch(err => console.log('This is the "Catch" error => '+err))
    }))

    console.log(this.sendStatus)
    console.log('no more iterations')
    loading.dismiss()
    this.presentToastWithOptions('All messages sent!')
    this.message = ''
    this.excelPath = ''
    this.csvString = ''
    this.parsedContacts = []
    this.sendStatus = []
  }

  padder(phoneNumber) {
    //convert to string
    let phone = phoneNumber.toString()
    //check the length of the phone number
    if (phone.length == 11) {
      return phone
    }

    if(phone.length == 10) {
      //This is a high chance that it is missing
      //the leading 0. 
      //Pad the  0
      let phone = '0'+phoneNumber
      return phone
    }
  }

  setContacts(contacts) {
    console.log(contacts.data)
    contacts.data.pop()
    this.parsedContacts = contacts.data
    let contactCount = contacts.data.length
    this.presentToastWithOptions(contactCount+' contacts found!')
  } 

  async presentToastWithOptions(info) {
    const toast = await this.toastController.create({
      message: info,
      showCloseButton: true,
      position: 'bottom',
      duration: 3000
    });
    toast.present();

  }

  parseCsv(){
    
    this.papa.parse(this.csvString, {
      header: true,
      complete: this.setContacts
    })
  }


  readCsvFile() {

    let modifiedPath = this.excelPath.substring(0, this.excelPath.lastIndexOf('/'));
    let fileName = this.excelPath.substring(this.excelPath.lastIndexOf('/')+1, this.excelPath.length);

    this.file.readAsText(modifiedPath, fileName)
        .then(result => {
          this.csvString = result
          this.parseCsv()
        })
    
  }

  setExcelPath(uri) {
    this.excelPath = uri
    this.readCsvFile()
  }

  convertContentPath(uri) {
    this.filePath.resolveNativePath(uri)
        .then((filePath) => {
          this.setExcelPath(filePath)
        })
        .catch(err => console.log(err));
  }

  openFileManager() {
    this.fileChooser.open()
        .then(uri => {
          this.convertContentPath(uri)
        })
        .catch(e => console.log(e));
  }
}
