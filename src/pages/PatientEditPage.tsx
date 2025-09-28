import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import PatientForm from "@/components/PatientForm"
import { getPatientById } from "@/services/patientService"
import { Patient } from "@/types/database"
import PageHeader from "@/components/PageHeader"

export default function PatientEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const patientData = await getPatientById(id)
        setPatient(patientData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching patient')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Paciente"
          subtitle="Modificar información del paciente"
          backButton={{
            label: "Volver a Pacientes",
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => navigate("/patients")
          }}
        />
        
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando datos del paciente...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Paciente"
          subtitle="Modificar información del paciente"
          backButton={{
            label: "Volver a Pacientes",
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => navigate("/patients")
          }}
        />
        
        <div className="text-center py-12">
          <p className="text-red-500">{error || 'Paciente no encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Editar Paciente"
        subtitle="Modificar información del paciente"
        backButton={{
          label: "Volver a Pacientes",
          icon: <ArrowLeft className="w-4 h-4" />,
          onClick: () => navigate("/patients")
        }}
      />
      
      <PatientForm mode="edit" patient={patient} />
    </div>
  )
}