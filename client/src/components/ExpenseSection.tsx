import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, Plus, Upload, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import FileUpload from "@/components/FileUpload"

interface ExpenseSectionProps {
  title: string
  receiptLabel: string
  amountLabel: string
  receipt: string | null
  amount: string
  onReceiptChange: (receipt: string | null) => void
  onAmountChange: (amount: string) => void
  isExpanded: boolean
  onToggle: () => void
  hasData: boolean
}

export default function ExpenseSection({
  title,
  receiptLabel,
  amountLabel,
  receipt,
  amount,
  onReceiptChange,
  onAmountChange,
  isExpanded,
  onToggle,
  hasData
}: ExpenseSectionProps) {
  const handleQuickAdd = () => {
    console.log(`Quick add triggered for ${title}`)
    if (!isExpanded) {
      onToggle()
    }
  }

  return (
    <Card className={`transition-all duration-200 ${
      hasData ? 'border-primary/50 bg-primary/5' : 'border-border'
    }`}>
      <CardHeader 
        className="cursor-pointer hover-elevate" 
        onClick={onToggle}
        data-testid={`section-header-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {title}
            {hasData && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isExpanded && !hasData && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuickAdd()
                }}
                data-testid={`button-quick-add-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            )}
            {hasData && !isExpanded && (
              <div className="text-sm text-muted-foreground">
                {amount && `$${amount}`}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{receiptLabel}</Label>
            <FileUpload
              file={receipt}
              onFileChange={onReceiptChange}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`amount-${title}`} className="text-sm font-medium">
              {amountLabel}
            </Label>
            <Input
              id={`amount-${title}`}
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="Sin puntos ni comas"
              data-testid={`input-amount-${title.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}