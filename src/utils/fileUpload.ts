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
      console.log('🧹 Checking for existing files in path:', `${trialName}/${patientCode}/${visitName}/${expenseType}`)
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('expenses')
        .list(`${trialName}/${patientCode}/${visitName}/${expenseType}`)
      
      if (listError) {
        console.warn('Error listing existing files:', listError)
      }
      
      if (existingFiles && existingFiles.length > 0) {
        console.log('🗑️ Found existing files, removing:', existingFiles.map(f => f.name))
        // Remove all existing files in this path
        const filesToRemove = existingFiles.map(f => `${trialName}/${patientCode}/${visitName}/${expenseType}/${f.name}`)
        const { error: removeError } = await supabase.storage
          .from('expenses')
          .remove(filesToRemove)
        
        if (removeError) {
          console.warn('Error removing existing files:', removeError)
        } else {
          console.log('✅ Successfully removed existing files')
        }
      } else {
        console.log('📂 No existing files found')
      }
    } catch (cleanupError) {
      console.warn('Error cleaning up existing files:', cleanupError)
      // Continue with upload even if cleanup fails
    }

    // Upload file to Supabase storage
    console.log('⬆️ Uploading file to path:', fileName)
    const { data, error } = await supabase.storage
      .from('expenses')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // This enables overwriting existing files
      })

    if (error) {
      console.error('❌ Upload failed:', error)
      return { url: null, error: error.message }
    }

    console.log('✅ Upload successful:', data)

    // Get public URL
    console.log('🔗 Getting public URL for path:', data.path)
    const { data: urlData } = supabase.storage
      .from('expenses')
      .getPublicUrl(data.path)

    console.log('🌐 Generated public URL:', urlData.publicUrl)
    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error('💥 Unexpected error during file upload:', error)
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Error uploading file' 
    }
  }
}