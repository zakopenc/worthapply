import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupportTicketDetail } from '@/lib/admin/support-tickets-data';
import { TicketStatusActions } from './TicketStatusActions';
import styles from '../support.module.css';

export const metadata = {
  title: 'Ticket — Admin',
  robots: 'noindex,nofollow' as const,
};

export default async function AdminSupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getSupportTicketDetail(id);

  if (!ticket) notFound();

  return (
    <div>
      <Link href="/admin/support" className={styles.back}>
        ← All tickets
      </Link>

      <div className={styles.detailCard}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 className={styles.detailTitle}>{ticket.subject}</h1>
          <span className={ticket.status === 'open' ? styles.badgeOpen : styles.badgeClosed}>{ticket.status}</span>
        </div>

        <div className={styles.metaRow}>
          <span>
            <strong>When:</strong>{' '}
            {new Date(ticket.created_at).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span>
            <strong>User:</strong>{' '}
            {ticket.user_email ? (
              <a href={`mailto:${ticket.user_email}`}>{ticket.user_email}</a>
            ) : (
              '—'
            )}
            {ticket.user_full_name ? ` · ${ticket.user_full_name}` : ''}
          </span>
          <Link href={`/admin/users/${ticket.user_id}`}>
            <strong>Profile →</strong>
          </Link>
        </div>

        <p className={styles.bodyBlock}>{ticket.body}</p>

        {ticket.attachment_urls.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9d6148', marginBottom: 10 }}>
              Screenshots
            </p>
            <div className={styles.imagesGrid}>
              {ticket.attachment_urls.map(({ path, url }) => (
                <a
                  key={path}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.imageWrap}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs */}
                  <img src={url} alt="" />
                </a>
              ))}
            </div>
            <p className={styles.msg} style={{ marginTop: 12 }}>
              Links expire in about an hour. Open in a new tab to view full size.
            </p>
          </div>
        )}

        <TicketStatusActions ticketId={ticket.id} status={ticket.status} />
      </div>
    </div>
  );
}
