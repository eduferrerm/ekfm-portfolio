import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Portfolio } from './payload/collections/Portfolio'
import { Experience } from './payload/collections/Experience'
import { Visitors } from './payload/collections/Visitors'
import { Keywords } from './payload/collections/Keywords'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Portfolio, Experience, Visitors, Keywords],
  editor: lexicalEditor(),
  // Secret is read exclusively from the environment — never hardcoded.
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      // Connection string is read exclusively from the environment.
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  // Payload ships with GraphQL built in; it is served from /api/graphql.
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'payload/generated-schema.graphql'),
    // Extend the built-in schema with custom resolvers here (no separate server):
    // queries: (GraphQL, payload) => ({ /* custom queries */ }),
    // mutations: (GraphQL, payload) => ({ /* custom mutations */ }),
  },
  plugins: [
    vercelBlobStorage({
      // Maps the Media upload collection onto a Vercel Blob store.
      collections: {
        media: true,
      },
      // Browser → Blob direct uploads, bypassing the 4.5MB serverless body cap.
      clientUploads: true,
      // Token is injected automatically by Vercel; read from env, never hardcoded.
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  sharp,
})
