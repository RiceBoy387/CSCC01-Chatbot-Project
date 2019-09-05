import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { User, RegisterDetails, LoginDetails } from './auth.models';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  // withCredentials: true
};

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private _baseUrl = environment.baseUrl;

  private _registerUrl = this._baseUrl+ "/signup/";
  private _loginUrl = this._baseUrl+ "/signin/";
  private _signoutUrl = this._baseUrl + "/signout/";

  private loggedInUser: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  getUser(): Observable<any> {
    return this.loggedInUser.asObservable();
  }

  constructor(private http: HttpClient) { }

  loginUser(userDetails: LoginDetails): Observable<User> {
    return this.http.post<User>(this._loginUrl, userDetails, httpOptions).pipe(
      tap((user) => {
        console.log(`user logged in username=${user.username}`);
        this.loggedInUser.next({ username: user.username, _id : user._id, isAdmin : user.isAdmin});
      }),
      catchError(this.handleError<User>('loginUser'))
    );
  }

  registerUser(userDetails: RegisterDetails): Observable<User> {
    return this.http.post<User>(this._registerUrl, userDetails, httpOptions).pipe(
      tap(() => console.log(`user registered username=${userDetails.username}`)),
      catchError(this.handleError<User>('registerUser'))
    );
  }

  logout(): Observable<Object> {
    return this.http.get(this._signoutUrl).pipe(
      tap(() => {
        console.log(`user logged out`);
        this.loggedInUser.next(null);
      }),
      catchError(this.handleError<Object>(`logout`))
    );
  }


  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
