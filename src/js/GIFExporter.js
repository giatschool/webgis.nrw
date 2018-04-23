import html2canvas from 'html2canvas';
import mergeImages from 'merge-images';
import GIF from 'gif.js';
import FileSaver from 'file-saver';
import ProgressBar from 'progressbar.js';

/**
 * @description GIFExporter can create GIFs based on the map and legend
 */
export default class GIFExporter {
  /**
   *
   * @param {Map} map this is the map object the image should be taken from
   * @description creates a new GIF object that can be filled with images
   */
  constructor(map) {
    this.map = map;
    this.gif = new GIF({
      workers: 2,
      quality: 10
    });
  }

  /**
   * @description adds the current visible map and legend imagery to the GIF frames
   */
  addFrame() {
    const mapImage = this.map
      .getMap()
      .getCanvas()
      .toDataURL();

    // adding legend
    html2canvas($('.legend-info-wrapper')[0], { logging: false }).then(
      canvas => {
        const legendImage = canvas.toDataURL();

        mergeImages([
          {
            src: mapImage,
            x: 0,
            y: 0
          },
          {
            src: legendImage,
            x: this.map.getMap().getCanvas().width - canvas.width,
            y: 0
          }
        ]).then(b64 => {
          const combinedImage = new Image();
          combinedImage.src = b64;

          combinedImage.onload = () => {
            this.gif.addFrame(combinedImage, {
              copy: true
            });
          };
        });
      }
    );
  }

  /**
   * @description renderes the GIF frame stack and loads the gif on the client
   * @param {function} callback called when download complete
   */
  downloadGIF(callback) {
    $('#download_gif').hide();
    $('#download_gif_spinner').show();
    const bar = new ProgressBar.Circle('#download_gif_spinner', {
      strokeWidth: 10,
      easing: 'easeInOut',
      duration: 500,
      color: '#1A5FAC',
      trailColor: '#ababab',
      trailWidth: 4,
      svgStyle: null
    });
    this.gif.on('finished', blob => {
      FileSaver.saveAs(blob, `${this.map.getTitle()}.gif`);
      $('#download_gif_spinner').hide();
      callback();
    });
    this.gif.on('progress', pst => {
      bar.animate(pst);
    });
    this.gif.render();
  }
}
