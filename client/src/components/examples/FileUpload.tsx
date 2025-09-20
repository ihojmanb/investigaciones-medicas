import FileUpload from '../FileUpload'
import { useState } from 'react'

export default function FileUploadExample() {
  const [file, setFile] = useState<string | null>(null)
  
  return (
    <div className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Upload Receipt</h3>
      <FileUpload
        file={file}
        onFileChange={setFile}
        accept=".pdf,.jpg,.jpeg,.png"
        maxSize={10 * 1024 * 1024}
      />
    </div>
  )
}