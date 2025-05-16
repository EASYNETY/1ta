'use client'

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  User, 
  Settings, 
  Lock, 
  Mail, 
  Image, 
  Bell, 
  Shield, 
  Key, 
  ChevronRight 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  ArticleHeader, 
  ArticleFooter, 
  HelpCallout, 
  RelatedTopics, 
  RoleContent,
  StepByStepGuide,
  Step,
  HelpImage,
  TableOfContents
} from '@/components/help';

// Define related topics for this help article
const relatedTopics = [
  { 
    title: 'Platform Overview', 
    href: '/help/getting-started/overview',
    description: 'Learn about the core features and functionality of the platform'
  },
  { 
    title: 'Navigating the Interface', 
    href: '/help/getting-started/navigation',
    description: 'Understand how to navigate through different sections of the platform'
  },
  { 
    title: 'Updating Your Profile', 
    href: '/help/account/profile',
    description: 'Learn how to update your profile information'
  },
];

export default function AccountSetupHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Setting Up Your Account"
        icon={User}
        description="Complete your profile and configure your account settings to get the most out of the platform."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Getting Started', href: '/help/getting-started' },
          { label: 'Setting Up Your Account' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Setting up your account properly is an important first step in using the 1Tech Academy platform.
        A complete profile helps instructors and peers identify you, while proper account settings ensure
        you receive important notifications and maintain account security.
      </p>

      <HelpCallout type="important" title="Required Information">
        Some profile information is required to fully use the platform. Make sure to complete at least
        your name, contact information, and profile picture.
      </HelpCallout>

      {/* Accessing Your Profile */}
      <h2 id="accessing-profile" className="text-2xl font-bold mt-8">Accessing Your Profile</h2>
      <Separator className="my-2" />
      <p>
        You can access your profile and account settings through the user menu in the top-right corner of the screen.
      </p>

      <StepByStepGuide title="How to Access Your Profile" description="Follow these steps to access your profile settings:">
        <Step number={1} title="Open the User Menu">
          Click on your profile picture or initials in the top-right corner of any page to open the user menu.
        </Step>
        <Step number={2} title="Select Profile">
          Click on "Profile" in the dropdown menu to access your profile page.
        </Step>
        <Step number={3} title="Navigate to Settings">
          From your profile page, you can click on the "Settings" tab to access additional account settings.
        </Step>
      </StepByStepGuide>

      {/* Completing Your Profile */}
      <h2 id="completing-profile" className="text-2xl font-bold mt-8">Completing Your Profile</h2>
      <Separator className="my-2" />
      <p>
        Your profile contains personal information that helps identify you on the platform. It's important
        to keep this information accurate and up-to-date.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Personal Information</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Your name, date of birth, and other identifying information.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Contact Information</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Your email address, phone number, and other contact details.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Profile Picture</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            A photo that represents you on the platform.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Educational Background</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Your educational history and qualifications.
          </p>
        </div>
      </div>

      <HelpCallout type="tip" title="Profile Visibility">
        You can control who sees certain parts of your profile through the privacy settings.
        Consider what information you want to share with instructors versus other students.
      </HelpCallout>

      {/* Account Settings */}
      <h2 id="account-settings" className="text-2xl font-bold mt-8">Account Settings</h2>
      <Separator className="my-2" />
      <p>
        Account settings control how you interact with the platform and manage your security preferences.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Notification Preferences</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Control which notifications you receive and how they're delivered.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Privacy Settings</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage who can see your profile information and activity.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Password & Security</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your password and enable additional security features.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Preferences</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Set your language, timezone, and other display preferences.
          </p>
        </div>
      </div>

      {/* Security Recommendations */}
      <h2 id="security-recommendations" className="text-2xl font-bold mt-8">Security Recommendations</h2>
      <Separator className="my-2" />
      <p>
        Keeping your account secure is important to protect your personal information and academic records.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Best Practices
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Use a strong password</strong>
              <p className="text-sm text-muted-foreground">Create a unique password with a mix of letters, numbers, and symbols.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Enable two-factor authentication</strong>
              <p className="text-sm text-muted-foreground">Add an extra layer of security by requiring a code in addition to your password.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Keep your contact information updated</strong>
              <p className="text-sm text-muted-foreground">Ensure your email and phone number are current for account recovery purposes.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Log out on shared devices</strong>
              <p className="text-sm text-muted-foreground">Always log out when using public or shared computers.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, your profile helps instructors and classmates identify you. Make sure to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload a clear profile picture that shows your face</li>
              <li>Provide accurate contact information for course communications</li>
              <li>Add relevant educational background to help instructors understand your experience level</li>
              <li>Set notification preferences to ensure you don't miss important course announcements</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, your profile establishes your credentials and helps students connect with you.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Include your professional title and qualifications</li>
              <li>Add a detailed bio highlighting your expertise and teaching experience</li>
              <li>Specify your office hours and preferred contact methods</li>
              <li>Configure notification settings to stay informed about student activities and questions</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, your profile should reflect your role in the institution.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clearly indicate your administrative role and responsibilities</li>
              <li>Ensure your contact information is up-to-date for system notifications</li>
              <li>Configure advanced security settings to protect administrative access</li>
              <li>Set up notification preferences for system alerts and user support requests</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter />
    </article>
  );
}
