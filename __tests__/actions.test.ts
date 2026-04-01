import { describe, it, expect, vi } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null })

// Mock Resend before importing actions
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend }
    },
  }
})

// Mock environment variables
vi.stubEnv('RESEND_API_KEY', 'test-key')
vi.stubEnv('CONTACT_EMAIL', 'contact@csf.fr')

const { sendContactEmail } = await import('@/app/contact/actions')

describe('sendContactEmail', () => {
  it('returns success when all fields are valid', async () => {
    const result = await sendContactEmail({
      name: 'Jean Dupont',
      company: 'Goldman Sachs',
      email: 'jean@goldman.com',
      subject: 'partnership',
      message: 'Bonjour, nous souhaitons organiser un événement avec votre association.',
    })
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns error when email is invalid', async () => {
    const result = await sendContactEmail({
      name: 'Jean',
      company: 'GS',
      email: 'not-an-email',
      subject: 'partnership',
      message: 'Test',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/email/i)
  })

  it('returns error when required fields are missing', async () => {
    const result = await sendContactEmail({
      name: '',
      company: 'GS',
      email: 'jean@gs.com',
      subject: 'partnership',
      message: 'Test',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/nom/i)
  })

  it('returns error when message is too short', async () => {
    const result = await sendContactEmail({
      name: 'Jean',
      company: 'GS',
      email: 'jean@gs.com',
      subject: 'partnership',
      message: 'Hi',
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/message/i)
  })
})
