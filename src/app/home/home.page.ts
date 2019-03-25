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
    public takeOut = false;
    public customerName = '';

    constructor(private dataService:DataService,
                private toastController: ToastController) {
        var db = firebase.firestore();
        var storage = firebase.storage();
        this.dataService.emitter.subscribe(res => {
            if (res.menu.id == null)
                return;
            this.selectedMenu = res.menu;
            this.selectedCategory = res.category;
            var path = `menu/${this.selectedMenu.id}/categories/${this.selectedCategory.id}/items`;
            db.collection(path).get().then((itemsSnapshot) => {
                this.selectedCategory.items = _.map(itemsSnapshot.docs, (itemSnapshot) => itemSnapshot.data());
                this.selectedCategory.items.forEach((item) => {
                    // if(item.image) {
                        // storage.ref(item.image).getDownloadURL().then((url) => {
                            // item.image = url;
                            item.show = true;
                        //})
                   // }
                })
            });
        })

        //var db = firebase.firestore();
        //db.collection("tables").where("name", "==", "17").get().then((querySnapshot) => {
        //    db.collection("tables").doc(querySnapshot.docs[0].id).onSnapshot(function(doc) {
        //         var data = doc.data();
        //         this.customerName = data["customer"];
        //         console.log(this.customerName);
        //         this.takeOut = data["takeOut"];
        //     });
        //});
    }

    imageLoaded(item) {
        item.show = true;
    }

    addOrder(item) {
        var existingItemIndex = _.findIndex(this.order, { name: item.name });
        if (existingItemIndex >= 0) {
            this.incrementQuantity(existingItemIndex)
        } else {
            if ( item.maxOrder == 0 )
                this.showToast("Quantity is greater than the allowed maximum order")
            else {
                var order = {name: item.name, quantity: 1, price: item.price}
                            this.order.push(order);
                            this.updateTotal();
            }
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
        var orderItem = this.order[itemIndex];
        var realItemIndex = _.findIndex(this.selectedCategory.items, { name: orderItem.name });
        var item = this.selectedCategory.items[realItemIndex];
        var currentQuantity = orderItem.quantity;
        if (item.maxOrder >= 0 && currentQuantity >= item.maxOrder)
            this.showToast("Quantity is greater than the allowed maximum order");
        else {
            orderItem.quantity = currentQuantity + 1;
            this.updateTotal();
        }
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
        this.assistanceEnabled = false;
        var db = firebase.firestore();
        try {
            await db.collection("notifications").add({
                read: false,
                table: "17",
                type: "assistance"
            })
            const toast = await this.toastController.create({
              message: 'Assistance has been requested',
              duration: 2000,
              animated: true,
            });
            toast.onDidDismiss().then(() => this.assistanceEnabled = true);
            toast.present();
        } catch(error) {
            const toast = await this.toastController.create({
              message: 'Failed to send assistance request, please try again',
              duration: 2000,
              animated: true,
            });
            toast.onDidDismiss().then(() => this.assistanceEnabled = true);
            toast.present();
        }
    }

    setAssistanceEnabled(value) {
        this.assistanceEnabled = value
    }

    async sendOrder() {
        var db = firebase.firestore();
        try {
            var querySnapshot = await db.collection("tables").where("name", "==", "17").get();
            await db.collection("tables").doc(querySnapshot.docs[0].id).update({
                "orders": this.order,
                "takeOut": this.takeOut,
                "customer": this.customerName
            });
            await db.collection("notifications").add({
                read: false,
                table: "17",
                type: "order"
            })
            const toast = await this.toastController.create({
              message: 'Order has been sent',
              duration: 2000,
              animated: true,
            });
            toast.present();
        } catch(error) {
            const toast = await this.toastController.create({
              message: 'Failed to send order, please try again',
              duration: 2000,
              animated: true,
            });
            toast.present();
        }
    }

    async billOut() {
        var db = firebase.firestore();
        try {
            await db.collection("notifications").add({
                read: false,
                table: "17",
                type: "bill_out"
            })
            const toast = await this.toastController.create({
              message: 'Bill out request has been sent',
              duration: 2000,
              animated: true,
            });
            toast.present();
        } catch(error) {
            const toast = await this.toastController.create({
              message: 'Failed to send bill out request, please try again',
              duration: 2000,
              animated: true,
            });
            toast.present();
        }
    }

    async showToast(message) {
        const toast = await this.toastController.create({
          message: message,
          duration: 2000,
          animated: true,
        });
        toast.present();
    }
}
