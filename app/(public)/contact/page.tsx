// app/(public)/contact/page.tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  inquiryType: z.string({ required_error: 'Please select an inquiry type.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      inquiryType: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log(values);
      toast.success('Your message has been sent successfully. We\'ll get back to you soon!');
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <div className="py-12">
      <div className="flex flex-col items-center mb-6">
        <Mail className="h-8 w-8 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-center">Contact Us</h1>
      </div>

      <p className="text-muted-foreground text-center mb-8">
        Have questions or want to learn more about our courses? Get in touch with us and our team will respond as soon as possible.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <DyraneCard className="overflow-hidden border-primary/10">
            <div className="relative">
              <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,rgba(0,0,0,0.6))]" />
              <DyraneCardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <DyraneCardTitle>Send us a message</DyraneCardTitle>
                </div>
                <DyraneCardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </DyraneCardDescription>
              </DyraneCardHeader>
            </div>
            <DyraneCardContent className="relative">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inquiry Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an inquiry type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="courses">Course Information</SelectItem>
                              <SelectItem value="enrollment">Enrollment Assistance</SelectItem>
                              <SelectItem value="corporate">Corporate Training</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How can we help you?"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DyraneButton
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        Send Message
                        <Mail className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </DyraneButton>
                </form>
              </Form>
            </DyraneCardContent>
          </DyraneCard>
        </div>

        <div className="space-y-6">
          <DyraneCard className="overflow-hidden border-primary/10">
            <div className="relative">
              <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,rgba(0,0,0,0.6))]" />
              <DyraneCardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <DyraneCardTitle>Contact Information</DyraneCardTitle>
                </div>
              </DyraneCardHeader>
            </div>
            <DyraneCardContent className="relative space-y-6">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Address</p>
                  <p className="text-muted-foreground">17 Aje Street, Sabo Yaba Lagos, Nigeria</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <a href="mailto:info@1techacademy.com" className="text-primary hover:underline">
                    info@1techacademy.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Phone</p>
                  <a href="tel:+2348012345678" className="text-primary hover:underline">
                    +234 801 234 5678
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Business Hours</p>
                  <p className="text-muted-foreground">Monday - Friday: 9am - 5pm</p>
                  <p className="text-muted-foreground">Saturday: 10am - 2pm</p>
                  <p className="text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>
            </DyraneCardContent>
          </DyraneCard>

          <DyraneCard className="overflow-hidden border-primary/10">
            <div className="relative">
              <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,rgba(0,0,0,0.6))]" />
              <DyraneCardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <DyraneCardTitle>Our Location</DyraneCardTitle>
                </div>
              </DyraneCardHeader>
            </div>
            <DyraneCardContent className="relative">
              <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                {/* This would be replaced with an actual map component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Interactive Map</p>
                </div>
              </div>
            </DyraneCardContent>
            <DyraneCardFooter className="relative">
              <DyraneButton className="w-full" asChild>
                <a href="https://maps.google.com/?q=17+Aje+Street+Sabo+Yaba+Lagos+Nigeria" target="_blank" rel="noopener noreferrer">
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </DyraneButton>
            </DyraneCardFooter>
          </DyraneCard>
        </div>
      </div>
    </div>
  );
}
