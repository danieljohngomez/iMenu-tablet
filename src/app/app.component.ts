import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DataService } from './data-service';
import * as _ from 'lodash';

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

  public menu = [
    {
        name: 'Appetizer',
        categories:[
            {
                name: 'Appetizer Category 1'
            },
            {
                name: 'Appetizer Category 2'
            },
            {
                name: 'Appetizer Category 3'
            }
        ]
    },
    {
        name: 'Main Course',
        categories:[
            {
                name: 'Main Course Category 1'
            },
            {
                name: 'Main Course Category 2'
            },
            {
                name: 'Main Course Category 3'
            }
        ]
    },
    {
        name: 'Dessert',
        categories:[
            {
                name: 'Dessert Category 1'
            },
            {
                name: 'Dessert Category 2'
            },
            {
                name: 'Dessert Category 3'
            }
        ]
    },
    {
        name: 'Beverages',
        categories: [
            {
                name: 'Softdrinks',
                items: ["softdrinks1"]
            },
            {
                name: 'Coffee'
            },
            {
                name: 'Shakes',
                items: [
                    {
                        name: "Chocolate Shake",
                        price: 75,
                        image: "/food/beverages/chocolate-shake.png"
                    }
                ]
            },
            {
                name: 'Fruit Drinks'
            }
        ]
    }
  ];

  public selectedMenu = this.menu[0];
  public selectedMenuName = this.selectedMenu.name;
  public selectedCategory = this.selectedMenu.categories && this.selectedMenu.categories.length > 0 ? this.selectedMenu.categories[0] : null;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dataService: DataService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
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
