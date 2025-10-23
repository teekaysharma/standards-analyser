import { createServiceClient } from './supabase'

const BUCKET_NAME = 'documents'

export async function uploadDocument(file: File, filename: string) {
  const supabase = await createServiceClient()
  
  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename)

    return {
      path: data.path,
      publicUrl,
      size: file.size
    }
  } catch (error) {
    console.error('Document upload error:', error)
    throw error
  }
}

export async function deleteDocument(filename: string) {
  const supabase = await createServiceClient()
  
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Document delete error:', error)
    throw error
  }
}

export async function getDocumentUrl(filename: string) {
  const supabase = await createServiceClient()
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename)

  return data.publicUrl
}