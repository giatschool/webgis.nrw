import FileSaver from 'file-saver';
import jsPDF from 'jsPDF/dist/jspdf.min.js';
import html2canvas from 'html2canvas';

export default class Printer {
  constructor(map) {
    this.map = map;
  }

  generatePNG() {
    this.map
      .getMap()
      .getCanvas()
      .toBlob(blob => {
        FileSaver.saveAs(blob, `${this.map.getTitle()}.png`);
      });

    html2canvas(this.map.getLegend()).then(canvas => {
      canvas.toBlob(blob => {
        FileSaver.saveAs(blob, `${this.map.getTitle()}_legend.png`);
      });
    });
  }

  generatePDF() {
    const offset = 15;
    const offset_top = 10;
    const pageWidth = 295;
    const pageHeight = 210;
    const imgHeight =
      this.map.getMap().getCanvas().height *
      (pageWidth - 2 * offset - offset_top) /
      this.map.getMap().getCanvas().width;
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: [pageWidth, pageHeight]
    });

    // map
    doc.addImage(
      this.map
        .getMap()
        .getCanvas()
        .toDataURL('image/png'),
      'PNG',
      offset,
      (pageHeight - imgHeight) / 2 + offset_top,
      pageWidth - 2 * offset,
      imgHeight
    );

    // attribution
    doc.setFontSize(8);
    doc.text('Karte: Mapbox | Daten: open.nrw', offset, pageHeight - 10);

    // heading
    if (this.map.getTitle()) {
      doc.setFontSize(30);
      doc.text(this.map.getTitle(), 15, 15);
      doc.setFontSize(18);
      doc.setFontStyle('italic');
      if (this.map.getYear()) doc.text(this.map.getYear().toString(), 15, 23);

      // legend
      html2canvas(this.map.getLegend()).then(canvas => {
        const legendScale = 2;
        doc.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          pageWidth - 35 * legendScale - offset,
          23,
          35 * legendScale,
          4 * legendScale
        );

        doc.save(`${this.map.getTitle()}.pdf`);
      });
    } else {
      doc.save(`untitled_map.pdf`); // if no data chosen
    }
  }
}
