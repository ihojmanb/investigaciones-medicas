import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import ExpenseForm from "@/components/ExpenseForm"
import { getExpenseForEdit, updateExpense, ExpenseFormDataForEdit } from "@/services/patientExpenseService"
import PageHeader from "@/components/PageHeader"

interface ExpenseEditPageProps {}

export default function ExpenseEditPage({}: ExpenseEditPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [initialData, setInitialData] = useState<ExpenseFormDataForEdit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadExpenseData()
    }
  }, [id])

  const loadExpenseData = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const data = await getExpenseForEdit(id)
      setInitialData(data)
    } catch (error) {
      console.error('Error loading expense:', error)
      toast.error('Error loading expense data')
      navigate('/patients')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSuccess = () => {
    toast.success('Expense updated successfully')
    // Navigate back to patient detail page
    if (initialData?.patient) {
      navigate(`/patients/${initialData.patient}`)
    } else {
      navigate('/patients')
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Edit Expense"
          subtitle="Modify existing expense submission"
          backButton={{
            label: "Back to Patients",
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => navigate("/patients")
          }}
        />
        
        <div className="text-center py-12">
          <p className="text-gray-500">Loading expense data...</p>
        </div>
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Expense"
          subtitle="Modify existing expense submission"
          backButton={{
            label: "Back to Patients",
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => navigate("/patients")
          }}
        />
        
        <div className="text-center py-12">
          <p className="text-gray-500">Expense not found</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Edit Expense"
        subtitle="Modify existing expense submission"
        backButton={{
          label: "Back to Patient",
          icon: <ArrowLeft className="w-4 h-4" />,
          onClick: () => navigate(`/patients/${initialData.patient}`)
        }}
      />
      
      <ExpenseForm
        mode="edit"
        expenseId={id}
        initialData={initialData}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  )
}