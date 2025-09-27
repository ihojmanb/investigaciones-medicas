import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { usePatients } from "@/hooks/usePatients"
import { useTrials } from "@/hooks/useTrials"
import { getEligibleVisitsForPatient, EligibleVisit } from "@/services/visitService"
import { formatPatientName } from "@/services/patientService"
import { useEffect, useState } from "react"

interface MandatoryFieldsProps {
  patient: string
  trial: string
  visit: string
  visitDate: Date | undefined
  onPatientChange: (value: string) => void
  onTrialChange: (value: string) => void
  onVisitChange: (value: string) => void
  onVisitDateChange: (date: Date | undefined) => void
  isComplete: boolean
  mode?: 'create' | 'edit'
}

export default function MandatoryFields({
  patient,
  trial,
  visit,
  visitDate,
  onPatientChange,
  onTrialChange,
  onVisitChange,
  onVisitDateChange,
  isComplete,
  mode = 'create'
}: MandatoryFieldsProps) {
  const { patients, loading: patientsLoading } = usePatients()
  const { trials, loading: trialsLoading } = useTrials()
  const [eligibleVisits, setEligibleVisits] = useState<EligibleVisit[]>([])
  const [visitsLoading, setVisitsLoading] = useState(false)

  // Load eligible visits when patient and trial are selected
  useEffect(() => {
    if (patient && trial) {
      setVisitsLoading(true)
      getEligibleVisitsForPatient(patient, trial)
        .then(setEligibleVisits)
        .catch(error => {
          console.error('Error loading eligible visits:', error)
          setEligibleVisits([])
        })
        .finally(() => setVisitsLoading(false))
    } else {
      setEligibleVisits([])
      onVisitChange('') // Clear visit when patient/trial changes
    }
  }, [patient, trial, onVisitChange])

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
            <Select value={patient} onValueChange={onPatientChange} disabled={patientsLoading}>
              <SelectTrigger data-testid="select-patient">
                <SelectValue placeholder={patientsLoading ? "Cargando..." : "Selecciona un paciente"} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.code} - {formatPatientName(p)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trial" className="text-sm font-medium">
              Ensayo Clínico *
            </Label>
            <Select value={trial} onValueChange={onTrialChange} disabled={trialsLoading}>
              <SelectTrigger data-testid="select-trial">
                <SelectValue placeholder={trialsLoading ? "Cargando..." : "Selecciona un ensayo"} />
              </SelectTrigger>
              <SelectContent>
                {trials.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name} - {t.sponsor}</SelectItem>
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
            <Select 
              value={visit} 
              onValueChange={onVisitChange} 
              disabled={visitsLoading || !patient || !trial}
            >
              <SelectTrigger data-testid="select-visit">
                <SelectValue placeholder={
                  visitsLoading ? "Cargando visitas..." : 
                  !patient || !trial ? "Selecciona paciente y ensayo primero" :
                  eligibleVisits.length === 0 ? "No hay visitas disponibles" :
                  "Selecciona una visita"
                } />
              </SelectTrigger>
              <SelectContent>
                {eligibleVisits
                  .filter(v => mode === 'edit' ? v.is_completed : true)
                  .map((v) => (
                    <SelectItem 
                      key={v.id} 
                      value={v.name}
                      disabled={mode === 'create' && v.is_completed}
                    >
                      {v.name} {v.is_completed ? "(Completada)" : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
                  disabled={(date) => date > new Date()}
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