import { createServiceClient } from '@/lib/supabase/server';

export const SUPPORT_TICKETS_PAGE_SIZE = 25;

export type SupportTicketRow = {
  id: string;
  user_id: string;
  subject: string;
  attachment_paths: string[];
  status: string;
  created_at: string;
  user_full_name: string | null;
};

export type SupportTicketDetail = SupportTicketRow & {
  body: string;
  user_email: string | null;
  attachment_urls: { path: string; url: string }[];
};

/**
 * Open support tickets count (for admin overview).
 */
export async function getOpenSupportTicketsCount(): Promise<number> {
  const supabase = await createServiceClient();
  const { count, error } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  if (error) {
    console.error('[getOpenSupportTicketsCount]', error.message);
    return 0;
  }
  return count ?? 0;
}

export async function listSupportTickets(page: number): Promise<{
  tickets: SupportTicketRow[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = await createServiceClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * SUPPORT_TICKETS_PAGE_SIZE;
  const to = from + SUPPORT_TICKETS_PAGE_SIZE - 1;

  const { data: tickets, error, count } = await supabase
    .from('support_tickets')
    .select('id, user_id, subject, attachment_paths, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[listSupportTickets]', error.message);
    return { tickets: [], total: 0, page: safePage, totalPages: 0 };
  }

  const rows = tickets ?? [];
  const userIds = [...new Set(rows.map((t) => t.user_id))];

  let nameById = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
    nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / SUPPORT_TICKETS_PAGE_SIZE));

  return {
    tickets: rows.map((t) => ({
      ...t,
      attachment_paths: Array.isArray(t.attachment_paths) ? t.attachment_paths : [],
      user_full_name: nameById.get(t.user_id) ?? null,
    })),
    total,
    page: safePage,
    totalPages,
  };
}

export async function getSupportTicketDetail(id: string): Promise<SupportTicketDetail | null> {
  const supabase = await createServiceClient();

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select('id, user_id, subject, body, attachment_paths, status, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error || !ticket) {
    if (error) console.error('[getSupportTicketDetail]', error.message);
    return null;
  }

  const paths = Array.isArray(ticket.attachment_paths) ? ticket.attachment_paths : [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', ticket.user_id)
    .maybeSingle();

  const signedList = await Promise.all(
    paths.map((path) => supabase.storage.from('support-attachments').createSignedUrl(path, 3600))
  );

  let user_email: string | null = null;
  try {
    const { data: authData, error: authErr } = await supabase.auth.admin.getUserById(ticket.user_id);
    if (!authErr && authData?.user?.email) user_email = authData.user.email;
  } catch (e) {
    console.error('[getSupportTicketDetail] auth.admin.getUserById', e);
  }

  const attachment_urls: { path: string; url: string }[] = [];
  paths.forEach((path, i) => {
    const url = signedList[i]?.data?.signedUrl;
    if (url) attachment_urls.push({ path, url });
  });

  return {
    ...ticket,
    attachment_paths: paths,
    user_full_name: profile?.full_name ?? null,
    user_email,
    attachment_urls,
  };
}
