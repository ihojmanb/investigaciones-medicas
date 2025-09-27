import ExpenseForm from "@/components/ExpenseForm"
import PageHeader from "@/components/PageHeader"

export default function ExpenseFormPage() {
  return (
    <div>
      <PageHeader
        title="Submit Expense"
        subtitle="Submit a new patient expense reimbursement form"
      />
      
      <ExpenseForm />
    </div>
  )
}