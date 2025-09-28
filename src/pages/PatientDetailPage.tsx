import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Receipt,
  User,
  Calendar,
  ExternalLink
} from "lucide-react"
import { usePatients } from "@/hooks/usePatients"
import { getPatientExpenses, PatientExpenseWithDetails } from "@/services/patientExpenseService"
import { format } from "date-fns"
import { formatPatientName } from "@/services/patientService"
import supabase from "@/lib/supabaseClient"

const EXPENSE_TYPE_MAPPING = {
  'transport': 'Transporte',
  'trip1': 'Pasaje 1',
  'trip2': 'Pasaje 2',
  'trip3': 'Pasaje 3',
  'trip4': 'Pasaje 4',
  'food': 'Alimentacion',
  'accommodation': 'Alojamiento'
} as const

const formatChileanPesos = (amount: number): string => {
  return `$${amount.toLocaleString('es-CL')} CLP`
}

const formatDateLocal = (dateString: string): string => {
  const date = new Date(dateString)
  return format(date, 'dd/MM/yyyy HH:mm')
}

const getExpenseTypeLabel = (type: string): string => {
  return EXPENSE_TYPE_MAPPING[type as keyof typeof EXPENSE_TYPE_MAPPING] || type
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patients, loading: patientsLoading } = usePatients()
  const [expenses, setExpenses] = useState<PatientExpenseWithDetails[]>([])
  const [expensesLoading, setExpensesLoading] = useState(true)

  const patient = patients.find(p => p.id === id);

  const handleReceiptClick = async (receipt_url: string) => {
    const { data, error } = await supabase.storage
      .from('expenses')
      .createSignedUrl(receipt_url, 3600)
    if (error) {
      console.error('Error creating signed URL:', error)
      return
    }
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  useEffect(() => {
    if (id) {
      loadExpenses()
    }
  }, [id])

  const loadExpenses = async () => {
    if (!id) return
    
    try {
      setExpensesLoading(true)
      const data = await getPatientExpenses(id)
      setExpenses(data)
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setExpensesLoading(false)
    }
  }

  const getTotalAmount = (expense: PatientExpenseWithDetails) => {
    return expense.expense_items.reduce((total, item) => total + (item.cost || 0), 0)
  }

  const getExpenseItemsCount = (expense: PatientExpenseWithDetails) => {
    return expense.expense_items.length
  }

  const getTotalAmountAllExpenses = () => {
    return expenses.reduce((total, expense) => total + getTotalAmount(expense), 0)
  }

  // Show loading state while patients are loading
  if (patientsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/patients">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading patient details...</p>
        </div>
      </div>
    )
  }

  // Show not found only after loading is complete
  if (!patientsLoading && !patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/patients">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">Patient not found</p>
          <p className="text-sm text-gray-400">The patient you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }
  if (!patient) {
    return <div>Patient not found</div> // or redirect/error handling
  }
  else {



    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/patients">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Patients
              </Link>
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {formatPatientName(patient)}
              </h1>
              <p className="text-gray-600">Patient Code: {patient?.code}</p>
            </div>
          </div>
  
          <Button asChild>
            <Link to="/expenses/new">
              <Plus className="w-4 h-4 mr-2" />
              New Expense
            </Link>
          </Button>
        </div>
  
        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Info</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patient?.code}</div>
              <p className="text-xs text-muted-foreground">
                {formatPatientName(patient)}
              </p>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expenses.length > 0 ? format(new Date(expenses[0].created_at), 'MMM d') : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Last expense submitted
              </p>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${getTotalAmountAllExpenses().toLocaleString('es-CL')}
              </div>
              <p className="text-xs text-muted-foreground">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''} submitted
              </p>
            </CardContent>
          </Card>
        </div>
  
        {/* Expense History */}
        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No expenses submitted yet</p>
                <Button asChild>
                  <Link to="/expenses/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit First Expense
                  </Link>
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full space-y-2">
                {expenses.map((expense) => (
                  <AccordionItem key={expense.id} value={expense.id} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left pr-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <Badge variant="secondary" className="self-start">
                            {expense.trial?.name || 'Unknown Trial'}
                          </Badge>
                          <div className="text-sm font-medium">
                            {expense.visit_type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(expense.visit_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                          <div className="text-sm">
                            {getExpenseItemsCount(expense)} items
                          </div>
                          <div className="text-sm font-medium">
                            {formatChileanPesos(getTotalAmount(expense))}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/expenses/${expense.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Expense
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm text-muted-foreground border-b pb-2">
                          <span>Last Modified: {formatDateLocal(expense.modified_at || expense.created_at)}</span>
                          <Badge variant="outline">Submitted</Badge>
                        </div>
                        {expense.expense_items.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No expense items found
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {expense.expense_items.map((item) => (
                              <Card key={item.id} className="p-4 bg-gray-50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div className="flex flex-col gap-1">
                                    <div className="font-medium text-sm">
                                      {getExpenseTypeLabel(item.type)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Modified: {formatDateLocal(item.modified_at)}
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="font-medium">
                                      {formatChileanPesos(item.cost)}
                                    </div>
                                    {item.receipt_url && (
                                      <Button variant="outline" size="sm"
                                        onClick={() => handleReceiptClick(item.receipt_url!)}
                                      >
            
                                          <ExternalLink className="h-3 w-3" />
                                          ver archivo
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
}