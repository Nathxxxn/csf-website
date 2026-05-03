'use client'

import { useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CommonImageUploadProps {
  currentUrl?: string | null
  label?: string
}

type ImageUploadProps = CommonImageUploadProps & (
  | { multiple?: false; onUpload: (url: string) => void | Promise<void> }
  | { multiple: true; onUpload: (urls: string[]) => void | Promise<void> }
)

export function ImageUpload(props: ImageUploadProps) {
  const { currentUrl, label = 'Image' } = props
  const multiple = props.multiple === true
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const router = useRouter()

  const displayUrls = previewUrls.length > 0 ? previewUrls : currentUrl ? [currentUrl] : []

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/blob', { method: 'POST', body: formData })
        const json = await res.json() as { url?: string; error?: string }
        if (!res.ok) throw new Error(json.error ?? `Erreur serveur (${res.status})`)
        urls.push((json as { url: string }).url)
      }
      setPreviewUrls(urls)
      if (props.multiple) {
        await props.onUpload(urls)
      } else {
        await props.onUpload(urls[0])
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload échoué')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-xs text-white/60">{label}</label>
      {displayUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayUrls.map((displayUrl) => (
            <img key={displayUrl} src={displayUrl} alt="" className="h-20 w-auto rounded object-cover" />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs text-white/50 hover:border-white/40 disabled:opacity-50"
      >
        {uploading ? 'Upload en cours...' : multiple ? 'Choisir des images' : 'Choisir une image'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
