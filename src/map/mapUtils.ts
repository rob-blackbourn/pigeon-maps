import { parentPosition } from '../utils'
import { Point, MinMaxBounds } from '../types'
export const NOOP = () => true

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
export const lng2tile = (lon: number, zoom: number): number => ((lon + 180) / 360) * Math.pow(2, zoom)
export const lat2tile = (lat: number, zoom: number): number =>
  ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
  Math.pow(2, zoom)

export function tile2lng(x: number, z: number): number {
  return (x / Math.pow(2, z)) * 360 - 180
}

export function tile2lat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

export function getMousePixel(dom: HTMLElement, event: Pick<MouseEvent, 'clientX' | 'clientY'>): Point {
  const parent = parentPosition(dom)
  return [event.clientX - parent.x, event.clientY - parent.y]
}

export function easeOutQuad(t: number): number {
  return t * (2 - t)
}

export function srcSet(
  dprs: number[],
  url: (x: number, y: number, z: number, dpr?: number) => string,
  x: number,
  y: number,
  z: number
): string {
  if (!dprs || dprs.length === 0) {
    return ''
  }
  return dprs.map((dpr) => url(x, y, z, dpr) + (dpr === 1 ? '' : ` ${dpr}x`)).join(', ')
}

const hasWindow = typeof window !== 'undefined'

export const performanceNow =
  hasWindow && window.performance && window.performance.now
    ? () => window.performance.now()
    : (() => {
        const timeStart = new Date().getTime()
        return () => new Date().getTime() - timeStart
      })()

export const requestAnimationFrame = (callback: (timestamp: number) => void): number | null => {
  if (hasWindow) {
    return (window.requestAnimationFrame || window.setTimeout)(callback)
  } else {
    callback(new Date().getTime())
    return null
  }
}

export const cancelAnimationFrame = (animFrame: number | null) =>
  hasWindow && animFrame ? (window.cancelAnimationFrame || window.clearTimeout)(animFrame) : false

// minLat, maxLat, minLng, maxLng
export const absoluteMinMax = [
  tile2lat(Math.pow(2, 10), 10),
  tile2lat(0, 10),
  tile2lng(0, 10),
  tile2lng(Math.pow(2, 10), 10),
] as MinMaxBounds

export const pixelToLatLng = (
  pixel: Point,
  center: Point,
  zoom: number,
  width: number,
  height: number,
  pixelDelta: Point | null
): Point => {
  const pointDiff = [
    (pixel[0] - width / 2 - (pixelDelta ? pixelDelta[0] : 0)) / 256.0,
    (pixel[1] - height / 2 - (pixelDelta ? pixelDelta[1] : 0)) / 256.0,
  ]

  const tileX = lng2tile(center[1], zoom) + pointDiff[0]
  const tileY = lat2tile(center[0], zoom) + pointDiff[1]

  return [
    Math.max(absoluteMinMax[0], Math.min(absoluteMinMax[1], tile2lat(tileY, zoom))),
    Math.max(absoluteMinMax[2], Math.min(absoluteMinMax[3], tile2lng(tileX, zoom))),
  ] as Point
}

export const latLngToPixel = (
  latLng: Point,
  center: Point,
  zoom: number,
  width: number,
  height: number,
  pixelDelta: Point | null
): Point => {
  const tileCenterX = lng2tile(center[1], zoom)
  const tileCenterY = lat2tile(center[0], zoom)

  const tileX = lng2tile(latLng[1], zoom)
  const tileY = lat2tile(latLng[0], zoom)

  return [
    (tileX - tileCenterX) * 256.0 + width / 2 + (pixelDelta ? pixelDelta[0] : 0),
    (tileY - tileCenterY) * 256.0 + height / 2 + (pixelDelta ? pixelDelta[1] : 0),
  ] as Point
}

export const distanceInScreens = (
  centerTarget: Point,
  zoomTarget: number,
  center: Point,
  zoom: number,
  width: number,
  height: number,
  pixelDelta: Point | null
): number => {
  // distance in pixels at the current zoom level
  const l1 = latLngToPixel(center, center, zoom, width, height, pixelDelta)
  const l2 = latLngToPixel(centerTarget, center, zoom, width, height, pixelDelta)

  // distance in pixels at the target zoom level (could be the same)
  const z1 = latLngToPixel(center, center, zoomTarget, width, height, pixelDelta)
  const z2 = latLngToPixel(centerTarget, center, zoomTarget, width, height, pixelDelta)

  // take the average between the two and divide by width or height to get the distance multiplier in screens
  const w = (Math.abs(l1[0] - l2[0]) + Math.abs(z1[0] - z2[0])) / 2 / width
  const h = (Math.abs(l1[1] - l2[1]) + Math.abs(z1[1] - z2[1])) / 2 / height

  // return the distance
  return Math.sqrt(w * w + h * h)
}
