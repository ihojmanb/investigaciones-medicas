import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import PatientForm from "@/components/PatientForm"

export default function PatientFormPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Patient</h1>
          <p className="text-gray-600">Add a new patient to the system</p>
        </div>
      </div>
      
      <PatientForm mode="create" />
    </div>
  )
}