import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { uploadReceiptFile } from "@/utils/fileUpload"
import { toast } from "sonner"

interface FileUploadProps {
  file: File | string | null // Can be File object or URL string
  onFileChange: (file: File | string | null) => void
  accept?: string
  maxSize?: number
  patientCode?: string
  expenseType?: string
  trialName?: string
  visitName?: string
}

export default function FileUpload({
  file,
  onFileChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024,
  patientCode,
  expenseType,
  trialName,
  visitName
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [originalFileName, setOriginalFileName] = useState<string | null>(null)

  // Handle filename display for both File objects and URL strings
  useEffect(() => {
    if (!file) {
      setOriginalFileName(null)
      return
    }

    if (file instanceof File) {
      // File object - use original name
      setOriginalFileName(file.name)
    } else if (typeof file === 'string' && !originalFileName) {
      // URL string - extract filename from URL path
      try {
        const url = new URL(file)
        const pathParts = url.pathname.split('/')
        const storageFilename = pathParts[pathParts.length - 1]
        
        if (storageFilename) {
          const decodedFilename = decodeURIComponent(storageFilename)
          // For new format without timestamp: originalname.ext
          setOriginalFileName(decodedFilename)
        }
      } catch {
        // If URL parsing fails, show generic name
        setOriginalFileName('Archivo existente')
      }
    }
  }, [file, originalFileName])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > maxSize) {
      toast.error(`Archivo demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    // Store File object directly - upload will happen on form submission
    onFileChange(selectedFile)
    toast.success('Archivo seleccionado', {
      description: 'Se subirá cuando envíes el formulario'
    })
  }

  const handleRemove = () => {
    onFileChange(null)
    setOriginalFileName(null)
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
              disabled={isUploading}
              data-testid="button-add-file"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Subiendo...' : 'Agregar archivo'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{originalFileName || 'Archivo subido'}</span>
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