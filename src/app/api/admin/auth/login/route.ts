import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { AdminLoginSchema } from '@/lib/schemas';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const validation = AdminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Look up Admin in DB
    let admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    // Auto-bootstrap default admin if database is empty and credentials match env
    if (!admin) {
      const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@prosquaretiling.com').toLowerCase().trim();
      const defaultPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';
      const defaultName = process.env.ADMIN_NAME || 'Master Admin';

      if (normalizedEmail === defaultEmail && password === defaultPassword) {
        const passwordHash = await bcrypt.hash(defaultPassword, 12);
        admin = await prisma.adminUser.create({
          data: {
            email: defaultEmail,
            passwordHash,
            name: defaultName,
          },
        });
      }
    }

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await getSession();
    session.isLoggedIn = true;
    session.adminId = admin.id;
    session.email = admin.email;
    session.name = admin.name;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
