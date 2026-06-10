import type { Access } from 'payload'

/** Grants access to everyone, including unauthenticated requests. */
export const anyone: Access = () => true
