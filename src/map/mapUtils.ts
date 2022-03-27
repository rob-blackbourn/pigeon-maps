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
