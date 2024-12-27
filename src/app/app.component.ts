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
  step = 0;
  df!: ChangeDetectorRef;
  signer: Signer = new Signer();
  fgSigner!: FormGroup;
  isLoading = false;
  //#region
  registerMethod = 'register?t=123456';
  faceMathcingMethod = 'verify_face_matching?t=123456';
  registerConfirmMethod = 'register_confirm?t=123456';
  getUserInfoMethod = 'get_user_info?t=123456';
  signMethod = 'sign?t=123456';
  //#endregion

  constructor(apiService: ApiService, df: ChangeDetectorRef) {
    this.apiService = apiService;
    this.df = df;
  }

  ngOnInit() {
    this.fgSigner = new FormGroup({
      ID: new FormControl(),
      IdentificationNumber: new FormControl('', Validators.required),
      ImageBase64: new FormControl('', Validators.required),
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
      this.signer.ImageBase64 = this.getPlaintextFromBase64(reader.result);
      console.log('onUploadCardID signer', this.signer);
    };
  }

  sendToRegis() {
    this.isLoading = true;

    this.signer.IdentificationNumber =
      this.fgSigner.controls['IdentificationNumber'].value;
    this.apiService.post(this.registerMethod, this.signer).subscribe((res) => {
      console.log('onUploadCardID res', res);
      this.step = 2;
      this.isLoading = false;
    });
  }

  onFaceMatching(event: any) {
    let reader = this.handleUpload(event);
    reader.onload = () => {
      this.signer.ImageFaceBase64 = this.getPlaintextFromBase64(reader.result);
      this.isLoading = true;
      console.log('onFaceMatching signer', this.signer);
      this.apiService
        .post(this.faceMathcingMethod, this.signer)
        .subscribe((res) => {
          console.log('onFaceMatching res', res);
          this.step = 3;
          this.isLoading = false;
        });
    };
  }

  onRegisterConfirm(event: any) {
    this.isLoading = true;
    let reader = this.handleUpload(event);
    reader.onload = () => {
      this.signer.ImageSignBase64 = this.getPlaintextFromBase64(reader.result);
      this.apiService
        .post(this.registerConfirmMethod, this.signer)
        .subscribe((res) => {
          console.log('onRegisterConfirm res', res);
          this.getUserInfo();
        });
    };
  }

  getUserInfo() {
    this.isLoading = true;
    this.apiService
      .post(this.getUserInfoMethod, this.signer)
      .subscribe((res) => {
        let jsonData = res.JsonUserData.split('-');
        this.signer.Username = jsonData[1].split(' ')[2];
        this.signer.Password = jsonData[2].split(' ')[2];
        console.log('getsigner info', this.signer);
        this.step = 5;
        this.isLoading = false;
      });
  }

  getPlaintextFromBase64(base64: any) {
    return base64.split(',')[1];
  }

  onRegisterClicK() {
    this.step = 1;
  }

  onLoginClick() {
    this.step = 4;
  }

  onFindCardID() {
    this.signer.IdentificationNumber =
      this.fgSigner.controls['IdentificationNumber'].value;
    this.getUserInfo();
  }

  back() {
    if (this.step > 3) this.step = 0;
    else this.step--;
  }
}
