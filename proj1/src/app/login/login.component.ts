import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})

// Courtersy of https://jasonwatmore.com/post/2018/10/29/angular-7-user-registration-and-login-example-tutorial
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  userSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    //if (this.authService.getUser()) {
    //  this.router.navigate(['/']);
    //}
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.userSubscription = this.authService.getUser().subscribe(user => {
      // If there is already a logged in user then this page shouldn't be able to be accessed
      if (user) {
        this.router.navigate([this.returnUrl])
      }
    });

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.loginUser({username : this.f.username.value, password: this.f.password.value})
    .pipe(first())
    .subscribe(() => {
        this.router.navigate([this.returnUrl]);
      },
      error => {
        this.loading = false;
      });
    }

  }
