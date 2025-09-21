import { supabase } from '@/lib/supabaseClient'

export interface UploadResult {
  url: string | null
  error: string | null
}

export const uploadReceiptFile = async (
  file: File, 
  patientId: string, 
  expenseType: string,
  trialName: string,
  visitName: string
): Promise<UploadResult> => {
  try {
    // Generate a unique filename with new path structure, preserving original name
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const originalName = file.name.replace(/\.[^/.]+$/, "") // Remove extension
    const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_') // Sanitize for storage
    const fileName = `${trialName}/${patientId}/${visitName}/${expenseType}/${sanitizedOriginalName}_${timestamp}.${fileExtension}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('expenses')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { url: null, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('expenses')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Error uploading file' 
    }
  }
}