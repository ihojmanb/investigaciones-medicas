import ExpenseForm from '../ExpenseForm'

export default function ExpenseFormExample() {
  const handleSubmit = async (data: any) => {
    console.log('Form submitted:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const handleSave = (data: any) => {
    console.log('Form saved as draft:', data)
  }
  
  // Pre-populate with some demo data
  const initialData = {
    patient: "Arce Mercado, Julia",
    study: "MK-053",
    visit: "d",
    visitDate: new Date("2025-09-25"),
    transportAmount: "45.50"
  }
  
  return (
    <ExpenseForm 
      initialData={initialData}
      onSubmit={handleSubmit}
      onSave={handleSave}
    />
  )
}