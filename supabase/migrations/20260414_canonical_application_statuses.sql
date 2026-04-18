-- Canonicalize application status storage to match app runtime expectations.

ALTER TABLE applications
  ALTER COLUMN status SET DEFAULT 'wishlist';

UPDATE applications
SET status = 'wishlist', updated_at = now()
WHERE status IN ('saved', 'draft');

UPDATE applications
SET status = 'interview', updated_at = now()
WHERE status IN ('screening', 'interviewing');

UPDATE applications
SET status = 'offer', updated_at = now()
WHERE status = 'offered';
