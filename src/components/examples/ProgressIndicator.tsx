import ProgressIndicator from '../ProgressIndicator'

export default function ProgressIndicatorExample() {
  const mandatoryComplete = true
  const optionalSections = [
    { name: "Transporte", complete: true },
    { name: "Pasaje 1", complete: false },
    { name: "Pasaje 2", complete: true },
    { name: "Pasaje 3", complete: false },
    { name: "Pasaje 4", complete: false },
    { name: "Alimentación", complete: false },
    { name: "Alojamiento", complete: true }
  ]
  const totalProgress = 65
  
  return (
    <div className="p-6 max-w-sm mx-auto">
      <ProgressIndicator
        mandatoryComplete={mandatoryComplete}
        optionalSections={optionalSections}
        totalProgress={totalProgress}
      />
    </div>
  )
}