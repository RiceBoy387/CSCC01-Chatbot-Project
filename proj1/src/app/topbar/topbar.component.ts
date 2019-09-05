import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.less']
})
export class TopbarComponent implements OnInit {

  hide = true;
  show = false;

  username?: string;
  id?: string;
  isAdmin?: boolean;
  userAvatar?: string;
  userSubscription: Subscription;

  constructor(
    private Auth: AuthService,
    private router: Router
  ) { }

  logout(event) {
    event.preventDefault();
    this.Auth.logout()
    .subscribe(() => {
      this.router.navigateByUrl('/home');
    });
  }

  ngOnInit() {
    this.userSubscription = this.Auth.getUser().subscribe(user => {
      if (user) {
        this.username = user.username;
        this.id = user._id;
        this.isAdmin = user.isAdmin;
      }
    });
  }

  toggleSideMenu() {
    this.hide = !this.hide;
    this.show = !this.show;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.userSubscription.unsubscribe();
  }

}
