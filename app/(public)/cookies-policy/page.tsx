// app/(public)/cookies-policy/page.tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription } from '@/components/dyrane-ui/dyrane-card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Cookie, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function CookiesPolicyPage() {
  return (
    <div className="py-12">
      <div className="flex flex-col items-center mb-6">
        <Cookie className="h-8 w-8 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-center">Cookies Policy</h1>
      </div>

      <p className="text-muted-foreground text-center mb-8">
        This Cookies Policy explains how 1Tech Academy uses cookies and similar technologies to recognize you when you visit our website. Last updated: June 15, 2024.
      </p>

      <div className='w-full bg-card/5 backdrop-blur-sm rounded-xl border'>
        <Tabs defaultValue="overview" className="w-full">
          <div className="p-4 border-b">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className={cn(
                // Mobile first (scrollable)
                "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
                "gap-1", // Add gap between items for scrolling
                // SM breakpoint and up (grid)
                "sm:grid sm:w-full sm:grid-cols-4 sm:justify-center sm:gap-2"
              )}>
                <TabsTrigger value="overview" className="sm:flex-1">Overview</TabsTrigger>
                <TabsTrigger value="types" className="sm:flex-1">Cookie Types</TabsTrigger>
                <TabsTrigger value="usage" className="sm:flex-1">How We Use Cookies</TabsTrigger>
                <TabsTrigger value="control" className="sm:flex-1">Your Choices</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-2 sm:hidden" />
            </ScrollArea>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Cookies Policy Overview</h2>
                <p className="mb-4">
                  This Cookies Policy explains what cookies are and how we use them on our website. It also explains how you can control and manage cookies.
                </p>
                <p className="mb-4">
                  By using our website, you consent to the use of cookies in accordance with this Cookies Policy. If you do not agree with our use of cookies, you should set your browser settings accordingly or not use our website.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">What Are Cookies?</h3>
                <p className="mb-4 text-muted-foreground">
                  Cookies are small text files that are placed on your computer, smartphone, or other device when you access the internet. They allow websites to recognize your device and remember if you've been to the website before.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Cookies are widely used to make websites work more efficiently, provide a better user experience, and to provide information to the owners of the website.
                </p>

                <h3 className="text-lg font-medium mb-3">How Long Do Cookies Last?</h3>
                <p className="mb-4 text-muted-foreground">
                  Cookies can remain on your device for different periods of time:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Session cookies</strong> exist only while your browser is open and are deleted automatically once you close your browser.</li>
                  <li><strong>Persistent cookies</strong> survive after your browser is closed and can remain on your device for a defined period of time. They can be used by the website to recognize your device when you open your browser and browse the internet again.</li>
                </ul>
              </TabsContent>

              <TabsContent value="types" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Types of Cookies We Use</h2>

                <h3 className="text-lg font-medium mb-3">Essential Cookies</h3>
                <p className="mb-4 text-muted-foreground">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You may disable these by changing your browser settings, but this may affect how the website functions.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Examples of essential cookies we use:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Authentication cookies to remember your login status</li>
                  <li>Security cookies to prevent fraud and protect our platform</li>
                  <li>Session cookies to maintain your session while using our services</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Performance Cookies</h3>
                <p className="mb-4 text-muted-foreground">
                  These cookies collect information about how visitors use our website, such as which pages visitors go to most often and if they receive error messages. These cookies don't collect information that identifies a visitor. All information these cookies collect is aggregated and therefore anonymous.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Examples of performance cookies we use:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Analytics cookies to understand how users interact with our website</li>
                  <li>Load balancing cookies to ensure the website performs optimally</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Functionality Cookies</h3>
                <p className="mb-4 text-muted-foreground">
                  These cookies allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features. They may also be used to provide services you have asked for.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Examples of functionality cookies we use:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                  <li>Preference cookies to remember your settings and preferences</li>
                  <li>Language cookies to remember your language preference</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">Targeting/Advertising Cookies</h3>
                <p className="mb-4 text-muted-foreground">
                  These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement as well as help measure the effectiveness of an advertising campaign.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Examples of targeting/advertising cookies we use:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Retargeting cookies to show you relevant advertisements based on your browsing history</li>
                  <li>Social media cookies to enable sharing functionality</li>
                </ul>
              </TabsContent>

              <TabsContent value="usage" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">How We Use Cookies</h2>

                <p className="mb-6 text-muted-foreground">
                  We use cookies for various purposes, including:
                </p>

                <h3 className="text-lg font-medium mb-3">Authentication and Security</h3>
                <p className="mb-4 text-muted-foreground">
                  We use cookies to identify you when you visit our website and as you navigate our website, and to help us secure our platform by preventing fraudulent use of accounts and protecting user data from unauthorized parties.
                </p>

                <h3 className="text-lg font-medium mb-3">Personalization</h3>
                <p className="mb-4 text-muted-foreground">
                  We use cookies to store information about your preferences and to personalize our website for you, including remembering your preferred language, course progress, and customizing your experience.
                </p>

                <h3 className="text-lg font-medium mb-3">Analytics and Performance</h3>
                <p className="mb-4 text-muted-foreground">
                  We use cookies to analyze how visitors use our website, to monitor website performance, and to improve our website's performance, features, and user experience. This includes collecting information about which pages are most frequently visited and how users interact with our content.
                </p>

                <h3 className="text-lg font-medium mb-3">Advertising and Marketing</h3>
                <p className="mb-4 text-muted-foreground">
                  We use cookies to deliver advertisements that may be relevant to you and your interests, to measure the effectiveness of our advertising campaigns, and to limit the number of times you see an advertisement.
                </p>

                <h3 className="text-lg font-medium mb-3">Third-Party Cookies</h3>
                <p className="mb-4 text-muted-foreground">
                  Some cookies are placed by third parties on our website. These third parties may include analytics providers, advertising networks, and social media platforms. These third parties may use cookies, web beacons, and similar technologies to collect information about your use of our website and other websites.
                </p>
                <p className="text-muted-foreground">
                  We do not control these third parties or their use of cookies. Please refer to the privacy policies of these third parties for more information about how they use cookies.
                </p>
              </TabsContent>

              <TabsContent value="control" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Managing Your Cookie Preferences</h2>

                <p className="mb-6 text-muted-foreground">
                  You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences in the following ways:
                </p>

                <h3 className="text-lg font-medium mb-3">Browser Settings</h3>
                <p className="mb-4 text-muted-foreground">
                  Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. The following links provide information on how to manage cookies in the most common browsers:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <DyraneButton variant="outline" asChild className="justify-between">
                    <Link href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                      Google Chrome
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </DyraneButton>
                  <DyraneButton variant="outline" asChild className="justify-between">
                    <Link href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
                      Mozilla Firefox
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </DyraneButton>
                  <DyraneButton variant="outline" asChild className="justify-between">
                    <Link href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">
                      Safari
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </DyraneButton>
                  <DyraneButton variant="outline" asChild className="justify-between">
                    <Link href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">
                      Microsoft Edge
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </DyraneButton>
                </div>

                <h3 className="text-lg font-medium mb-3">Cookie Consent Tool</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Cookie Preferences</h4>
                      <p className="text-sm text-muted-foreground">
                        When you first visit our website, you will be presented with a cookie banner that allows you to accept or decline non-essential cookies. You can change your preferences at any time by clicking the "Cookie Preferences" link in the footer of our website.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-3">Consequences of Disabling Cookies</h3>
                <p className="mb-4 text-muted-foreground">
                  If you choose to disable cookies, please note that some parts of our website may not function properly. For example, you may not be able to log in to your account, use certain features, or access secure areas of the website.
                </p>

                <Separator className="my-6" />

                <p className="text-sm text-muted-foreground mb-6">
                  If you have any questions about our use of cookies, please contact us at privacy@1techacademy.com.
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    <strong>Contact:</strong> privacy@1techacademy.com
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <DyraneButton variant="outline" size="sm" asChild>
                      <Link href="/privacy-policy">
                        Privacy Policy
                      </Link>
                    </DyraneButton>
                    <DyraneButton variant="outline" size="sm" asChild>
                      <Link href="/terms-conditions">
                        Terms & Conditions
                      </Link>
                    </DyraneButton>
                    <DyraneButton variant="outline" size="sm" asChild>
                      <Link href="/data-protection-policy">
                        Data Protection
                      </Link>
                    </DyraneButton>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
