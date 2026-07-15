import QRCode from 'qrcode'
import { BaseService } from '@/server/services/base.service'
import { FileService, type DownloadUrl } from '@/server/services/file.service'
import type { RequestContext } from '@/server/http/context'

export type QrFormat = 'png' | 'svg'

export interface QrOptions {
  size?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * QR code generation (Mission 7). Pure, offline generators (`qrcode` — no canvas/native
 * deps) for PNG bytes, SVG, and data URLs, plus a workspace-scoped `generateAndStore`
 * that persists the image as a `QR` `FileObject`. Used by the invoice QR
 * (`InvoiceData.qrCode`, a payment/share link) and the standalone QR generator tool.
 */
export async function qrPngBytes(data: string, opts: QrOptions = {}): Promise<Uint8Array> {
  const buffer = await QRCode.toBuffer(data, {
    type: 'png',
    width: opts.size ?? 256,
    margin: opts.margin ?? 2,
    errorCorrectionLevel: opts.errorCorrectionLevel ?? 'M',
  })
  return new Uint8Array(buffer)
}

export function qrSvg(data: string, opts: QrOptions = {}): Promise<string> {
  return QRCode.toString(data, {
    type: 'svg',
    margin: opts.margin ?? 2,
    errorCorrectionLevel: opts.errorCorrectionLevel ?? 'M',
  })
}

export function qrDataUrl(data: string, opts: QrOptions = {}): Promise<string> {
  return QRCode.toDataURL(data, {
    width: opts.size ?? 256,
    margin: opts.margin ?? 2,
    errorCorrectionLevel: opts.errorCorrectionLevel ?? 'M',
  })
}

export interface QrStoreResult {
  fileId: string
  download: DownloadUrl
}

export class QrService extends BaseService {
  private readonly files: FileService

  constructor(ctx: RequestContext) {
    super(ctx)
    this.files = new FileService(ctx)
  }

  /** Generate a QR image and store it as a workspace `FileObject`. */
  async generateAndStore(data: string, opts: QrOptions & { format?: QrFormat } = {}): Promise<QrStoreResult> {
    const format = opts.format ?? 'png'
    const bytes =
      format === 'svg'
        ? new TextEncoder().encode(await qrSvg(data, opts))
        : await qrPngBytes(data, opts)
    const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/png'
    const file = await this.files.storeBuffer('QR', bytes, { mimeType })
    return { fileId: file.id, download: await this.files.getDownloadUrl(file.id) }
  }
}
