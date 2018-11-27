import { Component} from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage {
  private selectedItem: any;
  
  constructor(private storage: Storage, private toastController: ToastController) {

  }

  templateTitle:''
  templateContent:''
  templates

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      message: 'Template Saved!',
      showCloseButton: true,
      position: 'bottom',
      closeButtonText: 'Done'
    });
    toast.present();
  }

  saveNewTemplate(){
    
    //get the current template state.
    this.storage.get('Templates')
        .then((storedTemplates) => {
          // let templateObj = JSON.parse(storedTemplates)
          // this.templates = templateObj
          // this.templates.templateTitle = this.templateContent
          // JSON.stringify(this.templates)

         if (storedTemplates == null) {
          let title = this.templateTitle

          let templatesContainer = []
          
          let preparedTemplates = {}

          preparedTemplates['Title'] = this.templateTitle
          preparedTemplates['Content'] = this.templateContent

          templatesContainer.push(preparedTemplates)
          
            // save template back
          this.storage.set('Templates', JSON.stringify(templatesContainer))
              .then((result) => {
                  this.presentToastWithOptions()
                  this.templateContent = ''
                  this.templateTitle = ''
              })
          } else {
            //there are already pre existing templates
            //get them, then add a new one.
            let existingTemplates = JSON.parse(storedTemplates)
            // console.log(existingTemplates)

            let preparedTemplates = {}

           preparedTemplates['Title'] = this.templateTitle
           preparedTemplates['Content'] = this.templateContent

            existingTemplates.push(preparedTemplates)

            this.storage.set('Templates', JSON.stringify(existingTemplates))
              .then((result) => {
                console.log(result)
                  this.presentToastWithOptions()
                  this.templateContent = ''
                  this.templateTitle = ''
              })

          }
        })
  }
}
