"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { MotionTokens } from "@/lib/motion.tokens"

const demoRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  institution: z.string().min(2, "Institution name must be at least 2 characters"),
})

type DemoRequestFormValues = z.infer<typeof demoRequestSchema>

export function DemoRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoRequestFormValues>({
    resolver: zodResolver(demoRequestSchema),
  })

  const onSubmit = async (data: DemoRequestFormValues) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Demo request submitted:", data)
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: MotionTokens.ease.easeOut,
      },
    },
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: MotionTokens.duration.medium,
          ease: MotionTokens.ease.easeOut,
        }}
        className="py-12 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
        >
          <CheckCircle className="h-8 w-8 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
        <p className="text-muted-foreground mb-6">
          We&apos;ve received your demo request and will be in touch shortly.
        </p>
        <DyraneButton variant="outline" onClick={() => setIsSubmitted(false)}>
          Submit Another Request
        </DyraneButton>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={formVariants}>
      <CardContent className="space-y-4">
        <form id="demo-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </motion.div>

          <motion.div className="space-y-2" variants={itemVariants}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </motion.div>

          <motion.div className="space-y-2" variants={itemVariants}>
            <Label htmlFor="institution">Institution Name</Label>
            <Input
              id="institution"
              placeholder="Westlake University"
              {...register("institution")}
              aria-invalid={errors.institution ? "true" : "false"}
            />
            {errors.institution && <p className="text-sm text-red-500">{errors.institution.message}</p>}
          </motion.div>
        </form>
      </CardContent>
      <CardFooter>
        <motion.div className="w-full" variants={itemVariants}>
          <DyraneButton type="submit" form="demo-form" className="w-full mb-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Request Demo"
            )}
          </DyraneButton>
        </motion.div>
      </CardFooter>
    </motion.div>
  )
}
