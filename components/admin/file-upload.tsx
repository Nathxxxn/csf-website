'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export type FileUploadPayload = {
  url: string
  filename: string
  mimeType: string
}

interface FileUploadProps {
  currentFilename?: string | null
  label?: string
  onUpload: (payload: FileUploadPayload) => void | Promise<void>
  onClear?: () => void | Promise<void>
}

const ACCEPTED_DOCUMENTS = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
].join(',')

export function FileUpload({ currentFilename, label = 'Fichier', onUpload, onClear }: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filename, setFilename] = useState(currentFilename ?? '')
  const router = useRouter()

  useEffect(() => {
    setFilename(currentFilename ?? '')
  }, [currentFilename])

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/blob', { method: 'POST', body: formData })
      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error ?? `Erreur serveur (${res.status})`)

      const payload = {
        url: json.url,
        filename: file.name,
        mimeType: file.type,
      }
      await onUpload(payload)
      setFilename(file.name)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload échoué')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleClear() {
    setError(null)
    setUploading(true)
    try {
      if (onClear) await onClear()
      setFilename('')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression du support échouée')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-xs text-white/60">{label}</label>
      {filename && (
        <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
          <p className="min-w-0 flex-1 truncate text-xs text-white/60">{filename}</p>
          <button
            type="button"
            onClick={handleClear}
            disabled={uploading}
            className="shrink-0 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Retirer le support
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs text-white/50 hover:border-white/40 disabled:opacity-50"
      >
        {uploading ? 'Upload en cours...' : 'Choisir un document'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPTED_DOCUMENTS}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
