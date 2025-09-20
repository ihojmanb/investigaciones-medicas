import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, FileText } from "lucide-react"
import { useRef } from "react"

interface FileUploadProps {
  file: string | null
  onFileChange: (file: string | null) => void
  accept?: string
  maxSize?: number
}

export default function FileUpload({
  file,
  onFileChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        alert(`Archivo demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
        return
      }
      
      // For demo purposes, we'll just store the filename
      // In a real app, this would upload to object storage
      console.log('File uploaded:', selectedFile.name)
      onFileChange(selectedFile.name)
    }
  }

  const handleRemove = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {!file ? (
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Sube 1 archivo: PDF o imagen. Máx {Math.round(maxSize / 1024 / 1024)}MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-add-file"
            >
              <Upload className="h-4 w-4 mr-2" />
              Agregar archivo
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{file}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            data-testid="button-remove-file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}