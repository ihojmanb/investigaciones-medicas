import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import TrialForm from "@/components/TrialForm"

export default function TrialFormPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link to="/trials">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trials
          </Link>
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Trial</h1>
          <p className="text-gray-600">Add a new clinical trial to the system</p>
        </div>
      </div>
      
      <TrialForm mode="create" />
    </div>
  )
}