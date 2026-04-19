import Link from 'next/link';
import { getUsersDirectory, USERS_PAGE_SIZE } from '@/lib/admin/users-directory';
import styles from './users-list.module.css';

export const metadata = {
  title: 'Users — Admin',
  robots: 'noindex,nofollow' as const,
};

function usersListHref(q: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (q?.trim()) params.set('q', q.trim());
  if (page > 1) params.set('page', String(page));
  const s = params.toString();
  return s ? `/admin/users?${s}` : '/admin/users';
}

function planBadgeClass(plan: string) {
  if (plan === 'premium' || plan === 'lifetime') return styles.badgePremium;
  if (plan === 'pro') return styles.badgePro;
  return styles.badgeFree;
}

function statusBadgeClass(status: string | null) {
  if (status === 'active' || status === 'trialing') return styles.badgeActive;
  if (status === 'past_due') return styles.badgePastDue;
  return styles.badgeNeutral;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const { users, total, page, totalPages } = await getUsersDirectory(q, requestedPage);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Users</h1>
        <span className={styles.count}>
          {total} user{total !== 1 ? 's' : ''}
          {q?.trim() && !q.includes('@') ? ` · page ${page} of ${totalPages}` : ''}
          {q?.trim()?.includes('@') ? ' · email lookup' : ''}
        </span>
      </div>
      <p className={styles.subtitle}>
        Search by email or name. {USERS_PAGE_SIZE} users per page when browsing the directory.
      </p>

      <form method="GET" action="/admin/users" className={styles.searchForm}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email or name…"
          className={styles.searchInput}
          autoComplete="off"
        />
        <button type="submit" className={styles.searchBtn}>
          Search
        </button>
        {q?.trim() ? (
          <a href="/admin/users" className={styles.clearBtn}>
            Clear
          </a>
        ) : null}
      </form>

      {users.length === 0 ? (
        <p className={styles.empty}>{q?.trim() ? `No users found matching "${q}".` : 'No users yet.'}</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Onboarded</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{user.full_name || '—'}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${planBadgeClass(user.plan)}`}>{user.plan}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${statusBadgeClass(user.subscription_status)}`}>
                        {user.subscription_status ?? 'none'}
                      </span>
                    </td>
                    <td className={styles.center}>{user.onboarding_complete ? '✓' : '—'}</td>
                    <td className={styles.muted}>
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <a href={`/admin/users/${user.id}`} className={styles.viewLink}>
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && !q?.includes('@') ? (
            <nav className={styles.pagination} aria-label="User list pages">
              {page <= 1 ? (
                <span className={`${styles.pageBtn} ${styles.pageBtnDisabled}`}>← Previous</span>
              ) : (
                <Link href={usersListHref(q, page - 1)} className={styles.pageBtn}>
                  ← Previous
                </Link>
              )}
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              {page >= totalPages ? (
                <span className={`${styles.pageBtn} ${styles.pageBtnDisabled}`}>Next →</span>
              ) : (
                <Link href={usersListHref(q, page + 1)} className={styles.pageBtn}>
                  Next →
                </Link>
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
