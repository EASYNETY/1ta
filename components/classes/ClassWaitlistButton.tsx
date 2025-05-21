"use client"

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { addToWaitlist } from '@/features/classes/store/classes-slice'
import { AlertCircle, Bell, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'

// Form schema for waitlist
const waitlistFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  notifyEmail: z.boolean().default(true),
  notifySMS: z.boolean().default(false),
  agreeToTerms: z.boolean().refine(value => value === true, {
    message: "You must agree to the terms to join the waitlist.",
  }),
})

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>

interface ClassWaitlistButtonProps {
  classId: string
  courseId: string
  courseTitle: string
  maxSlots?: number
  startDate?: string
  endDate?: string
  schedule?: string
  location?: string
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  buttonText?: string
}

export function ClassWaitlistButton({
  classId,
  courseId,
  courseTitle,
  maxSlots,
  startDate,
  endDate,
  schedule,
  location,
  buttonVariant = 'secondary',
  buttonSize = 'default',
  buttonText = 'Join Waitlist'
}: ClassWaitlistButtonProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  
  // Format dates
  const formattedStartDate = startDate ? format(new Date(startDate), 'PPP') : undefined
  const formattedEndDate = endDate ? format(new Date(endDate), 'PPP') : undefined
  
  // Initialize form with user data if available
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      email: user?.email || '',
      phone: user?.phone || '',
      notifyEmail: true,
      notifySMS: false,
      agreeToTerms: false,
    },
  })
  
  // Handle form submission
  const onSubmit = (values: WaitlistFormValues) => {
    dispatch(addToWaitlist({
      classId,
      courseId,
      email: values.email,
      phone: values.phone,
      notifyEmail: values.notifyEmail,
      notifySMS: values.notifySMS,
    }))
    
    toast({
      title: "Added to Waitlist",
      description: `You'll be notified when a slot becomes available in ${courseTitle}.`,
      variant: "success"
    })
    
    setOpen(false)
  }
  
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={buttonVariant}
        size={buttonSize}
      >
        {buttonText}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Waitlist</DialogTitle>
            <DialogDescription>
              Get notified when a slot becomes available in this class.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h3 className="font-medium text-lg">{courseTitle}</h3>
              
              <div className="mt-2 space-y-2 text-sm">
                {schedule && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{schedule}</span>
                  </div>
                )}
                
                {(formattedStartDate || formattedEndDate) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formattedStartDate && formattedEndDate 
                        ? `${formattedStartDate} to ${formattedEndDate}`
                        : formattedStartDate || formattedEndDate
                      }
                    </span>
                  </div>
                )}
                
                {location && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll email you when a slot becomes available.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormDescription>
                        For SMS notifications if you enable them below.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="notifyEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Notify me by email</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notifySMS"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Notify me by SMS</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          I agree to the waitlist terms and conditions
                        </FormLabel>
                        <FormDescription>
                          By joining the waitlist, you agree to be contacted when a slot becomes available.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Bell className="h-4 w-4 mr-2" />
                    Join Waitlist
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
