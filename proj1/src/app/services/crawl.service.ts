import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { CrawlDetails, FileDetails } from './crawl.models';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  // withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class CrawlService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  crawlSite(details: CrawlDetails): any {
    const url = this.baseUrl + '/api/crawl/';
    return this.http.post<CrawlDetails>(url, details, httpOptions).pipe(
      tap(() => console.log(`Site successfuly added to crawl `)),
      catchError(this.handleError<CrawlDetails>('crawlSite'))
    );
  }

  updateCorpus(details: FileDetails): any {
    const url = this.baseUrl + '/api/updateCorpus/';
    return this.http.post<CrawlDetails>(url, details, httpOptions).pipe(
      tap(() => console.log(`Corpus successfuly update `)),
      catchError(this.handleError<CrawlDetails>('uploadCorpus'))
    );
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
private handleError<T> (operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: better job of transforming error for user consumption
    console.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}
}
