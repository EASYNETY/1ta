// app/(public)/help-support/page.tsx
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
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Mail, Phone, MessageSquare, HelpCircle, BookOpen, GraduationCap, CreditCard, User, AlertCircle, Search, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Form schema
const supportFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

// FAQ categories and data
const faqCategories = [
  { id: 'enrollment', label: 'Enrollment & Access', icon: BookOpen },
  { id: 'courses', label: 'Courses & Content', icon: GraduationCap },
  { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
  { id: 'account', label: 'Account & Profile', icon: User },
  { id: 'technical', label: 'Technical Support', icon: AlertCircle },
];

const faqItemsByCategory = {
  enrollment: [
    {
      question: 'How do I enrol in a course?',
      answer: 'You can enrol in a course by navigating to the Courses section, selecting your desired course, and clicking the "Enrol" button. Follow the prompts to complete your enrollment.'
    },
    {
      question: 'How long do I have access to a course after enrolling?',
      answer: 'Once enrolled, you have lifetime access to the course materials, allowing you to learn at your own pace and revisit content whenever needed.'
    },
    {
      question: 'Can I enrol in multiple courses at once?',
      answer: 'Yes, you can enrol in multiple courses simultaneously. Each course will be accessible from your dashboard after enrollment.'
    },
  ],
  courses: [
    {
      question: 'How do I access my course materials?',
      answer: 'After enrolling, you can access your course materials by logging into your account and navigating to the "My Courses" section. From there, you can view all your enrolled courses and access their content.'
    },
    {
      question: 'Do you offer certificates upon course completion?',
      answer: 'Yes, we provide digital certificates upon successful completion of our courses. These certificates can be downloaded directly from your account and shared on platforms like LinkedIn.'
    },
    {
      question: 'Are there any prerequisites for your courses?',
      answer: 'Prerequisites vary by course. Each course page clearly lists any required prior knowledge or skills. We also offer beginner-friendly courses that assume no prior experience.'
    },
    {
      question: 'Can I download course videos for offline viewing?',
      answer: 'Most course videos are available for offline viewing through our mobile app. This feature allows you to download lessons when connected to Wi-Fi and watch them later without an internet connection.'
    },
  ],
  payments: [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards, bank transfers, and mobile money. All payments are processed securely through our payment gateway.'
    },
    {
      question: 'Can I get a refund if I\'m not satisfied with a course?',
      answer: 'Yes, we offer a 7-day money-back guarantee for most courses. Please contact our support team within 7 days of enrollment if you wish to request a refund.'
    },
    {
      question: 'Do you offer any discounts or promotions?',
      answer: 'Yes, we regularly offer discounts and promotions. Sign up for our newsletter to stay informed about special offers, or check our website for current promotions.'
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No, there are no hidden fees. The price displayed on the course page is the total amount you will pay. Some courses may offer optional add-ons or premium features at additional cost, but these are clearly marked.'
    },
  ],
  account: [
    {
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your email address, and we\'ll send you instructions to reset your password.'
    },
    {
      question: 'Can I change my email address?',
      answer: 'Yes, you can change your email address in your account settings. Navigate to your profile, select "Account Settings," and update your email address. A verification email will be sent to confirm the change.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by logging into your account and navigating to the "Profile" section. From there, you can edit your personal details, profile picture, and other information.'
    },
  ],
  technical: [
    {
      question: 'What are the system requirements for using the platform?',
      answer: 'Our platform works best on modern browsers like Chrome, Firefox, Safari, or Edge. We recommend having a stable internet connection for streaming videos. For mobile access, download our iOS or Android app.'
    },
    {
      question: 'The course videos are not playing. What should I do?',
      answer: 'If videos aren\'t playing, try: 1) Check your internet connection, 2) Clear your browser cache, 3) Try a different browser, 4) Disable any ad-blockers or VPNs, 5) If using the mobile app, ensure it\'s updated to the latest version.'
    },
    {
      question: 'How do I report a technical issue?',
      answer: 'To report a technical issue, contact our support team through the "Contact Support" tab on this page. Please provide details about the issue, including any error messages, the device you\'re using, and steps to reproduce the problem.'
    },
  ],
};

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('enrollment');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter FAQ items based on search query
  const filteredFaqItems = searchQuery.trim() === ''
    ? faqItemsByCategory[selectedCategory as keyof typeof faqItemsByCategory]
    : Object.values(faqItemsByCategory).flat().filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="py-12">
      <div className="flex flex-col items-center mb-6">
        <HelpCircle className="h-8 w-8 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-center">Help & Support Center</h1>
      </div>

      <p className="text-muted-foreground text-center mb-8">
        Find answers to common questions or get in touch with our support team for personalized assistance.
      </p>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DyraneCard className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Category Sidebar */}
              <div className="w-full md:w-64 border-r border-border/50 shrink-0">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Categories</h3>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-2">
                    {faqCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSearchQuery('');
                        }}
                        className={`flex items-center gap-2 w-full p-2 rounded-md text-left transition-colors ${
                          selectedCategory === category.id && searchQuery === ''
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <category.icon className="h-4 w-4" />
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* FAQ Content */}
              <div className="flex-1">
                <ScrollArea className="h-[500px]">
                  <div className="p-6">
                    {searchQuery.trim() !== '' && (
                      <div className="mb-6">
                        <Badge variant="outline" className="mb-2">Search Results</Badge>
                        <h2 className="text-xl font-semibold">
                          {filteredFaqItems.length} {filteredFaqItems.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                        </h2>
                      </div>
                    )}

                    {searchQuery.trim() === '' && (
                      <div className="flex items-center gap-2 mb-6">
                        {(() => {
                          const category = faqCategories.find(c => c.id === selectedCategory);
                          if (category) {
                            const Icon = category.icon;
                            return <Icon className="h-5 w-5 text-primary" />;
                          }
                          return null;
                        })()}
                        <h2 className="text-xl font-semibold">
                          {faqCategories.find(c => c.id === selectedCategory)?.label}
                        </h2>
                      </div>
                    )}

                    {filteredFaqItems.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFaqItems.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground">{item.answer}</p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No results found</h3>
                        <p className="text-muted-foreground mb-4">
                          We couldn't find any FAQs matching your search. Try different keywords or browse by category.
                        </p>
                        <DyraneButton variant="outline" onClick={() => setSearchQuery('')}>
                          Clear Search
                        </DyraneButton>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DyraneCardFooter className="bg-muted/30 border-t p-4">
              <div className="w-full text-center text-muted-foreground">
                Can't find what you're looking for?
                <DyraneButton variant="link" className="p-0 h-auto ml-1" onClick={() => document.querySelector('[data-value="contact"]')?.dispatchEvent(new Event('click'))}>
                  Contact our support team
                </DyraneButton>
              </div>
            </DyraneCardFooter>
          </DyraneCard>
        </TabsContent>

        <TabsContent value="contact" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DyraneCard className="overflow-hidden group border-primary/10 hover:border-primary/30 transition-colors">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 flex flex-col items-center text-center h-full relative">
                <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,rgba(0,0,0,0.6))]" />
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <DyraneCardTitle className="text-lg mb-2">Email Support</DyraneCardTitle>
                <DyraneCardDescription className="mb-4">Send us an email anytime</DyraneCardDescription>
                <DyraneButton variant="outline" asChild className="mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <a href="mailto:support@1techacademy.com">
                    support@1techacademy.com
                  </a>
                </DyraneButton>
              </div>
            </DyraneCard>

            <DyraneCard className="overflow-hidden group border-primary/10 hover:border-primary/30 transition-colors">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 flex flex-col items-center text-center h-full relative">
                <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,rgba(0,0,0,0.6))]" />
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <DyraneCardTitle className="text-lg mb-2">Phone Support</DyraneCardTitle>
                <DyraneCardDescription className="mb-4">Available Mon-Fri, 9am-5pm</DyraneCardDescription>
                <DyraneButton variant="outline" asChild className="mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <a href="tel:+2348012345678">
                    +234 801 234 5678
                  </a>
                </DyraneButton>
              </div>
            </DyraneCard>

            <DyraneCard className="overflow-hidden group border-primary/10 hover:border-primary/30 transition-colors">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 flex flex-col items-center text-center h-full relative">
                <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,rgba(0,0,0,0.6))]" />
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <DyraneCardTitle className="text-lg mb-2">Live Chat</DyraneCardTitle>
                <DyraneCardDescription className="mb-4">Chat with our support team</DyraneCardDescription>
                <DyraneButton className="mt-auto">
                  Start Chat
                </DyraneButton>
              </div>
            </DyraneCard>
          </div>

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

                  <DyraneButton
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        Submit Request
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </DyraneButton>
                </form>
              </Form>
            </DyraneCardContent>
          </DyraneCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
