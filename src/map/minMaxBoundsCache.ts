import { Point, MinMaxBounds } from '../types'
import { tile2lat, tile2lng } from './mapUtils'

// minLat, maxLat, minLng, maxLng
export const absoluteMinMax = [
  tile2lat(Math.pow(2, 10), 10),
  tile2lat(0, 10),
  tile2lng(0, 10),
  tile2lng(Math.pow(2, 10), 10),
] as MinMaxBounds

export class MinMaxBoundCache {
  _minMaxCache: [number, number, number, MinMaxBounds] | null = null

  getBoundsMinMax = (zoom: number, width: number, height: number, isLimitBoundsCenter: boolean): MinMaxBounds => {
    if (isLimitBoundsCenter) {
      return absoluteMinMax
    }

    if (
      this._minMaxCache &&
      this._minMaxCache[0] === zoom &&
      this._minMaxCache[1] === width &&
      this._minMaxCache[2] === height
    ) {
      return this._minMaxCache[3]
    }

    const pixelsAtZoom = Math.pow(2, zoom) * 256

    const minLng = width > pixelsAtZoom ? 0 : tile2lng(width / 512, zoom) // x
    const minLat = height > pixelsAtZoom ? 0 : tile2lat(Math.pow(2, zoom) - height / 512, zoom) // y

    const maxLng = width > pixelsAtZoom ? 0 : tile2lng(Math.pow(2, zoom) - width / 512, zoom) // x
    const maxLat = height > pixelsAtZoom ? 0 : tile2lat(height / 512, zoom) // y

    const minMax = [minLat, maxLat, minLng, maxLng] as MinMaxBounds

    this._minMaxCache = [zoom, width, height, minMax]

    return minMax
  }

  limitCenterAtZoom = (
    center: Point,
    zoom: number,
    width: number,
    height: number,
    isLimitBoundsCenter: boolean
  ): Point => {
    // [minLat, maxLat, minLng, maxLng]
    const minMax = this.getBoundsMinMax(zoom, width, height, isLimitBoundsCenter)

    return [
      Math.max(Math.min(center[0], minMax[1]), minMax[0]),
      Math.max(Math.min(center[1], minMax[3]), minMax[2]),
    ] as Point
  }
}
