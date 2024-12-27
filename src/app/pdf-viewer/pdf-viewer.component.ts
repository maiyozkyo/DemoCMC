import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import Konva from 'konva';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';
import { SignArea } from '../model/signArea.model';
import { SignFile } from '../model/signFile.model';
import { Signer } from '../model/signer.model';
import { ApiService } from '../api.service';
@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss',
})
export class PdfViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('pdfViewer') pdfViewer!: NgxExtendedPdfViewerComponent;
  @Input() signer!: Signer;
  @Input() isLoading = false;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  private signMethod = 'sign?t=123456';
  private exPxToCm = 0.0264583333;
  lstStage: Konva.Stage[] = [];
  base64Signfile = '';
  isPdfLoaded = false;

  transform!: Konva.Transformer;
  curStage!: Konva.Stage;
  curPage = 1;
  curItem: any;
  menu: HTMLElement | null;
  apiService!: ApiService;

  constructor(apiService: ApiService) {
    this.menu = null;
    this.apiService = apiService;
  }
  ngOnInit(): void {
    this.transform = new Konva.Transformer();
  }
  ngAfterViewInit(): void {
    this.menu = document.getElementById('konva-menucontext');
    if (this.menu) this.menu.style.display = 'none';
  }

  onPdfPagesRendered(evt: any) {
    this.lstStage = this.lstStage.filter(
      (x) => x.id() != `page${evt.pageNumber}`
    );

    let stageDiv = document.createElement('div');
    let pageDiv = evt.source.div as HTMLElement;
    stageDiv.style.width = pageDiv.style.width;
    stageDiv.style.height = pageDiv.style.height;
    stageDiv.style.border = '1px blue';
    stageDiv.style.zIndex = '10';
    stageDiv.style.position = 'absolute';
    stageDiv.id = `stageDivPage${evt.source.id}`;
    pageDiv.insertBefore(stageDiv, pageDiv.firstChild);
    let stage = new Konva.Stage({
      container: stageDiv,
      width: pageDiv.clientWidth,
      height: pageDiv.clientHeight,
      id: `page${evt.pageNumber}`,
    });

    stage.on('mousedown touchstart', (e) => {
      if (this.curStage != stage) {
        this.transform.nodes([]);
        this.curStage = stage;
      }
      if (this.curItem != e.target) {
        this.curItem = e.target;
        this.transform.nodes([]);
      }

      if (e.target == stage) {
        this.transform.nodes([]);
        return;
      }

      if (this.transform.getNodes().length == 0) {
        let layers = stage.getLayers();
        layers[0].add(this.transform);
        this.transform.nodes([e.target]);
      }
    });

    stage.on('contextmenu', (e) => {
      e.evt.preventDefault();
      if (this.menu) {
        if (e.target instanceof Konva.Image) {
          // Position and display the custom menu
          this.menu.style.display = 'block';
          this.menu.style.position = 'absolute';
          this.menu.style.border = '1px solid #ccc';
          this.menu.style.top = `${e.evt.offsetY}px`;
          this.menu.style.left = `${e.evt.offsetX}px`;
          this.menu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
          this.menu.style.zIndex = '9999';
          stage
            .container()
            .insertBefore(this.menu, stage.container().firstChild);
        } else {
          this.menu.style.display = 'none'; // Hide menu if not right-clicking on an image
          stage.container().removeChild(this.menu);
        }
      }
    });

    let layer = new Konva.Layer();

    stage.add(layer);
    this.lstStage.push(stage);
  }

  onAddSignatureImage(evt: any) {
    let stage = this.lstStage.find((c) => c.id() == `page${this.curPage}`);
    if (!stage) return;
    let layers = stage.getLayers();
    console.log(stage._id);

    let reader = this.handleUpload(evt);
    reader.onload = () => {
      let img = new Image();
      img.src = reader.result as string;
      let x = stage.width() / 2;
      let y = stage.height() / 2;

      img.onload = () => {
        img.width = 200;
        img.height = 100;
        let konvaImg = new Konva.Image({
          x: x,
          y: y,
          scaleX: 1,
          scaleY: 1,
          image: img,
          width: 200,
          heigh: 100,
          draggable: true,
        });

        layers[0].add(konvaImg);
        layers[0].draw();
      };
    };
  }

  handleUpload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return reader;
  }

  onPdfLoaded(evt: any) {
    if (evt.pagesCount > 0) this.isPdfLoaded = true;
  }

  sendToSign(type: 'POSITION' | 'LOCALTION') {
    this.signer.TypeSign = type;
    let signFile = new SignFile();

    switch (type) {
      case 'LOCALTION': {
        // Image
        this.lstStage.forEach((stage) => {
          let layer = stage.getLayers()[0];
          layer.getChildren().forEach((node) => {
            if (node instanceof Konva.Image) {
              const konvaImg = node as Konva.Image;
              const item = node.image();
              let img = item as HTMLImageElement;
              let area: SignArea = {
                page: Number.parseInt(stage.id().replace('page', '')),
                x: konvaImg.position().x,
                y: konvaImg.position().y,
                width: konvaImg.width() * konvaImg.scaleX(),
                height: konvaImg.height() * konvaImg.scaleY(),
                base64: img.src,
              };
              this.signer.ImageSignBase64 = this.getPlaintextFromBase64(
                area.base64
              );
              this.signer.PositionX = `${
                (area.x - area.width / 2) * this.exPxToCm
              }`;
              // let stageHeigh = stage.height();
              // this.signer.PositionY = `${
              //   (stageHeigh - area.y - area.height) * this.exPxToCm
              // }`;

              this.signer.PositionX = '14';
              this.signer.PositionY = '2';
              this.signer.WithImg = `${area.width * this.exPxToCm}`;
              this.signer.HeightImg = `${area.height * this.exPxToCm}`;
            }
          });
        });
        break;
      }
      case 'POSITION': {
        console.log('sign POSITION', this.signer);
        break;
      }
    }
    this.isLoading = true;
    this.isLoadingChange.emit(this.isLoading);
    let blob = this.pdfViewer.service.getCurrentDocumentAsBlob();
    blob.then((blob) => {
      if (blob == null) return;
      let reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        this.signer.FileBase64 = this.getPlaintextFromBase64(reader.result);
        this.signer.Sw = 'HRM';
        this.apiService.post(this.signMethod, this.signer).subscribe((res) => {
          this.base64Signfile = res.FileBase64;
          console.log('sign', res);
          this.isLoading = false;
          this.isLoadingChange.emit(this.isLoading);
        });
      };
    });
  }

  getPlaintextFromBase64(base64: any) {
    return base64.split(',')[1];
  }
}
