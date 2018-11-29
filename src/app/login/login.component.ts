import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public username: string;
  password: string;
  exists: number;
  constructor(private data: DataService, private router: Router) { }
  ngOnInit() {
  }
  login() {
    this.data.login(this.username, this.password).subscribe((data) => {
      this.exists = data[0].count;
      if (this.exists === 1) {
        localStorage.setItem('user', this.username);
        this.router.navigate(['/chats']);
      } else {
        alert('Wrong username or password.');
      }
    });
  }
  keyDown(event) {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}
/*export const GlobalVariable = Object.freeze({
  username = this.usernameč
});*/
