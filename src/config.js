module.exports = {
  mapboxToken:
    'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiJjajNicW1lM2QwMDR3MzNwOWdyaXAzN282In0.Pci5KvNNLCjjxy9b4p0n7g',
  wmsLayerUrls: {
    top: [
      'http://sgx.geodatenzentrum.de/wms_topplus_web_open?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=web_grau&styles=default&format=image/png'
    ],
    dop: [
      'https://www.wms.nrw.de/geobasis/wms_nw_dop20?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=nw_dop20&styles=default&format=image/png'
    ],
    dop_overlay: [
      'https://www.wms.nrw.de/geobasis/wms_nw_dop_overlay?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=WMS_NW_DOP_OVERLAY&styles=default&format=image/png'
    ],
    dtk: [
      'https://www.wms.nrw.de/geobasis/wms_nw_dtk?bbox={bbox-epsg-3857}&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=nw_dtk_col,nw_dtk_pan&styles=default&format=image/png'
    ]
  }
};
