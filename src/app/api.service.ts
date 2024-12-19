import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http!: HttpClient;
  constructor(httpClient: HttpClient) {
    this.http = httpClient;
  }

  post(url: string, data: any) {
    return this.http.post<any>(url, data);
  }
}
