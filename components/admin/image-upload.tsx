'use client'

import { upload } from '@vercel/blob/client'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void | Promise<void>
  label?: string
}

export function ImageUpload({ currentUrl, onUpload, label = 'Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/blob',
      })
      await onUpload(blob.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-white/60">{label}</label>
      {currentUrl && (
        <img src={currentUrl} alt="" className="h-20 w-auto rounded object-cover" />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs text-white/50 hover:border-white/40 disabled:opacity-50"
      >
        {uploading ? 'Upload en cours...' : 'Choisir une image'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  )
}
