import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';
import { SignFile } from '../model/signfile.model';
import { SignArea } from '../model/signArea.model';
@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss',
})
export class PdfViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('pdfViewer') pdfViewer!: NgxExtendedPdfViewerComponent;

  lstStage: Konva.Stage[] = [];
  base64Signfile = '';

  transform!: Konva.Transformer;
  curStage!: Konva.Stage;
  curPage = 1;
  curItem: any;
  menu: HTMLElement | null;
  constructor() {
    this.menu = null;
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

  evtLog(evt: any) {
    console.log('evt log', evt);
  }

  sendToSign() {
    let signFile = new SignFile();
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
            x: konvaImg.x(),
            y: konvaImg.y(),
            width: konvaImg.width() * konvaImg.scaleX(),
            height: konvaImg.height() * konvaImg.scaleY(),
            base64: img.src,
          };
          signFile.signAreas.push(area);
        }
      });
    });

    let blob = this.pdfViewer.service.getCurrentDocumentAsBlob();
    blob.then((blob) => {
      if (blob == null) return;
      let reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        signFile.base64 = reader.result as string;
        console.log(signFile);
      };
    });
  }
}
