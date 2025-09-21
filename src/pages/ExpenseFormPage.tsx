import ExpenseForm from "@/components/ExpenseForm"

export default function ExpenseFormPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit Expense</h1>
        <p className="text-gray-600">Submit a new patient expense reimbursement form</p>
      </div>
      
      <ExpenseForm />
    </div>
  )
}