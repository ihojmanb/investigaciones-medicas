import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { TrialService, ServiceAllocation } from "@/types/database"
import { 
  createTrialService, 
  updateTrialService, 
  deleteTrialService,
  createServiceAllocation,
  updateServiceAllocation,
  deleteServiceAllocation,
  TrialServiceFormData,
  ServiceAllocationFormData
} from "@/services/trialService"
import ServiceForm from "./ServiceForm"
import ServiceAllocationForm from "./ServiceAllocationForm"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface FeeScheduleSectionProps {
  trialId: string
  services: (TrialService & { allocations?: ServiceAllocation[] })[]
  onServicesUpdate: () => void
}

export default function FeeScheduleSection({ trialId, services, onServicesUpdate }: FeeScheduleSectionProps) {
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState<TrialService | null>(null)
  const [editingAllocation, setEditingAllocation] = useState<{
    serviceId: string
    allocation?: ServiceAllocation
  } | null>(null)
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

  const toggleServiceExpansion = (serviceId: string) => {
    const newExpanded = new Set(expandedServices)
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId)
    } else {
      newExpanded.add(serviceId)
    }
    setExpandedServices(newExpanded)
  }

  const handleCreateService = async (data: TrialServiceFormData) => {
    try {
      await createTrialService(trialId, data)
      toast.success('Service created successfully')
      setShowServiceForm(false)
      onServicesUpdate()
    } catch (error) {
      toast.error('Error creating service')
      console.error(error)
    }
  }

  const handleUpdateService = async (data: TrialServiceFormData) => {
    if (!editingService) return
    
    try {
      await updateTrialService(editingService.id, data)
      toast.success('Service updated successfully')
      setEditingService(null)
      onServicesUpdate()
    } catch (error) {
      toast.error('Error updating service')
      console.error(error)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This will also delete all its allocations.')) {
      return
    }

    try {
      await deleteTrialService(serviceId)
      toast.success('Service deleted successfully')
      onServicesUpdate()
    } catch (error) {
      toast.error('Error deleting service')
      console.error(error)
    }
  }

  const handleCreateAllocation = async (data: ServiceAllocationFormData) => {
    if (!editingAllocation) return

    try {
      await createServiceAllocation(editingAllocation.serviceId, data)
      toast.success('Allocation created successfully')
      setEditingAllocation(null)
      onServicesUpdate()
    } catch (error) {
      toast.error('Error creating allocation')
      console.error(error)
    }
  }

  const handleUpdateAllocation = async (data: ServiceAllocationFormData) => {
    if (!editingAllocation?.allocation) return

    try {
      await updateServiceAllocation(editingAllocation.allocation.id, data)
      toast.success('Allocation updated successfully')
      setEditingAllocation(null)
      onServicesUpdate()
    } catch (error) {
      toast.error('Error updating allocation')
      console.error(error)
    }
  }

  const handleDeleteAllocation = async (allocationId: string) => {
    if (!confirm('Are you sure you want to delete this allocation?')) {
      return
    }

    try {
      await deleteServiceAllocation(allocationId)
      toast.success('Allocation deleted successfully')
      onServicesUpdate()
    } catch (error) {
      toast.error('Error deleting allocation')
      console.error(error)
    }
  }

  const getTotalAllocated = (serviceAllocations: ServiceAllocation[] = []) => {
    return serviceAllocations.reduce((sum, allocation) => sum + allocation.amount, 0)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fee Schedule</CardTitle>
          <Button onClick={() => setShowServiceForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showServiceForm && (
          <ServiceForm
            onSubmit={handleCreateService}
            onCancel={() => setShowServiceForm(false)}
          />
        )}

        {editingService && (
          <ServiceForm
            service={editingService}
            onSubmit={handleUpdateService}
            onCancel={() => setEditingService(null)}
          />
        )}

        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No services added yet. Click "Add Service" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const totalAllocated = getTotalAllocated(service.allocations)
              const isExpanded = expandedServices.has(service.id)
              const allocationsCount = service.allocations?.length || 0

              return (
                <Collapsible key={service.id}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger
                      onClick={() => toggleServiceExpansion(service.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className="text-left">
                          <h4 className="font-medium">{service.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {service.amount} {service.currency}
                            </Badge>
                            <Badge variant={totalAllocated === service.amount ? "default" : "secondary"}>
                              Allocated: {totalAllocated} {service.currency}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              ({allocationsCount}/2 allocations)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t">
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">Service Allocations</h5>
                            {allocationsCount < 2 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingAllocation({ serviceId: service.id })}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Allocation
                              </Button>
                            )}
                          </div>

                          {editingAllocation?.serviceId === service.id && !editingAllocation.allocation && (
                            <ServiceAllocationForm
                              maxAmount={service.amount - totalAllocated}
                              currency={service.currency}
                              onSubmit={handleCreateAllocation}
                              onCancel={() => setEditingAllocation(null)}
                            />
                          )}

                          {service.allocations && service.allocations.length > 0 ? (
                            <div className="space-y-2">
                              {service.allocations.map((allocation) => (
                                <div key={allocation.id}>
                                  {editingAllocation?.allocation?.id === allocation.id ? (
                                    <ServiceAllocationForm
                                      allocation={allocation}
                                      maxAmount={service.amount - totalAllocated + allocation.amount}
                                      currency={service.currency}
                                      onSubmit={handleUpdateAllocation}
                                      onCancel={() => setEditingAllocation(null)}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <span className="font-medium">{allocation.name}</span>
                                        <Badge variant="outline" className="ml-2">
                                          {allocation.amount} {allocation.currency}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setEditingAllocation({ 
                                            serviceId: service.id, 
                                            allocation 
                                          })}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteAllocation(allocation.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No allocations added yet
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}