-- Allow each authenticated user to read only their own admin_roles row (for post-login redirect).
-- Service role and existing admin APIs are unchanged.

CREATE POLICY "admin_roles_select_own"
ON public.admin_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
