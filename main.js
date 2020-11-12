import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import View from 'ol/View'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
import { fromLonLat } from 'ol/proj'
import json from './roads-seoul.json'
import * as jsts from './jsts'

const features = new GeoJSON()
  .readFeatures(json, { featureProjection: 'EPSG:3857' })
  .map(jsts.map(jsts.buffer(10)))

const vertexCount = features
  .map(feature => feature.getGeometry())
  .flatMap(polygon => polygon.getCoordinates())
  .map(ring => ring.length)
  .reduce((a, b) => a + b)

// polygon vertices without buffers: 1,430
// vertices (CAP_FLAT/JOIN_BEVEL): 1,966 (+37%)
// vertices (CAP_FLAT/JOIN_ROUND): 2,443 (+70%)
console.log('vertexCount', vertexCount)

new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({ source: new VectorSource({ features }) })
  ],
  target: document.getElementById('map'),
  view: new View({
    center: fromLonLat([126.979293, 37.528787]),
    zoom: 16
  })
})