import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service is not configured. Please try again later.' },
        { status: 503 }
      );
    }

    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: 'WorthApply Contact <noreply@worthapply.com>',
      to: 'ZakE@worthapply.com',
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fcfaf7; border-radius: 16px; overflow: hidden; border: 1px solid rgba(84, 72, 64, 0.12);">
          <div style="background: linear-gradient(160deg, #171411 0%, #2d261f 100%); padding: 32px 40px;">
            <h1 style="color: #f7efe7; font-size: 22px; margin: 0; letter-spacing: -0.03em;">New Contact Message</h1>
            <p style="color: rgba(247, 239, 231, 0.6); margin: 6px 0 0; font-size: 14px;">Received via worthapply.com/contact</p>
          </div>
          <div style="padding: 32px 40px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; font-size: 13px; color: #6e665f; width: 80px; vertical-align: top; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">From</td>
                <td style="padding: 10px 0; font-size: 14px; color: #171411;">${name} &lt;${email}&gt;</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 13px; color: #6e665f; vertical-align: top; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Subject</td>
                <td style="padding: 10px 0; font-size: 14px; color: #171411;">${subject}</td>
              </tr>
            </table>
            <div style="background: white; border-radius: 12px; padding: 20px 24px; border: 1px solid rgba(84, 72, 64, 0.1);">
              <p style="font-size: 13px; color: #6e665f; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 12px;">Message</p>
              <p style="font-size: 15px; color: #171411; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
            <p style="margin-top: 24px; font-size: 13px; color: #6e665f;">Reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
