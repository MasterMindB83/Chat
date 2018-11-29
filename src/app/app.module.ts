import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { UsersComponent } from './users/users.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import {HttpClientModule} from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import {FormsModule} from '@angular/forms';
import { AddUserComponent } from './add-user/add-user.component';
@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    UsersComponent,
    SidebarComponent,
    LoginComponent,
    AddUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
