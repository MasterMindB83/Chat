import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../data.service';
import * as io from 'socket.io-client';
import { IUser } from '../interfaces';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  messages: Object;
  user: string;
  users: IUser[];
  to_user: string;
  text: string;
  messagesNo: number;
  oldMessagesNo: number;
  index: number;
  newMessage: boolean;
  typing: boolean;
  public socket: SocketIOClient.Socket;
  constructor(private data: DataService) {
    this.socket =  io.connect('http://localhost:3001');
   }

  ngOnInit() {
    this.typing = false;
    this.user = localStorage.getItem('user');
    this.data.getUsersExeptCurrent(this.user).subscribe((data: IUser[]) => this.users = data);
    this.socket.on('new-message', (data) => {
      const from = data.from;
      const to = data.to;
      if ((this.user === from && this.to_user === to) || (this.user === to && this.to_user === from)) {
        this.refreshDataFull();
      }
      if ( this.user === to && this.to_user !== from) {
        const index = this.findUserToIndex(from);
        this.users[index].newMessage = true;
        this.newMessage = true;
      }
    });
    this.socket.emit('join', {user: this.user});

    // typing
    this.socket.on('typing', (data) => {
      if (data.from === this.to_user) {
        this.typing = true;
      }
    });

    // typing end
    this.socket.on('typing end', (data) => {
      if (data.from === this.to_user) {
        this.typing = false;
      }
    });
    // seen
    this.socket.on('seen', (data) => {
      if (data.from === this.to_user) {
        this.refreshData();
      }
    });

    // login
    this.data.setOnline(this.user, 1).subscribe(() => {
      console.log('User login.');
      this.socket.emit('online', {username: this.user});
    });

    // refresh users
    this.socket.on('online', () => {
      this.refreshUsers();
    });
  }
  findUserToIndex(user) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].username === user) {
        return i;
      }
    }
    return -1;
  }
  refreshUsers() {
    this.data.getUsersExeptCurrent(this.user).subscribe((data: IUser[]) => this.users = data);
  }
  userToSelected() {
    if (this.to_user === '') {
      this.messages = null;
    }
    this.getMessagesNo();
    this.refreshDataFull();
    const index = this.findUserToIndex(this.to_user);
    this.users[index].newMessage = false;
    let hasNewMessages = false;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].newMessage === true) {
        hasNewMessages = true;
        break;
      }
    }
    if (!hasNewMessages) {
      this.newMessage = false;
    }
    this.socket.emit('typing end', {from: this.user, to: this.to_user});
    this.typing = false;
  }
  refreshData() {
    this.data.getMessages(this.user, this.to_user, this.index).subscribe((data) => this.messages = data);
  }
  refreshDataFull() {
    this.data.getMessagesNo(this.user, this.to_user).subscribe((data) => {
      this.messagesNo = data[0].messagesno;
      this.index = this.messagesNo;
      this.data.getMessages(this.user, this.to_user, this.index).subscribe((data2) => this.messages = data2);
      this.socket.emit('seen', {from: this.user, to: this.to_user});
    });
  }
  sendMessage() {
    this.data.sendMessage(this.user, this.to_user, this.text).subscribe((data) => {
      console.log('Message sent.');
      this.text = '';
      this.refreshDataFull();
      this.socket.emit('typing end', {from: this.user, to: this.to_user});
    });
  }
    getMessagesNo() {
      this.data.getMessagesNo(this.user, this.to_user).subscribe((data) => {
        this.messagesNo = data[0].messagesno;
        this.index = this.messagesNo;
      });
    }
    keyDown(event) {
      if (event.key === 'Enter') {
        this.sendMessage();
        this.socket.emit('typing end', {from: this.user, to: this.to_user});
      } else {
        if (event.key === 'Backspace' && this.text.length === 1) {
          this.socket.emit('typing end', {from: this.user, to: this.to_user});
        } else if (event.key === 'Backspace') {
          this.socket.emit('typing end', {from: this.user, to: this.to_user});
        } else {
          this.socket.emit('typing', {from: this.user, to: this.to_user});
        }
      }
    }
    increase() {
      if (this.index < this.messagesNo) {
        this.index++;
        this.refreshData();
      }
    }
    decrese() {
      if (this.index > 7) {
        this.index--;
        this.refreshData();
      }
    }
    logout() {
      alert('test');
      this.data.setOnline(this.user, 0).subscribe(() => {
        console.log('User logout.');
        this.socket.emit('online', {username: this.user});
      });
    }
    ngOnDestroy(): void {
      this.data.setOnline(this.user, 0).subscribe(() => {
        console.log('User logout.');
        this.socket.emit('online', {username: this.user});
      });
    }
}
