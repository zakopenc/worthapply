import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().trim().toLowerCase(),
  roleType: z.enum([
    'outplacement',
    'independent_coach',
    'executive_coach',
    'university_career_center',
    'hr_recruiter',
    'other',
  ]),
  clientVolume: z.enum(['1-5', '6-20', '21-50', '50+']),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

const ROLE_LABELS: Record<string, string> = {
  outplacement: 'Outplacement firm',
  independent_coach: 'Independent career coach',
  executive_coach: 'Executive coach',
  university_career_center: 'University / college career center',
  hr_recruiter: 'HR professional / recruiter',
  other: 'Other',
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, roleType, clientVolume, website, notes } = parsed.data;

  // Save to Supabase (service role bypasses RLS)
  const supabase = await createServiceClient();
  const { error: dbError } = await supabase.from('partner_leads').insert({
    name,
    email,
    role_type: roleType,
    client_volume: clientVolume,
    website: website || null,
    notes: notes || null,
  });

  if (dbError) {
    // Duplicate email — treat gracefully
    if (dbError.code === '23505') {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    console.error('[partners] DB insert error:', dbError);
    return NextResponse.json({ error: 'Failed to save your request. Please try again.' }, { status: 500 });
  }

  // Send notification email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: 'WorthApply Partners <noreply@worthapply.com>',
      to: 'ZakE@worthapply.com',
      replyTo: email,
      subject: `[Partner Lead] ${name} — ${ROLE_LABELS[roleType]}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fcfaf7;border-radius:16px;overflow:hidden;border:1px solid rgba(84,72,64,0.12);">
          <div style="background:linear-gradient(160deg,#171411 0%,#2d261f 100%);padding:32px 40px;">
            <h1 style="color:#f7efe7;font-size:22px;margin:0;letter-spacing:-0.03em;">New Partner Application</h1>
            <p style="color:rgba(247,239,231,0.6);margin:6px 0 0;font-size:14px;">Received via worthapply.com/partners</p>
          </div>
          <div style="padding:32px 40px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#6e665f;width:120px;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Name</td>
                <td style="padding:10px 0;font-size:14px;color:#171411;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#6e665f;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
                <td style="padding:10px 0;font-size:14px;color:#171411;"><a href="mailto:${email}" style="color:#C17F3C;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#6e665f;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Role type</td>
                <td style="padding:10px 0;font-size:14px;color:#171411;">${ROLE_LABELS[roleType]}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#6e665f;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Clients / mo</td>
                <td style="padding:10px 0;font-size:14px;color:#171411;">${clientVolume}</td>
              </tr>
              ${website ? `<tr><td style="padding:10px 0;font-size:13px;color:#6e665f;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Website</td><td style="padding:10px 0;font-size:14px;color:#171411;"><a href="${website}" style="color:#C17F3C;">${website}</a></td></tr>` : ''}
              ${notes ? `<tr><td style="padding:10px 0;font-size:13px;color:#6e665f;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Notes</td><td style="padding:10px 0;font-size:14px;color:#171411;">${notes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td></tr>` : ''}
            </table>
            <p style="margin-top:24px;font-size:13px;color:#6e665f;">Reply directly to send ${name} their referral link.</p>
          </div>
        </div>
      `,
    }).catch((err: unknown) => console.error('[partners] Resend error:', err));

    // Send confirmation to the applicant
    await resend.emails.send({
      from: 'Zak at WorthApply <zake@worthapply.com>',
      to: email,
      subject: 'Your WorthApply partner application — we got it',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fcfaf7;border-radius:16px;overflow:hidden;border:1px solid rgba(84,72,64,0.12);">
          <div style="background:linear-gradient(160deg,#171411 0%,#2d261f 100%);padding:32px 40px;">
            <h1 style="color:#f7efe7;font-size:22px;margin:0;letter-spacing:-0.03em;">You're in the queue, ${name.split(' ')[0]}.</h1>
            <p style="color:rgba(247,239,231,0.6);margin:6px 0 0;font-size:14px;">WorthApply Partner Program</p>
          </div>
          <div style="padding:32px 40px;">
            <p style="font-size:15px;color:#171411;line-height:1.7;margin:0 0 16px;">Thanks for applying. We review every application manually and will send you a personalized referral link and free Pro account within 24 hours.</p>
            <p style="font-size:15px;color:#171411;line-height:1.7;margin:0 0 24px;">In the meantime, feel free to try WorthApply yourself at <a href="https://worthapply.com" style="color:#C17F3C;">worthapply.com</a>.</p>
            <p style="font-size:14px;color:#6e665f;margin:0;">— Zak<br>Founder, WorthApply</p>
          </div>
        </div>
      `,
    }).catch((err: unknown) => console.error('[partners] Resend confirmation error:', err));
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
