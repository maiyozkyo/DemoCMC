import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'DemoCMC';
  apiService!: ApiService;
  step = 1;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  handleUpload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
    };
  }

  onRegisterClicK() {
    this.step = 2;
  }

  onLoginClick() {
    this.step = 3;
  }
}
