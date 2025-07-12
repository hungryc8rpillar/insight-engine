import Typesense from 'typesense'
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST!,
      port: parseInt(process.env.TYPESENSE_PORT!),
      protocol: process.env.TYPESENSE_PROTOCOL!,
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY!,
  connectionTimeoutSeconds: 2,
})

// Collection schema for documents
export const documentCollectionSchema = {
  name: 'documents',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'uploadedAt', type: 'int64' },
    { name: 'userId', type: 'string', optional: true },
    { name: 'summary', type: 'string', optional: true },
    { name: 'keywords', type: 'string', optional: true },
  ],
  default_sorting_field: 'uploadedAt',
}

// Initialize collection (run this once)
export async function initializeTypesenseCollection() {
  try {
    await typesenseClient.collections('documents').retrieve()
    console.log('Documents collection already exists')
  } catch (error) {
    console.log('Creating documents collection...')
    await typesenseClient.collections().create(documentCollectionSchema as CollectionCreateSchema)
    console.log('Documents collection created')
  }
}