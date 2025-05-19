// app/(auth)/support/page.tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquare, HelpCircle } from 'lucide-react';

// Form schema
const supportFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

// FAQ data
const faqItems = [
  {
    question: 'How do I enroll in a course?',
    answer: 'You can enroll in a course by navigating to the Courses section, selecting your desired course, and clicking the "Enroll" button. Follow the prompts to complete your enrollment.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including credit/debit cards, bank transfers, and mobile money. All payments are processed securely through our payment gateway.'
  },
  {
    question: 'Can I get a refund if I\'m not satisfied with a course?',
    answer: 'Yes, we offer a 7-day money-back guarantee for most courses. Please contact our support team within 7 days of enrollment if you wish to request a refund.'
  },
  {
    question: 'How do I access my course materials?',
    answer: 'After enrolling, you can access your course materials by logging into your account and navigating to the "My Courses" section. From there, you can view all your enrolled courses and access their content.'
  },
  {
    question: 'Do you offer certificates upon course completion?',
    answer: 'Yes, we provide digital certificates upon successful completion of our courses. These certificates can be downloaded directly from your account and shared on platforms like LinkedIn.'
  },
  {
    question: 'How long do I have access to a course after enrolling?',
    answer: 'Once enrolled, you have lifetime access to the course materials, allowing you to learn at your own pace and revisit content whenever needed.'
  },
];

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof supportFormSchema>>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof supportFormSchema>) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log(values);
      toast.success('Your support request has been submitted. We\'ll get back to you soon!');
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Support Center</h1>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card/5 backdrop-blur-sm border p-6 flex flex-col items-center text-center">
              <Mail className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Send us an email anytime</p>
              <a href="mailto:support@1techacademy.com" className="text-primary hover:underline">
                support@1techacademy.com
              </a>
            </Card>

            <Card className="bg-card/5 backdrop-blur-sm border p-6 flex flex-col items-center text-center">
              <Phone className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Available Mon-Fri, 9am-5pm</p>
              <a href="tel:+2348012345678" className="text-primary hover:underline">
                +234 801 234 5678
              </a>
            </Card>

            <Card className="bg-card/5 backdrop-blur-sm border p-6 flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">Chat with our support team</p>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                Start Chat
              </Button>
            </Card>
          </div>

          <Card className="bg-card/5 backdrop-blur-sm border">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
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

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="What is your inquiry about?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your issue or question in detail"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </Form>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="bg-card/5 backdrop-blur-sm border">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>

              <div className="mt-8 pt-6 border-t">
                <div className="text-center text-muted-foreground">
                  Can't find what you're looking for? <br className="md:hidden" />
                  <Button variant="link" className="p-0 h-auto" onClick={() => document.querySelector('[data-value="contact"]')?.dispatchEvent(new Event('click'))}>
                    Contact our support team
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
