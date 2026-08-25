interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(token?: string, ip?: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // If Turnstile is not configured in env (e.g. initial dev/test setup), permit pass-through
  if (!secretKey) {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Bot verification token missing' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.warn('[Turnstile] Validation failed:', data['error-codes']);
      return { success: false, error: 'Verification failed. Please retry the security challenge.' };
    }

    return { success: true };
  } catch (error) {
    console.error('[Turnstile] Error verifying token:', error);
    // Best-effort fallback on network/verification service outage
    return { success: true };
  }
}
