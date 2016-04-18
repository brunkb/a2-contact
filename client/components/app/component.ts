import {Component, ViewEncapsulation} from 'angular2/core';
import {
  RouteConfig,
  ROUTER_DIRECTIVES
} from 'angular2/router';

import {HomeComponent} from '../home/component';
import {ContactComponent} from '../contact/component';
import {HttpUtil} from '../../utils/http.util';
import {Notification} from '../../models/dto';


@Component({
  selector: 'app',
  moduleId: __moduleName,
  templateUrl: 'template.html',
  styleUrls: ['style.css'],
  directives: [ROUTER_DIRECTIVES],
  encapsulation: ViewEncapsulation.None
})
@RouteConfig([
  { path: '/', component: HomeComponent, as: 'Home', useAsDefault: true },
  { path: '/contact', component: ContactComponent, as: 'Belts' }
])
export class AppComponent {

  loading: boolean;

  constructor(private httpUtil: HttpUtil) {

    let numReqStarted = 0;
    let numReqCompleted = numReqStarted;

    this.httpUtil.requestNotifier.subscribe((notification: Notification) => {

      if (notification.type === 'start') {
        ++numReqStarted;
      } else if (notification.type === 'complete') {
        ++numReqCompleted;
      }

      this.loading = numReqStarted > numReqCompleted;
    });
  }
}
