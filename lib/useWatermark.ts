import { useCallback, useEffect, useState } from 'react'
import { useMemo } from 'react'

type WatermarkImageOption = {
  /**
   * Set the font size of the watermark.
   * @example 14
   * @default 14
   */
  fontSize: number
  /**
   * Set the angle of the watermark.
   * @default -45
   * @example -90
   */
  angle: number
  /**
   * Set the opacity of the watermark.
   * @default 0.05
   * @example 0.1
   */
  opacity: number

  /**
   * Set the font color of the watermark.
   * @example '#000000'
   * @default '#000000'
   */
  color: string
}

type WatermarkOption = {
  /**
   * Set the size of the watermark.
   * @example '180px 180px'
   * @default '180px 180px'
   */
  size: string
} & WatermarkImageOption

const defaultOption: WatermarkOption = {
  fontSize: 14,
  angle: -45,
  opacity: 0.05,
  size: '180px 180px',
  color: '#000000',
}

export default function useWatermark (text: string, option?: WatermarkOption) {
  const {
    fontSize,
    angle,
    opacity,
    size,
    color,
  } = { ...defaultOption, ...option }
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const watermarkImage = useMemo(
    () => createWatermarkImage(text, { fontSize, angle, opacity, color }),
    [text, fontSize, angle, opacity],
  )

  const ref = useCallback((node: Element | null | undefined) => {
    if (!node) return
    const containerEl = node as HTMLElement
    setContainer(containerEl)
    containerEl.style.backgroundRepeat = 'repeat'
    containerEl.style.pointerEvents = 'none'
    containerEl.style.zIndex = '9999'
  }, [])

  useEffect(() => {
    if (!container) return

    container.style.backgroundImage = `url(${watermarkImage})`
    container.style.backgroundSize = size
  }, [container, watermarkImage, size])

  return { ref, watermarkImage }
}

const createWatermarkImage = (text: string, options: WatermarkImageOption) => {
  const { fontSize, angle, opacity, color } = options

  // Consider the device's pixel ratio for resolution adjustment
  const devicePixelRatio = window.devicePixelRatio || 1

  // Calculate the width and height
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  ctx.font = `${fontSize * devicePixelRatio}px sans-serif`
  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width

  // Use the font size as the text height
  const textHeight = fontSize * devicePixelRatio

  // Calculate the canvas size that can fully accommodate the text when rotated
  const canvasSize = Math.ceil(Math.sqrt(textWidth ** 2 + textHeight ** 2))
  canvas.width = canvasSize
  canvas.height = canvasSize

  // Scaling for high resolution
  ctx.scale(devicePixelRatio, devicePixelRatio)

  // Set the canvas background to transparent (default is transparent)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Move to the center of
  ctx.translate(
    canvas.width / (2 * devicePixelRatio),
    canvas.height / (2 * devicePixelRatio),
  )

  // Rotate text
  ctx.rotate((angle * Math.PI) / 180)

  // Set text style
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = hexToRgba(color, opacity)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Draw text
  ctx.fillText(text, 0, 0)

  // Return data URL
  return canvas.toDataURL('image/png')
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
