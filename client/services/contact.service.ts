import {Injectable} from 'angular2/core';

import {Contact} from '../models/dto';
import {HttpUtil} from '../utils/http.util';
import {BaseResourceService} from './base.service';


@Injectable()
export class ContactService extends BaseResourceService<Contact> {

  constructor(httpUtil: HttpUtil) {
    super(httpUtil, 'contact');
  }

}

