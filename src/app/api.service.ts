import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http!: HttpClient;
  private url = environment.smartlogUrl;
  constructor(httpClient: HttpClient) {
    this.http = httpClient;
  }

  post(method: string, data: any) {
    return this.http.post<any>(this.url + method, data);
  }
}
