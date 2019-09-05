import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, map, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  // withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _baseUrl = environment.baseUrl;
  private _startWatsonUrl = this._baseUrl+ "/api/startWatson/";
  private _messageWatsonUrl = this._baseUrl+ "/api/messageWatson/";
  private _messageCorpusUrl = this._baseUrl+ "/api/messageCorpus/";
  private _messageIndexerUrl = this._baseUrl+ "/api/messageIndexer/";
  watsonSessionId?: string;
  constructor(private http: HttpClient) { }

  startWatson(): Observable<any> {
    return this.http.post<any>(this._startWatsonUrl, httpOptions).pipe(
      tap((session) => {
        console.log(`sessionId=${session.session_id}`);
        this.watsonSessionId = session.session_id;
      }),
      catchError(this.handleError<String>('sendMessage'))
    );
  }

  sendWatsonMessage(message: String): Observable<any> {
    return this.http.post<any>(this._messageWatsonUrl, {sessionId: this.watsonSessionId, text: message}, httpOptions).pipe(
      tap((response) => {
        let contents = JSON.parse(response.body);
        console.log(contents);
        console.log(`message received=${contents.output.generic[0].text}`);
      }),
      catchError(this.handleError<String>('sendMessage'))
    );
  }

  sendCorpusMessage(message: String): Observable<any> {
    return this.http.post<any>(this._messageCorpusUrl, {text: message}, httpOptions).pipe(
      tap((response) => {
        // Response is a string in body
        let contents = response.body;
        console.log(response);
        console.log(`message received=${contents}`);
      }),
      catchError(this.handleError<String>('sendMessage'))
    );
  }

  sendIndexerMessage(message: String): Observable<any> {
    return this.http.post<any>(this._messageIndexerUrl, {text: message}, httpOptions).pipe(
      tap((response) => {
        // Response is a string in body
        let contents = response.body;
        console.log(response);
        console.log(`message received=${contents}`);
      }),
      catchError(this.handleError<String>('sendMessage'))
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
