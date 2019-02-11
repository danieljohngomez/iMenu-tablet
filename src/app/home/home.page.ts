import { Component } from '@angular/core';
import { DataService } from '../data-service';
import * as _ from 'lodash';
import { ToastController } from '@ionic/angular';
import firebase from "../../main"

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

    public selectedMenu;
    public selectedCategory;
    public order = [];
    public total = 0;
    public searchText = '';
    public assistanceEnabled = true;

    constructor(private dataService:DataService,
                private toastController: ToastController) {
        var db = firebase.firestore();
        var storage = firebase.storage();
        this.dataService.emitter.subscribe(res => {
            console.log(`[home-page] Event received`);
            console.log(res);
            if (res.menu.id == null)
                return;
            this.selectedMenu = res.menu;
            this.selectedCategory = res.category;
            var path = `menu/${this.selectedMenu.id}/categories/${this.selectedCategory.id}/items`;
            db.collection(path).get().then((itemsSnapshot) => {
                this.selectedCategory.items = _.map(itemsSnapshot.docs, (itemSnapshot) => itemSnapshot.data());
                this.selectedCategory.items.forEach((item) => {
                    if(item.image) {
                        storage.ref(item.image).getDownloadURL().then((url) => {
                            console.log(url);
                            item.image = url;
                        })
                    }
                })
            });
        })
    }

    addOrder(item) {
        var existingItemIndex = _.findIndex(this.order, { name: item.name });
        if (existingItemIndex >= 0) {
            this.incrementQuantity(existingItemIndex)
        } else {
            var order = {name: item.name, quantity: 1, price: item.price}
            this.order.push(order);
            this.updateTotal();
        }
    }

    updateTotal() {
        var total = 0;
        _.forEach(this.order, function(value) {
            if(value.price && value.quantity)
                total += (value.price * value.quantity);
        });
        if (total < 0)
            total = 0;
        this.total = total;
    }

    incrementQuantity(itemIndex) {
        var currentQuantity = this.order[itemIndex].quantity;
        this.order[itemIndex].quantity = currentQuantity + 1;
        this.updateTotal();
    }

    decrementQuantity(itemIndex) {
        var currentQuantity = this.order[itemIndex].quantity;
        if (currentQuantity <= 0 )
            this.order.splice(itemIndex, 1);
        else {
            this.order[itemIndex].quantity = currentQuantity - 1;
        }
        this.updateTotal();
    }

    async needAssistance() {
        const toast = await this.toastController.create({
          message: 'Assistance has been requested',
          duration: 2000,
          animated: true,
        });
        toast.onDidDismiss().then(() => this.assistanceEnabled = true);
        toast.present();
        this.assistanceEnabled = false;
    }

    setAssistanceEnabled(value) {
        this.assistanceEnabled = value
    }

}
