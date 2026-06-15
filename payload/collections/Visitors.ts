import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/** Per-company visitor landing data surfaced at /dear/[company]. */
export const Visitors: CollectionConfig = {
  slug: 'visitors',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'slug', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'headline',
      type: 'text',
    },
    {
      // Upload field = a relationship to a Media doc, not embedded bytes.
      // Stores only a FK (visitors.company_logo_id -> media.id); the file itself
      // lives in Media / Vercel Blob. The admin renders a picker: choose an
      // existing asset or drag-and-drop a new one (creates the Media row inline).
      // Semantic name is the SSOT — admin label derives from it ("Company Logo").
      name: 'companyLogo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'notes',
      type: 'richText',
    },
  ],
}
