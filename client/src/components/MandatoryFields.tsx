import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

interface MandatoryFieldsProps {
  patient: string
  study: string
  visit: string
  visitDate: Date | undefined
  onPatientChange: (value: string) => void
  onStudyChange: (value: string) => void
  onVisitChange: (value: string) => void
  onVisitDateChange: (date: Date | undefined) => void
  isComplete: boolean
}

export default function MandatoryFields({
  patient,
  study,
  visit,
  visitDate,
  onPatientChange,
  onStudyChange,
  onVisitChange,
  onVisitDateChange,
  isComplete
}: MandatoryFieldsProps) {
  // Mock patient data based on the form images
  const patients = [
    "Arce Mercado, Julia",
    "Rodriguez, Maria",
    "Silva, Carlos",
    "Lopez, Ana"
  ]
  
  const studies = [
    "MK-053",
    "MK-091", 
    "MK-124",
    "MK-098"
  ]

  return (
    <Card className={`${isComplete ? 'border-primary/50 bg-primary/5' : 'border-destructive/30'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Información Obligatoria
          {isComplete && <CheckCircle2 className="h-5 w-5 text-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient" className="text-sm font-medium">
              Paciente *
            </Label>
            <Select value={patient} onValueChange={onPatientChange}>
              <SelectTrigger data-testid="select-patient">
                <SelectValue placeholder="Selecciona un paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="study" className="text-sm font-medium">
              Estudio *
            </Label>
            <Select value={study} onValueChange={onStudyChange}>
              <SelectTrigger data-testid="select-study">
                <SelectValue placeholder="Selecciona un estudio" />
              </SelectTrigger>
              <SelectContent>
                {studies.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="visit" className="text-sm font-medium">
              Visita *
            </Label>
            <Input
              id="visit"
              data-testid="input-visit"
              value={visit}
              onChange={(e) => onVisitChange(e.target.value)}
              placeholder="ej: d"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Fecha de la visita *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-visit-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {visitDate ? format(visitDate, "dd-MM-yyyy") : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={visitDate}
                  onSelect={onVisitDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}