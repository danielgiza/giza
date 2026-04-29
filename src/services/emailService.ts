import emailjs from '@emailjs/browser'

const SERVICE_ID = 'service_nrbmb13'
const TEMPLATE_RESET_PASSWORD = 'template_byrc9na'
const TEMPLATE_VERIFY_EMAIL = 'template_xp3h7bb'
const PUBLIC_KEY = 'gSljkhtFaUCb4GLvL'

let initialized = false

function ensureInit() {
  if (!initialized) {
    emailjs.init({ publicKey: PUBLIC_KEY })
    initialized = true
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetLink: string
): Promise<boolean> {
  ensureInit()
  try {
    const params = {
      to_email: toEmail,
      user_name: userName,
      reset_link: resetLink,
      reply_to: toEmail,
    }
    console.log('Sending password reset email with params:', { ...params, to_email: toEmail })
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_RESET_PASSWORD, params)
    console.log('Password reset email sent:', result.status, result.text)
    return true
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return false
  }
}

export async function sendVerificationEmail(
  toEmail: string,
  userName: string,
  verifyLink: string
): Promise<boolean> {
  ensureInit()
  try {
    const params = {
      to_email: toEmail,
      user_name: userName,
      verify_link: verifyLink,
      reply_to: toEmail,
    }
    console.log('Sending verification email with params:', { ...params, to_email: toEmail })
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_VERIFY_EMAIL, params)
    console.log('Verification email sent:', result.status, result.text)
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}
