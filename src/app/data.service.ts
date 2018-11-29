import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {
  }
  getMessages(from, to, index) {
    return this.http.get('http://localhost:3001/messages/' + from + '/' + to + '/' + index);
  }
  getMessagesNo(from, to) {
    return this.http.get('http://localhost:3001/messagesno/' + from + '/' + to);
  }
  getUsers() {
    return this.http.get('http://localhost:3001/users');
  }
  getUsersExeptCurrent(user) {
    return this.http.get('http://localhost:3001/usersexceptcurrent/' + user);
  }
  getUser(id) {
    return this.http.get('http://localhost:3001/users/' + id);
  }
  login(username1, password1) {
    return this.http.post('http://localhost:3001/login', {username: username1, password: password1});
  }
  sendMessage(from_user1, to_user1, message1) {
    return this.http.post('http://localhost:3001/sendmessage', {from_user: from_user1, to_user: to_user1, message: message1});
  }
  addUser(username1, name1, password1) {
    return this.http.post('http://localhost:3001/adduser', {username: username1, name: name1, password: password1});
  }
  getUsersNo() {
    return this.http.get('http://localhost:3001/usersno');
  }
  setOnline(username, online) {
    return this.http.post('http://localhost:3001/online', {username: username, online: online});
  }
}
