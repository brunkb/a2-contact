import {enableProdMode} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

import {HttpUtil} from './utils/http.util';
import {AppComponent} from './components/app/component';
import {ContactService} from './services/contact.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

if (window['IS_PROD'] === 'true') {
  enableProdMode();
}

bootstrap(AppComponent, [
  ROUTER_PROVIDERS,
  HTTP_PROVIDERS,
  HttpUtil,
  ContactService
]);
