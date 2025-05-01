// app/(authentcicated)/admin/pricing/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Check, X, Plus, Edit, Trash2, MoreHorizontal, ArrowLeft } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  selectPricingState,
  fetchPlans,
  createNewPlan,
  updateExistingPlan,
  deleteExistingPlan,
  togglePlanActiveStatus,
  selectPricingLoading,
} from "@/features/pricing/store/pricing-slice"

export default function AdminPricingPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const pricingState = useAppSelector(selectPricingState)
  const isLoading = useAppSelector(selectPricingLoading)
  const [billingType, setBillingType] = useState<"individual" | "corporate">("individual")
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  // Fetch plans on component mount
  useEffect(() => {
    dispatch(fetchPlans())
  }, [dispatch])

  // Check if user is admin
  if (user?.role !== "admin") {
    router.push("/dashboard")
    return null
  }

  const plans = billingType === "individual" ? pricingState.individualPlans : pricingState.corporatePlans

  const handleCreatePlan = () => {
    setEditingPlan({
      name: "",
      price: "",
      priceValue: 0,
      description: "",
      features: [""],
      notIncluded: [""],
      popular: false,
      type: billingType,
      active: true,
    })
    setShowPlanDialog(true)
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlan({ ...plan })
    setShowPlanDialog(true)
  }

  const handleDeletePlan = (planId: string) => {
    setPlanToDelete(planId)
    setShowDeleteDialog(true)
  }

  const handleTogglePlanActive = async (planId: string) => {
    try {
      await dispatch(togglePlanActiveStatus(planId)).unwrap()

      const plan = plans.find((p) => p.id === planId)
      toast({
        title: "Plan Updated",
        description: `Plan has been ${plan?.active ? "deactivated" : "activated"}.`,
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update plan status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddFeature = (type: "features" | "notIncluded") => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        [type]: [...editingPlan[type], ""],
      })
    }
  }

  const handleRemoveFeature = (type: "features" | "notIncluded", index: number) => {
    if (editingPlan) {
      const newFeatures = [...editingPlan[type]]
      newFeatures.splice(index, 1)
      setEditingPlan({
        ...editingPlan,
        [type]: newFeatures,
      })
    }
  }

  const handleFeatureChange = (type: "features" | "notIncluded", index: number, value: string) => {
    if (editingPlan) {
      const newFeatures = [...editingPlan[type]]
      newFeatures[index] = value
      setEditingPlan({
        ...editingPlan,
        [type]: newFeatures,
      })
    }
  }

  const handleSubmitPlan = async () => {
    if (!editingPlan) return

    // Validate form
    if (!editingPlan.name || !editingPlan.price || !editingPlan.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Filter out empty features
    const features = editingPlan.features.filter((f: string) => f.trim() !== "")
    const notIncluded = editingPlan.notIncluded.filter((f: string) => f.trim() !== "")

    try {
      const planData = {
        ...editingPlan,
        features,
        notIncluded,
      }

      if (editingPlan.id) {
        // Update existing plan
        await dispatch(
          updateExistingPlan({
            planId: editingPlan.id,
            planData,
          }),
        ).unwrap()

        toast({
          title: "Plan Updated",
          description: "The plan has been updated successfully.",
          variant: "success",
        })
      } else {
        // Create new plan
        await dispatch(createNewPlan(planData)).unwrap()

        toast({
          title: "Plan Created",
          description: "The new plan has been created successfully.",
          variant: "success",
        })
      }

      setShowPlanDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return

    try {
      await dispatch(deleteExistingPlan(planToDelete)).unwrap()

      toast({
        title: "Plan Deleted",
        description: "The plan has been deleted successfully.",
        variant: "success",
      })

      setShowDeleteDialog(false)
      setPlanToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <DyraneButton variant="outline" size="icon" onClick={() => router.push("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </DyraneButton>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
        </div>
        <DyraneButton onClick={handleCreatePlan} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Plan
        </DyraneButton>
      </div>

      <Tabs
        defaultValue={billingType}
        value={billingType}
        onValueChange={(value) => setBillingType(value as "individual" | "corporate")}
        className="w-full max-w-3xl mx-auto mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Plans</TabsTrigger>
          <TabsTrigger value="corporate">Corporate Plans</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <DyraneCard key={plan.id} className={`${!plan.active ? "opacity-70" : ""}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.popular && <Badge className="bg-primary text-primary-foreground">Popular</Badge>}
                  <Badge
                    variant="outline"
                    className={plan.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}
                  >
                    {plan.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.active}
                    onCheckedChange={() => handleTogglePlanActive(plan.id)}
                    disabled={isLoading}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DyraneButton variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </DyraneButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-muted-foreground mb-2">{plan.description}</p>
                  <div className="text-2xl font-bold">{plan.price}</div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Not Included</h4>
                  <div className="space-y-1">
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <X className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DyraneCard>
        ))}
      </div>

      {/* Plan Edit/Create Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan?.id ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={editingPlan?.name || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Price Display</Label>
                <Input
                  id="price"
                  value={editingPlan?.price || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                  placeholder="e.g. ₦25,000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priceValue">Price Value (in Naira)</Label>
              <Input
                id="priceValue"
                type="number"
                value={editingPlan?.priceValue || ""}
                onChange={(e) =>
                  setEditingPlan({ ...editingPlan, priceValue: Number.parseInt(e.target.value) || null })
                }
                placeholder="e.g. 25000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter 0 for free plans or leave empty for custom pricing
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingPlan?.description || ""}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <DyraneButton type="button" variant="outline" size="sm" onClick={() => handleAddFeature("features")}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </DyraneButton>
              </div>
              {editingPlan?.features?.map((feature: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange("features", index, e.target.value)}
                    placeholder="Feature description"
                  />
                  <DyraneButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature("features", index)}
                  >
                    <X className="h-4 w-4" />
                  </DyraneButton>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Not Included</Label>
                <DyraneButton type="button" variant="outline" size="sm" onClick={() => handleAddFeature("notIncluded")}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </DyraneButton>
              </div>
              {editingPlan?.notIncluded?.map((feature: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange("notIncluded", index, e.target.value)}
                    placeholder="Not included feature"
                  />
                  <DyraneButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature("notIncluded", index)}
                  >
                    <X className="h-4 w-4" />
                  </DyraneButton>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="popular"
                checked={editingPlan?.popular || false}
                onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, popular: checked })}
              />
              <Label htmlFor="popular">Mark as Popular</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={editingPlan?.active || false}
                onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <DyraneButton variant="outline" onClick={() => setShowPlanDialog(false)} disabled={isLoading}>
              Cancel
            </DyraneButton>
            <DyraneButton onClick={handleSubmitPlan} disabled={isLoading}>
              {isLoading ? "Saving..." : editingPlan?.id ? "Update Plan" : "Create Plan"}
            </DyraneButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this plan? This action cannot be undone.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Note: Deleting a plan will not affect existing subscriptions.
            </p>
          </div>
          <DialogFooter>
            <DyraneButton variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isLoading}>
              Cancel
            </DyraneButton>
            <DyraneButton variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Plan"}
            </DyraneButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
