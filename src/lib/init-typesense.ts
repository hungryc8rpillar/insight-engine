import { typesenseClient, documentCollectionSchema } from './typesense'
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

export async function initializeTypesenseCollection() {
  try {
    // Check if collection exists
    const existingCollection = await typesenseClient.collections('documents').retrieve()
    console.log('Documents collection exists:', existingCollection.name)
    
    // Check if we need to update the schema
    const currentFields = existingCollection.fields
    const requiredFields = ['summary', 'keywords']
    const missingFields = requiredFields.filter(field => 
      !currentFields.some((f: any) => f.name === field)
    )
    
    if (missingFields.length > 0) {
      console.log('Missing fields in collection:', missingFields)
      console.log('Please recreate the collection manually or add the missing fields')
      console.log('You can delete the collection and restart the app to recreate it')
      return false
    }
    
    console.log('Typesense collection is properly configured')
    return true
    
  } catch (error: any) {
    if (error.httpStatus === 404) {
      // Collection doesn't exist, create it
      console.log('Creating documents collection...')
      try {
        await typesenseClient.collections().create(documentCollectionSchema as CollectionCreateSchema)
        console.log('Documents collection created successfully')
        return true
      } catch (createError) {
        console.error('Failed to create collection:', createError)
        return false
      }
    } else {
      console.error('Error checking collection:', error)
      return false
    }
  }
}

// Function to recreate collection (use with caution)
export async function recreateTypesenseCollection() {
  try {
    // Delete existing collection
    try {
      await typesenseClient.collections('documents').delete()
      console.log('Deleted existing documents collection')
    } catch (error: any) {
      if (error.httpStatus !== 404) {
        console.error('Error deleting collection:', error)
        return false
      }
    }
    
    // Create new collection
    await typesenseClient.collections().create(documentCollectionSchema as CollectionCreateSchema)
    console.log('Created new documents collection with updated schema')
    return true
    
  } catch (error) {
    console.error('Failed to recreate collection:', error)
    return false
  }
} 