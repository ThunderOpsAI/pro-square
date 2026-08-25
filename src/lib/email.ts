import { Resend } from 'resend';
import { AiTriageResult } from './ai-triage';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface LeadEmailData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  createdAt: Date;
  aiTriage?: AiTriageResult | null;
}

export async function sendOwnerNotification(data: LeadEmailData): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY is not set. Skipping owner notification email.');
    return false;
  }

  const to = process.env.BUSINESS_OWNER_EMAIL || 'owner@prosquaretiling.com';
  const from = process.env.RESEND_FROM_EMAIL || 'Pro Square Tiling <onboarding@resend.dev>';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const aiSection = data.aiTriage ? `
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-top: 20px;">
      <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 16px;">🤖 Gemini AI Triage & Estimate</h3>
      <p style="margin: 0 0 8px 0; color: #15803d; font-size: 14px;"><strong>Summary:</strong> ${data.aiTriage.summary}</p>
      <p style="margin: 0 0 8px 0; color: #15803d; font-size: 14px;"><strong>Scope:</strong> ${data.aiTriage.scopeAssessment}</p>
      <p style="margin: 0 0 8px 0; color: #15803d; font-size: 14px;"><strong>Ballpark Range:</strong> $${data.aiTriage.estimateLow.toLocaleString()} - $${data.aiTriage.estimateHigh.toLocaleString()} AUD</p>
      <div style="margin-top: 10px; padding: 10px; background-color: #ffffff; border-radius: 8px; border: 1px solid #dcfce7;">
        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #166534;">AI Draft Proposal for Customer:</p>
        <p style="margin: 0; font-size: 13px; color: #374151; white-space: pre-wrap;">${data.aiTriage.draftProposal}</p>
      </div>
    </div>
  ` : `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 20px;">
      <p style="margin: 0; color: #64748b; font-size: 14px;"><em>AI triage pending or unavailable for this submission.</em></p>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 22px; color: #1e3a8a;">New Quote Lead Received</h2>
          </div>
          <p style="font-size: 15px; color: #475569;">A new quote inquiry has been submitted on <strong>Pro Square Tiling</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;">Customer Name:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${data.firstName} ${data.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #2563eb;">${data.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Project Type:</td>
              <td style="padding: 8px 0; font-weight: 600; text-transform: capitalize; color: #0f172a;">${data.projectType}</td>
            </tr>
          </table>

          <div style="margin-top: 16px; padding: 14px; background-color: #f1f5f9; border-radius: 8px;">
            <strong style="font-size: 13px; color: #334155;">Customer Notes / Project Description:</strong>
            <p style="margin: 6px 0 0 0; font-size: 14px; color: #1e293b; white-space: pre-wrap;">${data.message}</p>
          </div>

          ${aiSection}

          <div style="margin-top: 28px; text-align: center;">
            <a href="${appUrl}/admin" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">View in Admin Dashboard</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">Pro Square Tiling Lead Notification System &bull; Lead ID: ${data.id}</p>
        </div>
      </body>
    </html>
  `;

  try {
    const res = await resend.emails.send({
      from,
      to,
      subject: `🚨 New Lead: ${data.projectType.toUpperCase()} - ${data.firstName} ${data.lastName}`,
      html,
    });
    console.log('[Email] Owner notification sent:', res.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send owner notification:', error);
    return false;
  }
}

export async function sendCustomerConfirmation(data: LeadEmailData): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY is not set. Skipping customer confirmation email.');
    return false;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Pro Square Tiling <onboarding@resend.dev>';
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(555) 123-4567';

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #1e3a8a;">Thank You for Reaching Out, ${data.firstName}!</h2>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">We have received your quote request for <strong>${data.projectType} tiling</strong>. Our team is currently reviewing your project details and specifications.</p>
          
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">What Happens Next?</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
              <li><strong>Within 24 Hours:</strong> Our master tiler will review your requirements and prepare preliminary estimates.</li>
              <li><strong>Free Consultation:</strong> We'll contact you to schedule a quick on-site measurement if required.</li>
              <li><strong>Detailed Proposal:</strong> You'll receive a transparent, fixed-price quote with no hidden fees.</li>
            </ul>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 14px; color: #64748b;">
            <p style="margin: 0 0 4px 0;">Need immediate assistance or have urgent questions?</p>
            <p style="margin: 0;">Call us directly at <strong style="color: #0f172a;">${phone}</strong> or reply to this email.</p>
          </div>

          <div style="margin-top: 24px; padding: 16px 0 0 0; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #1e3a8a; font-size: 15px;">Pro Square Tiling</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Master Craftsmanship &bull; Precision Installations</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const res = await resend.emails.send({
      from,
      to: data.email,
      subject: `We've Received Your Quote Request | Pro Square Tiling`,
      html,
    });
    console.log('[Email] Customer confirmation sent:', res.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send customer confirmation:', error);
    return false;
  }
}
