import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}))

function makeRedirectError(url: string) {
  return Object.assign(new Error('NEXT_REDIRECT'), {
    digest: `NEXT_REDIRECT;push;${url};307;`,
  })
}

describe('useAdminAction', () => {
  beforeEach(() => {
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
  })

  it('shows a success toast and calls onSuccess when the action resolves', async () => {
    const { useAdminAction } = await import('@/components/admin/use-admin-action')
    const action = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useAdminAction(action, { successMessage: 'Membre créé', onSuccess }))

    act(() => { result.current.run('form-data' as never) })

    await waitFor(() => expect(action).toHaveBeenCalledWith('form-data'))
    await waitFor(() => expect(toastSuccessMock).toHaveBeenCalledWith('Membre créé'))
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBeNull()
  })

  it('sets an inline error and shows an error toast when the action rejects', async () => {
    const { useAdminAction } = await import('@/components/admin/use-admin-action')
    const action = vi.fn().mockRejectedValue(new Error('Validation échouée : Le nom est requis'))
    const { result } = renderHook(() => useAdminAction(action))

    act(() => { result.current.run() })

    await waitFor(() => expect(result.current.error).toBe('Validation échouée : Le nom est requis'))
    expect(toastErrorMock).toHaveBeenCalledWith('Validation échouée : Le nom est requis')
  })

  it('clears a previous error when the action succeeds on retry', async () => {
    const { useAdminAction } = await import('@/components/admin/use-admin-action')
    const action = vi.fn()
      .mockRejectedValueOnce(new Error('Erreur serveur'))
      .mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useAdminAction(action))

    act(() => { result.current.run() })
    await waitFor(() => expect(result.current.error).toBe('Erreur serveur'))

    act(() => { result.current.run() })
    await waitFor(() => expect(result.current.error).toBeNull())
  })

  it('re-throws Next.js redirect errors without reporting them as failures', async () => {
    const { useAdminAction } = await import('@/components/admin/use-admin-action')
    const action = vi.fn().mockRejectedValue(makeRedirectError('/admin/dashboard?tab=evenements'))
    const { result } = renderHook(() => useAdminAction(action))

    // In production, Next.js' action queue catches this re-thrown error to perform
    // the navigation. The test harness has no such listener, so it must be swallowed
    // here to prove the redirect propagated instead of being reported as a failure.
    const rethrown: unknown[] = []
    const captureRethrow = (error: unknown) => { rethrown.push(error) }
    process.on('uncaughtException', captureRethrow)
    process.on('unhandledRejection', captureRethrow)

    try {
      act(() => { result.current.run() })
      await waitFor(() => expect(action).toHaveBeenCalled())
      await waitFor(() => expect(rethrown).toHaveLength(1))
    } finally {
      process.off('uncaughtException', captureRethrow)
      process.off('unhandledRejection', captureRethrow)
    }

    expect((rethrown[0] as { digest?: string }).digest).toContain('NEXT_REDIRECT')
    expect(toastErrorMock).not.toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })
})
