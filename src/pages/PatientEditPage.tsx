import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import PatientForm from "@/components/PatientForm"
import { getPatientById } from "@/services/patientService"
import { Patient } from "@/types/database"

export default function PatientEditPage() {
  const { id } = useParams<{ id: string }>()
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/patients">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
            <p className="text-gray-600">Modify patient information</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500">Loading patient...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/patients">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
            <p className="text-gray-600">Modify patient information</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-red-500">{error || 'Patient not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link to="/patients">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Link>
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
          <p className="text-gray-600">Modify patient information</p>
        </div>
      </div>
      
      <PatientForm mode="edit" patient={patient} />
    </div>
  )
}