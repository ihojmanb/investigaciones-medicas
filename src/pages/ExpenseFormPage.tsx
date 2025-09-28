import ExpenseForm from "@/components/ExpenseForm"
import PageHeader from "@/components/PageHeader"

export default function ExpenseFormPage() {
  return (
    <div className="relative">
      <div className="sticky top-0 z-40 bg-gray-50">
        <div className="">
          <PageHeader
            title="Reembolso de Transporte"
            subtitle="Completa los campos obligatorios y agrega las secciones opcionales según sea necesario."
          />
        </div>
      </div>
      
      <ExpenseForm />
    </div>
  )
}