import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

var config = {
  apiKey: "AIzaSyA9kWuHK6NOdqwYtthdXG2yHu1PoZI21cQ",
  authDomain: "imenu-59599.firebaseapp.com",
  projectId: "imenu-59599",
  storageBucket: "gs://imenu-59599.appspot.com/"
};
firebase.initializeApp(config);
var db = firebase.firestore();
export default firebase;

console.log("initialized")

