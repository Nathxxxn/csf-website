'use client'

import { useState, useTransition } from 'react'
import { unstable_rethrow } from 'next/navigation'
import { toast } from 'sonner'

interface UseAdminActionOptions {
  successMessage?: string
  onSuccess?: () => void
}

interface UseAdminActionResult<Args extends unknown[]> {
  run: (...args: Args) => void
  isPending: boolean
  error: string | null
}

/**
 * Wraps an admin server action with a consistent pending state, inline error,
 * and success toast. Redirect errors thrown by the action (e.g. `redirect()`
 * after creating/deleting an event) are re-thrown so Next.js can still
 * perform the navigation instead of them being reported as failures.
 */
export function useAdminAction<Args extends unknown[]>(
  action: (...args: Args) => Promise<void>,
  options: UseAdminActionOptions = {},
): UseAdminActionResult<Args> {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(...args: Args) {
    setError(null)
    startTransition(async () => {
      try {
        await action(...args)
        if (options.successMessage) toast.success(options.successMessage)
        options.onSuccess?.()
      } catch (e) {
        unstable_rethrow(e)
        const message = e instanceof Error ? e.message : 'Une erreur est survenue'
        setError(message)
        toast.error(message)
      }
    })
  }

  return { run, isPending, error }
}
