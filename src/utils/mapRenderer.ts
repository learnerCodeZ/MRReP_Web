import * as THREE from 'three'

export function renderMapTexture(
  data: Int8Array,
  width: number,
  height: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imgData = ctx.createImageData(width, height)

  for (let i = 0; i < data.length; i++) {
    const val = data[i]
    let brightness: number
    if (val === -1) {
      brightness = 128
    } else {
      brightness = 255 - Math.round((val / 100) * 255)
    }
    imgData.data[i * 4] = brightness
    imgData.data[i * 4 + 1] = brightness
    imgData.data[i * 4 + 2] = brightness
    imgData.data[i * 4 + 3] = 255
  }

  ctx.putImageData(imgData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.flipY = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}
