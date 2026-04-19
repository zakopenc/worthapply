import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SUBJECT = 200;
const MAX_BODY = 10000;
const MAX_PATHS = 5;

type SupportPayload = {
  ticketId: string;
  subject: string;
  body: string;
  attachment_paths: string[];
};

function isValidPayload(data: unknown): data is SupportPayload {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.ticketId === 'string' &&
    typeof o.subject === 'string' &&
    typeof o.body === 'string' &&
    Array.isArray(o.attachment_paths) &&
    o.attachment_paths.every((p) => typeof p === 'string')
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    if (!isValidPayload(json)) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { ticketId, subject: subjectRaw, body: bodyRaw, attachment_paths } = json;

    const subject = subjectRaw.trim();
    const body = bodyRaw.trim();

    if (!subject.length || subject.length > MAX_SUBJECT) {
      return NextResponse.json(
        { error: `Subject must be between 1 and ${MAX_SUBJECT} characters.` },
        { status: 400 }
      );
    }
    if (!body.length || body.length > MAX_BODY) {
      return NextResponse.json(
        { error: `Description must be between 1 and ${MAX_BODY} characters.` },
        { status: 400 }
      );
    }

    if (attachment_paths.length > MAX_PATHS) {
      return NextResponse.json({ error: `At most ${MAX_PATHS} attachments allowed.` }, { status: 400 });
    }

    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket id.' }, { status: 400 });
    }

    const expectedPrefix = `${user.id}/${ticketId}/`;
    for (const p of attachment_paths) {
      if (p.includes('..') || p.includes('//')) {
        return NextResponse.json({ error: 'Invalid attachment path.' }, { status: 400 });
      }
      if (!p.startsWith(expectedPrefix)) {
        return NextResponse.json({ error: 'Attachment paths must belong to this report.' }, { status: 400 });
      }
    }

    const { error: insertErr } = await supabase.from('support_tickets').insert({
      id: ticketId,
      user_id: user.id,
      subject,
      body,
      attachment_paths,
    });

    if (insertErr) {
      console.error('[support] insert error:', insertErr);
      return NextResponse.json({ error: 'Could not save your report. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ticketId });
  } catch (e) {
    console.error('[support] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
