import ExpenseSection from '../ExpenseSection'
import { useState } from 'react'

export default function ExpenseSectionExample() {
  const [receipt, setReceipt] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasData = !!(receipt || amount)
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ExpenseSection
        title="Transporte"
        receiptLabel="Recibo Traslado"
        amountLabel="Monto Traslado"
        receipt={receipt}
        amount={amount}
        onReceiptChange={setReceipt}
        onAmountChange={setAmount}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        hasData={hasData}
      />
    </div>
  )
}