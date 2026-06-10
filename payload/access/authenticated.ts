import type { Access } from 'payload'

/** Grants access only to authenticated users (i.e. logged-in admins). */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
