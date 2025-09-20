import MandatoryFields from '../MandatoryFields'
import { useState } from 'react'

export default function MandatoryFieldsExample() {
  const [patient, setPatient] = useState("Arce Mercado, Julia")
  const [study, setStudy] = useState("MK-053")
  const [visit, setVisit] = useState("d")
  const [visitDate, setVisitDate] = useState<Date | undefined>(new Date("2025-09-25"))
  
  const isComplete = patient && study && visit && visitDate
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <MandatoryFields
        patient={patient}
        study={study}
        visit={visit}
        visitDate={visitDate}
        onPatientChange={setPatient}
        onStudyChange={setStudy}
        onVisitChange={setVisit}
        onVisitDateChange={setVisitDate}
        isComplete={!!isComplete}
      />
    </div>
  )
}