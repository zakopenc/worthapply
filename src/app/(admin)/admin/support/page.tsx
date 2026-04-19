import Link from 'next/link';
import { listSupportTickets, SUPPORT_TICKETS_PAGE_SIZE } from '@/lib/admin/support-tickets-data';
import styles from './support.module.css';

export const metadata = {
  title: 'Support tickets — Admin',
  robots: 'noindex,nofollow' as const,
};

function hrefPage(page: number): string {
  return page > 1 ? `/admin/support?page=${page}` : '/admin/support';
}

export default async function AdminSupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const { tickets, total, page, totalPages } = await listSupportTickets(requestedPage);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Support tickets</h1>
        <span className={styles.count}>
          {total} ticket{total !== 1 ? 's' : ''}
          {total > 0 ? ` · page ${page} of ${totalPages}` : ''}
        </span>
      </div>
      <p className={styles.subtitle}>
        User-submitted reports from the app (subject, message, and optional screenshots). {SUPPORT_TICKETS_PAGE_SIZE}{' '}
        per page.
      </p>

      {tickets.length === 0 ? (
        <p className={styles.empty}>No support tickets yet.</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Subject</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Files</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td className={styles.time}>
                      {new Date(t.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className={styles.subjectCell}>
                      <Link href={`/admin/support/${t.id}`} className={styles.subjectLine}>
                        {t.subject}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/users/${t.user_id}`}>
                        {t.user_full_name?.trim() || '—'}
                      </Link>
                      <div className={styles.time} style={{ marginTop: 4 }}>
                        {t.user_id.slice(0, 8)}…
                      </div>
                    </td>
                    <td>
                      <span className={t.status === 'open' ? styles.badgeOpen : styles.badgeClosed}>
                        {t.status}
                      </span>
                    </td>
                    <td>{t.attachment_paths?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {page > 1 ? (
                <Link href={hrefPage(page - 1)}>← Previous</Link>
              ) : (
                <span>← Previous</span>
              )}
              <span>
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={hrefPage(page + 1)}>Next →</Link>
              ) : (
                <span>Next →</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
