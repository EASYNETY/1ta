"use client"

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useToast } from '@/components/ui/use-toast'
import { 
  selectWaitlistByClassId, 
  updateWaitlistStatus 
} from '@/features/classes/store/classes-slice'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Bell, CheckCircle } from 'lucide-react'

interface ClassAvailabilityNotificationProps {
  classId: string
  courseId: string
  courseTitle: string
  availableSlots?: number
}

export function ClassAvailabilityNotification({
  classId,
  courseId,
  courseTitle,
  availableSlots = 0
}: ClassAvailabilityNotificationProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifiedEntries, setNotifiedEntries] = useState<string[]>([])
  
  // Get waitlist entries for this class
  const waitlistEntries = useAppSelector(selectWaitlistByClassId(classId))
  const pendingEntries = waitlistEntries.filter(entry => entry.status === 'pending')
  
  // Check if there are available slots and pending waitlist entries
  useEffect(() => {
    if (availableSlots > 0 && pendingEntries.length > 0 && notifiedEntries.length === 0) {
      // Only show notification for entries we haven't notified yet
      const entriesToNotify = pendingEntries.filter(
        entry => !notifiedEntries.includes(entry.id)
      ).slice(0, availableSlots);
      
      if (entriesToNotify.length > 0) {
        setOpen(true);
        
        // Mark these entries as being notified
        entriesToNotify.forEach(entry => {
          dispatch(updateWaitlistStatus({
            waitlistId: entry.id,
            status: 'notified'
          }));
          
          // Add to our local state to prevent duplicate notifications
          setNotifiedEntries(prev => [...prev, entry.id]);
        });
      }
    }
  }, [availableSlots, pendingEntries, dispatch, notifiedEntries]);
  
  // Handle enrollment from waitlist
  const handleEnroll = () => {
    toast({
      title: "Enrollment Started",
      description: `You're being enrolled in ${courseTitle} from the waitlist.`,
      variant: "success"
    });
    
    // In a real implementation, this would call an API to enroll the user
    // For now, we'll just redirect to the class page
    router.push(`/classes/${classId}`);
    setOpen(false);
  };
  
  // If no notification needed, return null
  if (availableSlots === 0 || pendingEntries.length === 0) {
    return null;
  }
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Slot Available!
          </AlertDialogTitle>
          <AlertDialogDescription>
            Good news! A slot has become available in <strong>{courseTitle}</strong>. 
            You were on the waitlist for this class and now have the opportunity to enroll.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Available slots: {availableSlots}</span>
          </div>
          
          <div className="mt-4 text-sm">
            <p>Would you like to enroll now? If you don't enroll within 24 hours, the slot may be offered to someone else on the waitlist.</p>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Remind Me Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleEnroll}>
            Enroll Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
