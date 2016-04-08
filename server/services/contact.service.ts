//import {mysql} from 'mysql';
import {Contact} from '../../client/models/dto';
import {ObjectUtil} from '../../client/utils/object.util';
 let mysql = require('mysql');
 
export class ContactService {
 
  
  getConnection(): any {
		var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'BB2016',
		database : 'demo'
	});
  
    return connection;
  
  }

  createOne(data: Contact): Promise<Contact> {
    var con = this.getConnection();
    var contact: Contact = {};
    const now = Date.now();
    //contact.createdAt = now;
    //contact.updatedAt = now;
    ObjectUtil.merge(contact, data);
     
	con.connect();
	
	con.query('insert into contact set ?', contact, function(err, result) {
	});
	
	con.end();
	
	 return Promise.resolve(contact);
	
  }

  /*updateOne(data: Contact): Promise<Contact> {
    return this.findOneById(data._id).then((contact: Contact) => {
      ObjectUtil.merge(contact, data);
      return contact;
    });
  }*/

 /* removeOneById(id: string): Promise<Contact> {
    return this.findOneById(id).then((contact: Contact) => {
      const index = this._findIndex(id);
      contacts.splice(index, 1);
      return contact;
    });
  }*/

  /*find(): Promise<Contact[]> {
   
    var con = this.getConnection();
	
	con.connect();
	
	con.query('select * from contact', function(err, rows, fields) {
		console.log(rows);
	});
   
   //return Promise.resolve(contacts);
  }*/

  /*findOneById(id: string): Promise<Contact> {
    const index = this._findIndex(id);
    const contact = contacts[index];
    return Promise.resolve(contact);
  }*/

  /*private _findIndex(id: string): number {
    const n = contacts.length;
    for (let i = 0; i < n; i++) {
      const it = contacts[i];
      if (it._id === id) {
        return i;
      }
    }
    return -1;
  }*/

}


export const contactService = new ContactService();
