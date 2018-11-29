import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { AddUserComponent } from './add-user/add-user.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
{
  path: 'chats',
  component: ChatComponent
},
{
  path: 'users',
  component: UsersComponent
},
{
  path: 'adduser',
  component: AddUserComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
