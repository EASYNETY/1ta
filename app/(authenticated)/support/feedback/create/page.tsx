// app/(authenticated)/support/feedback/create/pages.tsx

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { submitFeedback } from '@/features/support/store/supportSlice'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User } from '@/types/user.types'
import { PageHeader } from '@/components/layout/auth/page-header'

export enum FeedbackType {
  General = "general",
  BugReport = "bug_report",
  FeatureRequest = "feature_request",
  CourseFeedback = "course_feedback",
}


const feedbackSchema = z.object({
  rating: z.enum(['1', '2', '3', '4', '5']),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  type: z.nativeEnum(FeedbackType),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

export default function FeedbackCreatePage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('ticketId') // optional for tracking
  const { user } = useAppSelector((state) => state.auth)
  const { id: userId } = user as User

  const { status } = useAppSelector((state) => state.support)

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: '5',
      type: FeedbackType.General,
    },
  })

  const onSubmit = async (data: FeedbackFormValues) => {
    const result = await dispatch(
      submitFeedback({
        rating: parseInt(data.rating),
        comment: data.comment,
        type: data.type,
        userId,
        // ticketId
      })
    )

    if (submitFeedback.fulfilled.match(result)) {
      toast.success('Thanks for your feedback!')
      router.push('/support') // Or ticket detail page
    } else {
      toast.error('Failed to submit feedback.')
    }
  }

  return (
    <div className="mx-auto space-y-6">
      <PageHeader
        heading="Submit Feedback"
        subheading="We value your feedback. Please share your thoughts with us."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                  <SelectItem value="2">⭐⭐ Poor</SelectItem>
                  <SelectItem value="1">⭐ Very Poor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(FeedbackType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Your honest feedback..." rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={status === 'loading'} className="w-full">
          {status === 'loading' ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </form>
    </div>
  )
}
