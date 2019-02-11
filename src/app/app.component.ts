import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DataService } from './data-service';
import * as _ from 'lodash';
import firebase from "../main"

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list'
    }
  ];

  public menu = [];

  public selectedMenu;
  public selectedMenuName;
  public selectedCategory = null;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dataService: DataService
  ) {
    this.initializeApp();
    var db = firebase.firestore();
    this.menu = [];
    db.collection("menu").get().then((menuSnapshot) => {
        menuSnapshot.forEach((menuItemSnapshot) => {
            var menuItem = menuItemSnapshot.data();
            menuItem.id = menuItemSnapshot.id;
            menuItem.categories = [];
            this.menu.push(menuItem);

            // Get categories
            db.collection(`menu/${menuItem.id}/categories`).get().then((categoriesSnapshot) => {
                categoriesSnapshot.forEach((categorySnapshot) => {
                    var categoryItem = categorySnapshot.data();
                    categoryItem.id = categorySnapshot.id;
                    menuItem.categories.push(categoryItem);
                });
            }).then(() => { this.preSelect(); })
        });
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  preSelect() {
    if(this.selectedMenu) return;
    this.selectedMenu = this.menu[0];
    this.selectedMenuName = this.selectedMenu.name;
    this.selectedCategory = this.selectedMenu.categories && this.selectedMenu.categories.length > 0 ? this.selectedMenu.categories[0] : null;
  }

  menuChanged(event) {
    this.selectedMenu = _.find(this.menu, {name: this.selectedMenuName});
    if (this.selectedMenu.categories && this.selectedMenu.categories.length > 0)
        this.selectedCategory = this.selectedMenu.categories[0];
    this.dataService.emitter.emit({menu: this.selectedMenu, category: this.selectedCategory})
  }

  categoryChanged(category) {
    this.selectedCategory = category;
    this.dataService.emitter.emit({menu: this.selectedMenu, category: this.selectedCategory})
  }

}
