import FileSaver from 'file-saver';
import jsPDF from 'jsPDF';

export default class Printer {
  constructor(map) {
    this.map = map;
  }

  generatePNG() {
    this.map
      .getMap()
      .getCanvas()
      .toBlob(blob => {
        FileSaver.saveAs(blob, 'mappy.png');
      });
  }

  generatePDF() {
    const offset = 25;
    const pageWidth = 295;
    const pageHeight = 210;
    const imgHeight =
      this.map.getMap().getCanvas().height *
      (pageWidth - 2 * offset) /
      this.map.getMap().getCanvas().width;
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: [pageWidth, pageHeight]
    });

    doc.addImage(
      this.map
        .getMap()
        .getCanvas()
        .toDataURL('image/png'),
      'PNG',
      offset,
      (pageHeight - imgHeight) / 2,
      pageWidth - 2 * offset,
      imgHeight
    );

    doc.save(`map.pdf`);
  }
}
