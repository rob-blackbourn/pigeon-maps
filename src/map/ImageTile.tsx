import React from 'react'

import { TileComponent } from '../types'

export const ImgTile: TileComponent = ({ tile, tileLoaded }) => (
  <img
    src={tile.url}
    srcSet={tile.srcSet}
    width={tile.width}
    height={tile.height}
    loading={'lazy'}
    onLoad={tileLoaded}
    alt={''}
    style={{
      position: 'absolute',
      left: tile.left,
      top: tile.top,
      willChange: 'transform',
      transformOrigin: 'top left',
      opacity: 1,
    }}
  />
)
