import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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
  Eye, 
  Receipt,
  User,
  Calendar
} from "lucide-react"
import { usePatients } from "@/hooks/usePatients"
import { useTrials } from "@/hooks/useTrials"
import { getPatientExpenses, PatientExpenseWithDetails } from "@/services/patientExpenseService"
import { format } from "date-fns"

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patients, loading: patientsLoading } = usePatients()
  const { trials } = useTrials()
  const [expenses, setExpenses] = useState<PatientExpenseWithDetails[]>([])
  const [expensesLoading, setExpensesLoading] = useState(true)

  const patient = patients.find(p => p.id === id)

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
              {patient?.name}
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
              {patient?.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">
              Submitted expense reports
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trial</TableHead>
                  <TableHead>Visit</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <Badge variant="secondary">
                        {expense.trial?.name || 'Unknown Trial'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {expense.visit_type}
                    </TableCell>
                    <TableCell>
                      {format(new Date(expense.visit_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getExpenseItemsCount(expense)} items
                    </TableCell>
                    <TableCell>
                      ${getTotalAmount(expense).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Submitted</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/expenses/${expense.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/expenses/${expense.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Expense
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}