import { supabase } from '@/lib/supabaseClient'

export interface UploadResult {
  url: string | null
  error: string | null
}

export const uploadReceiptFile = async (
  file: File, 
  patientCode: string, 
  expenseType: string,
  trialName: string,
  visitName: string
): Promise<UploadResult> => {
  try {
    // Generate consistent filename that will always be the same for this expense type
    // This ensures only one file per expense type per visit
    const fileExtension = file.name.split('.').pop()
    const fileName = `${trialName}/${patientCode}/${visitName}/${expenseType}/receipt.${fileExtension}`

    // First, try to remove any existing files for this expense type
    try {
      const { data: existingFiles } = await supabase.storage
        .from('expenses')
        .list(`${trialName}/${patientCode}/${visitName}/${expenseType}`)
      
      if (existingFiles && existingFiles.length > 0) {
        // Remove all existing files in this path
        const filesToRemove = existingFiles.map(f => `${trialName}/${patientCode}/${visitName}/${expenseType}/${f.name}`)
        await supabase.storage
          .from('expenses')
          .remove(filesToRemove)
      }
    } catch (cleanupError) {
      console.warn('Error cleaning up existing files:', cleanupError)
      // Continue with upload even if cleanup fails
    }

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('expenses')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // This enables overwriting existing files
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