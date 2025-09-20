import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle } from "lucide-react"

interface ProgressIndicatorProps {
  mandatoryComplete: boolean
  optionalSections: {
    name: string
    complete: boolean
  }[]
  totalProgress: number
}

export default function ProgressIndicator({
  mandatoryComplete,
  optionalSections,
  totalProgress
}: ProgressIndicatorProps) {
  const completedOptional = optionalSections.filter(section => section.complete).length
  
  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Progreso del formulario</h3>
          <span className="text-sm text-muted-foreground">
            {Math.round(totalProgress)}% completado
          </span>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {mandatoryComplete ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={mandatoryComplete ? 'text-primary font-medium' : 'text-foreground'}>
            Campos obligatorios
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{completedOptional} de {optionalSections.length} secciones opcionales completadas</span>
        </div>
      </div>
    </div>
  )
}