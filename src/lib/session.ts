import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface AdminSessionData {
  isLoggedIn: boolean;
  adminId?: string;
  email?: string;
  name?: string;
}

export const defaultSession: AdminSessionData = {
  isLoggedIn: false,
};

// 32+ characters password for iron-session encryption
const sessionPassword =
  process.env.ADMIN_SESSION_SECRET ||
  'pro-square-secure-admin-session-secret-key-32-chars-minimum-prod';

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: 'pro_square_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }
  return session;
}
