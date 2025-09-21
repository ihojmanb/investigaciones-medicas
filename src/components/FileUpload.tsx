import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { uploadReceiptFile } from "@/utils/fileUpload"
import { toast } from "sonner"

interface FileUploadProps {
  file: string | null
  onFileChange: (file: string | null) => void
  accept?: string
  maxSize?: number
  patientId?: string
  expenseType?: string
  trialName?: string
  visitName?: string
}

export default function FileUpload({
  file,
  onFileChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024,
  patientId,
  expenseType,
  trialName,
  visitName
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [originalFileName, setOriginalFileName] = useState<string | null>(null)

  // Extract filename from URL when component loads with existing file
  useEffect(() => {
    if (file && !originalFileName) {
      // Extract filename from URL path
      try {
        const url = new URL(file)
        const pathParts = url.pathname.split('/')
        const storageFilename = pathParts[pathParts.length - 1]
        
        if (storageFilename) {
          const decodedFilename = decodeURIComponent(storageFilename)
          
          // Check if filename has our new format: originalname_timestamp.ext
          const match = decodedFilename.match(/^(.+)_\d+\.(.+)$/)
          if (match) {
            const [, originalName, extension] = match
            // Convert sanitized name back (replace underscores with spaces for display)
            const displayName = originalName.replace(/_/g, ' ')
            setOriginalFileName(`${displayName}.${extension}`)
          } else {
            // Fallback for old format or unexpected format
            setOriginalFileName(decodedFilename)
          }
        }
      } catch {
        // If URL parsing fails, show generic name
        setOriginalFileName('Archivo existente')
      }
    } else if (!file) {
      setOriginalFileName(null)
    }
  }, [file, originalFileName])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > maxSize) {
      toast.error(`Archivo demasiado grande. Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    if (!patientId || !expenseType) {
      toast.error('Error al subir archivo', { 
        description: 'Información del paciente o tipo de gasto no disponible' 
      })
      return
    }

    if (!trialName || !visitName) {
      toast.error('Error al subir archivo', { 
        description: 'Debe seleccionar un ensayo clínico y una visita antes de subir archivos' 
      })
      return
    }

    // Store original filename for display
    setOriginalFileName(selectedFile.name)
    setIsUploading(true)
    
    try {
      const { url, error } = await uploadReceiptFile(selectedFile, patientId, expenseType, trialName, visitName)
      
      if (error) {
        toast.error('Error al subir archivo', { description: error })
        setOriginalFileName(null)
        return
      }
      
      if (url) {
        onFileChange(url) // Store URL for backend
        toast.success('Archivo subido correctamente')
      }
    } catch (error) {
      toast.error('Error al subir archivo')
      setOriginalFileName(null)
    } finally {
      setIsUploading(false)
    }
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