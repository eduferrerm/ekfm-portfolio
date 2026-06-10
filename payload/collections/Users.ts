import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/** Auth-enabled collection backing the Payload admin panel. */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    // `email` and password are added automatically by `auth: true`.
    {
      name: 'name',
      type: 'text',
    },
  ],
}
