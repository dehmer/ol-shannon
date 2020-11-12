import * as jsts from 'jsts'
import Feature from 'ol/Feature'
import Geometry from 'ol/geom/Geometry'
import * as geom from 'ol/geom'
import * as R from 'ramda'

const K = v => fn => { fn(v); return v }

/**
 * CAP_ROUND: 1 (DEFAULT)
 * CAP_FLAT: 2
 * CAP_SQUARE: 3 (aka CAP_BUTT)
 * DEFAULT_MITRE_LIMIT: 5
 * DEFAULT_QUADRANT_SEGMENTS: 8
 * DEFAULT_SIMPLIFY_FACTOR: 0.01
 * JOIN_ROUND: 1
 * JOIN_MITRE: 2
 * JOIN_BEVEL: 3
 */
const BufferParameters = jsts.operation.buffer.BufferParameters
const BufferOp = jsts.operation.buffer.BufferOp

/**
 * Setup JST/OL parser to convert between JST and OL geometries.
 * REFERENCE: http://bjornharrtell.github.io/jsts/1.6.1/doc/module-org_locationtech_jts_io_OL3Parser.html
 */
const parser = K(new jsts.io.OL3Parser())(parser => parser.inject(
  geom.Point,
  geom.LineString,
  geom.LinearRing,
  geom.Polygon,
  geom.MultiPoint,
  geom.MultiLineString,
  geom.MultiPolygon
))

const ol_to_jst = ol_geometry => parser.read(ol_geometry)
const jst_to_ol = jst_geometry => parser.write(jst_geometry)

const mapGeometry = fn => R.compose(jst_to_ol, fn, ol_to_jst)

const mapFeature = fn => feature => {
  feature.setGeometry(mapGeometry(fn)(feature.getGeometry()))
  return feature
}

export const map = fn => v => {
  if (v instanceof Feature) return mapFeature(fn)(v)
  else if (v instanceof Geometry) return mapGeometry(fn)(v)
  return v
}

/**
 * NOTE: 3-ary form not supported, use either 0, 1, 2 or 4 arguments.
 * SEE: https://locationtech.github.io/jts/javadoc/org/locationtech/jts/operation/buffer/BufferParameters.html
 */
const defaultBufferParameters = new BufferParameters(
  BufferParameters.DEFAULT_QUADRANT_SEGMENTS,
  BufferParameters.CAP_FLAT,
  BufferParameters.JOIN_BEVEL,
  BufferParameters.DEFAULT_MITRE_LIMIT
)

/**
 * NOTE: jst/Geometry#buffer() only exposes partial BufferOp/BufferParameters API.
 */
export const buffer = distance => jst_geometry =>
  BufferOp.bufferOp(jst_geometry, distance, defaultBufferParameters)
