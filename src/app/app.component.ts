import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { Signer } from './model/signer.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'DemoCMC';
  apiService!: ApiService;
  step = 4;
  df!: ChangeDetectorRef;
  signer!: Signer;
  fgSigner!: FormGroup;

  constructor(apiService: ApiService, df: ChangeDetectorRef) {
    this.apiService = apiService;
    this.df = df;
  }

  ngOnInit() {
    this.fgSigner = new FormGroup({
      id: new FormControl('', Validators.required),
    });
  }

  handleUpload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return reader;
  }

  onUploadCardID(event: any) {
    let reader = this.handleUpload(event);
    reader.onload = () => {
      this.step = 2;
      console.log('hinh cccd', reader.result);
    };
  }

  onFaceMatching(event: any) {
    let reader = this.handleUpload(event);
    reader.onload = () => {
      this.step = 4;
      console.log('hinh chan dung', reader.result);
      this.df.detectChanges();
    };
  }

  onRegisterClicK() {
    this.step = 1;
  }

  onLoginClick() {
    this.step = 3;
  }

  onFindCardID() {
    this.step = 4;
  }
}
