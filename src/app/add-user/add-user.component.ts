import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  username: string;
  name: string;
  password: string;
  exists: number;
  constructor(private data: DataService, private router: Router) { }

  ngOnInit() {
  }
  keyDown(event) {
    if (event.key === 'Enter') {
      this.addUser();
    }
  }
  addUser() {
    this.data.addUser(this.username, this.name, this.password).subscribe((data) => {
      console.log('User added.');
      this.login();
    });
  }
  login() {
    this.data.login(this.username, this.password).subscribe((data) => {
      this.exists = data[0].count;
      if (this.exists === 1) {
        localStorage.setItem('user', this.username);
        this.router.navigate(['/chats']);
      }
    });
  }
}
