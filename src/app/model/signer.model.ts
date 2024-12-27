export class Signer {
  ID: string = '';
  AuthID: string = '';
  Domain: string = '';
  Service: string = '';
  SessionID: string = '';
  IdentificationNumber: string = '';
  ImageBase64: string = '';
  ImageFaceBase64: string = '';
  ImageSignBase64 = '';
  Email = '';
  PhoneNumber = '';
  FullName = '';
  Username = '';
  Password = '';
  FileBase64 = '';
  Type: 'PDF' | 'XML' | 'Office' = 'PDF';
  TypeSign: 'POSITION' | 'LOCALTION' = 'LOCALTION';
  LocationKey = '';
  PositionX = '';
  PositionY = '';
  WithImg = '1';
  HeightImg = '1';
  PageIndex = '1';
  Bottompos = '-1';
  Typefollow: '0' | '1' | '2' | '5' | '6' = '0';
  Sw = '';
  Endfollow = '';
  FollowCode = '';
  LinkCallback = '';
  Typeobj: 'DT' | 'CKS' = 'CKS';
  TempmailCode = '';
  Invisible: '' | '0' | '1' | '2' | '3' = '3';
  InvisibleTitle: '' | 'Full' | 'TTNK' | 'NULL' = '';
  Tentailieu = '';
}
