import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Calendar } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/utils/currency"
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
      toast.success('Servicio creado exitosamente')
      setShowServiceForm(false)
      onServicesUpdate()
    } catch (error: any) {
      // Show custom error message if available, otherwise default message
      const errorMessage = error?.message || 'Error al crear el servicio'
      toast.error(errorMessage)
      console.error(error)
    }
  }

  const handleUpdateService = async (data: TrialServiceFormData) => {
    if (!editingService) return

    try {
      await updateTrialService(editingService.id, data)
      toast.success('Servicio actualizado exitosamente')
      setEditingService(null)
      onServicesUpdate()
    } catch (error) {
      toast.error('Error al actualizar el servicio')
      console.error(error)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio? Esto también eliminará todas sus prestaciones.')) {
      return
    }

    try {
      await deleteTrialService(serviceId)
      toast.success('Servicio eliminado exitosamente')
      onServicesUpdate()
    } catch (error) {
      toast.error('Error al eliminar el servicio')
      console.error(error)
    }
  }

  const handleCreateAllocation = async (data: ServiceAllocationFormData) => {
    if (!editingAllocation) return

    try {
      await createServiceAllocation(editingAllocation.serviceId, data)
      toast.success('Prestación creada exitosamente')
      setEditingAllocation(null)
      onServicesUpdate()
    } catch (error) {
      toast.error('Error al crear la prestación')
      console.error(error)
    }
  }

  const handleUpdateAllocation = async (data: ServiceAllocationFormData) => {
    if (!editingAllocation?.allocation) return

    try {
      await updateServiceAllocation(editingAllocation.allocation.id, data)
      toast.success('Prestación actualizada exitosamente')
      setEditingAllocation(null)
      onServicesUpdate()
    } catch (error) {
      toast.error('Error al actualizar la prestación')
      console.error(error)
    }
  }

  const handleDeleteAllocation = async (allocationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta prestación?')) {
      return
    }

    try {
      await deleteServiceAllocation(allocationId)
      toast.success('Prestación eliminada exitosamente')
      onServicesUpdate()
    } catch (error) {
      toast.error('Error al eliminar la prestación')
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
          <CardTitle>Lista de Precios</CardTitle>
          <Button onClick={() => setShowServiceForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Servicio
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
            Aún no se han agregado servicios. Haz clic en "Agregar Servicio" para comenzar.
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const totalAllocated = getTotalAllocated(service.allocations)
              const isExpanded = expandedServices.has(service.id)
              const allocationsCount = service.allocations?.length || 0

              return (
                <Collapsible key={service.id} open={isExpanded} onOpenChange={() => toggleServiceExpansion(service.id)}>
                  <div className="border rounded-lg">
                    <div className="w-full p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleServiceExpansion(service.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-medium break-words">{service.name}</h4>
                              {service.is_visit && (
                                <Badge variant="secondary" className="text-xs self-start">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Visita {service.visit_order}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <Badge variant="outline" className="text-xs self-start">
                                {formatCurrency(service.amount, service.currency)} {service.currency}
                              </Badge>
                              <Badge variant={totalAllocated === service.amount ? "default" : "secondary"} className="text-xs self-start">
                                Asignado: {formatCurrency(totalAllocated, service.currency)} {service.currency}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                ({allocationsCount} prestaciones)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => setEditingService(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t">
                        {/* Only show allocations for visit services */}
                        {service.is_visit ? (
                          <div className="mt-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <h5 className="font-medium text-sm">Prestaciones del Servicio</h5>
                              {(() => {
                                const existingTypes = service.allocations?.map(a => a.allocation_type) || []
                                const canAddPI = !existingTypes.includes('principal_investigator')
                                const canAddSubI = true // Always can add Sub-Investigators
                                const canAddAny = canAddPI || canAddSubI
                                
                                return canAddAny && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingAllocation({ serviceId: service.id })}
                                    className="self-start sm:self-auto"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Prestación
                                  </Button>
                                )
                              })()}
                            </div>

                          {editingAllocation?.serviceId === service.id && !editingAllocation.allocation && (
                            <ServiceAllocationForm
                              maxAmount={service.amount - totalAllocated}
                              currency={service.currency}
                              existingAllocations={service.allocations || []}
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
                                      existingAllocations={service.allocations?.filter(a => a.id !== allocation.id) || []}
                                      onSubmit={handleUpdateAllocation}
                                      onCancel={() => setEditingAllocation(null)}
                                    />
                                  ) : (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="font-medium break-words">{allocation.name}</span>
                                        <Badge variant="secondary" className="text-xs self-start">
                                          {allocation.allocation_type === 'principal_investigator' ? 'Investigador Principal' : 'Sub-Investigador'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs self-start">
                                          {formatCurrency(allocation.amount, allocation.currency)} {allocation.currency}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-1 self-start sm:self-auto">
                                        <button
                                          type="button"
                                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                          onClick={() => setEditingAllocation({
                                            serviceId: service.id,
                                            allocation
                                          })}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                          onClick={() => handleDeleteAllocation(allocation.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              Aún no se han agregado prestaciones
                            </div>
                          )}
                          </div>
                        ) : (
                          <div className="mt-4 text-center py-4 text-gray-500 text-sm">
                            Las prestaciones solo están disponibles para servicios de visita
                          </div>
                        )}
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