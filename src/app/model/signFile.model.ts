import { SignArea } from './signArea.model';

export class SignFile {
  base64!: string;
  signAreas: SignArea[] = [];
}
