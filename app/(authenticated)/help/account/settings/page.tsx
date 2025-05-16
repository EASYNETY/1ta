'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Lock, 
  Globe, 
  Bell, 
  Shield, 
  LogOut, 
  Trash2, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
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
    title: 'Updating Your Profile', 
    href: '/help/account/profile',
    description: 'Edit your personal information and profile picture'
  },
  { 
    title: 'Notification Preferences', 
    href: '/help/account/notifications',
    description: 'Customize how you receive alerts and notifications'
  },
  { 
    title: 'Setting Up Your Account', 
    href: '/help/getting-started/account-setup',
    description: 'Learn the basics of account setup and configuration'
  },
];

export default function AccountSettingsHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Account Settings"
        icon={Settings}
        description="Learn how to manage your account preferences, security options, and system settings."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Account Management', href: '/help/account' },
          { label: 'Account Settings' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Account settings allow you to customize your experience on the platform and manage important
        security options. This guide explains how to access and configure various account settings.
      </p>

      <HelpCallout type="note" title="Settings vs. Profile">
        Account settings control system-level preferences and security options, while your profile
        contains personal information that may be visible to others. This guide focuses on account
        settings; for profile information, see the related help article.
      </HelpCallout>

      {/* Accessing Account Settings */}
      <h2 id="accessing-settings" className="text-2xl font-bold mt-8">Accessing Account Settings</h2>
      <Separator className="my-2" />
      <p>
        You can access your account settings through several paths within the platform.
      </p>

      <StepByStepGuide title="Accessing Account Settings" description="Follow these steps to view and edit your account settings:">
        <Step number={1} title="Click Profile Picture">
          Click on your profile picture or avatar in the top-right corner of any page.
        </Step>
        <Step number={2} title="Select Settings">
          From the dropdown menu, select "Settings" or "Account Settings."
        </Step>
        <Step number={3} title="Navigate Settings Categories">
          Use the sidebar or tabs to navigate between different settings categories.
        </Step>
        <Step number={4} title="Alternative Access">
          You can also access specific settings directly from related features (e.g., notification
          settings from a notification).
        </Step>
      </StepByStepGuide>

      {/* Security Settings */}
      <h2 id="security-settings" className="text-2xl font-bold mt-8">Security Settings</h2>
      <Separator className="my-2" />
      <p>
        Security settings help protect your account from unauthorized access.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Key Security Settings
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Password Management</strong>
              <p className="text-sm text-muted-foreground">Change your password and set password requirements.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Two-Factor Authentication (2FA)</strong>
              <p className="text-sm text-muted-foreground">Add an extra layer of security by requiring a second verification method.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Login History</strong>
              <p className="text-sm text-muted-foreground">View recent login attempts and active sessions.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Recovery Options</strong>
              <p className="text-sm text-muted-foreground">Set up backup email, phone number, or recovery codes.</p>
            </div>
          </li>
        </ul>
      </div>

      <StepByStepGuide title="Changing Your Password" description="Follow these steps to update your password:">
        <Step number={1} title="Access Security Settings">
          From Account Settings, select the "Security" tab or section.
        </Step>
        <Step number={2} title="Find Password Options">
          Look for "Password" or "Change Password" option.
        </Step>
        <Step number={3} title="Enter Current Password">
          Enter your current password for verification.
        </Step>
        <Step number={4} title="Create New Password">
          Enter your new password, following the platform's password requirements.
        </Step>
        <Step number={5} title="Confirm New Password">
          Re-enter your new password to confirm it.
        </Step>
        <Step number={6} title="Save Changes">
          Click "Save" or "Update Password" to apply the change.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="important" title="Strong Passwords">
        Create a strong password that includes a mix of uppercase and lowercase letters,
        numbers, and special characters. Avoid using easily guessable information like
        birthdays or common words.
      </HelpCallout>

      <StepByStepGuide title="Setting Up Two-Factor Authentication" description="Follow these steps to enable 2FA:">
        <Step number={1} title="Access Security Settings">
          From Account Settings, select the "Security" tab or section.
        </Step>
        <Step number={2} title="Find 2FA Options">
          Look for "Two-Factor Authentication" or "2FA" settings.
        </Step>
        <Step number={3} title="Choose Method">
          Select your preferred 2FA method:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Authenticator app (recommended)</li>
            <li>SMS text message</li>
            <li>Email</li>
          </ul>
        </Step>
        <Step number={4} title="Follow Setup Instructions">
          Follow the specific instructions for your chosen method:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>For authenticator apps: Scan QR code or enter provided key</li>
            <li>For SMS: Verify your phone number</li>
            <li>For email: Verify your email address</li>
          </ul>
        </Step>
        <Step number={5} title="Enter Verification Code">
          Enter the verification code to confirm setup.
        </Step>
        <Step number={6} title="Save Backup Codes">
          Save the provided backup codes in a secure location.
        </Step>
      </StepByStepGuide>

      {/* Display and Language Settings */}
      <h2 id="display-language" className="text-2xl font-bold mt-8">Display and Language Settings</h2>
      <Separator className="my-2" />
      <p>
        These settings control how the platform appears and what language is used.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Language Preferences</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Select your preferred language for the platform interface and communications.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Theme Settings</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose between light mode, dark mode, or system-based theme.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Time Zone</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Set your time zone to ensure schedules and deadlines appear correctly.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Date and Time Format</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose how dates and times are displayed throughout the platform.
          </p>
        </div>
      </div>

      <StepByStepGuide title="Changing Display Settings" description="Follow these steps to update display preferences:">
        <Step number={1} title="Access Display Settings">
          From Account Settings, select the "Display" or "Preferences" tab.
        </Step>
        <Step number={2} title="Select Language">
          Choose your preferred language from the dropdown menu.
        </Step>
        <Step number={3} title="Choose Theme">
          Select your preferred theme option (Light, Dark, or System).
        </Step>
        <Step number={4} title="Set Time Zone">
          Select your current time zone from the dropdown menu.
        </Step>
        <Step number={5} title="Choose Date/Time Format">
          Select your preferred format for dates and times.
        </Step>
        <Step number={6} title="Save Changes">
          Click "Save" or "Apply" to update your preferences.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Time Zone Importance">
        Setting the correct time zone is crucial for seeing accurate due dates, meeting times,
        and schedule information. This is especially important if you travel frequently or
        participate in courses across different regions.
      </HelpCallout>

      {/* Privacy Settings */}
      <h2 id="privacy-settings" className="text-2xl font-bold mt-8">Privacy Settings</h2>
      <Separator className="my-2" />
      <p>
        Privacy settings control how your data is used and who can see your activity.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Setting</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-left">Recommended</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Activity Status</td>
              <td className="border px-4 py-2">Controls whether others can see when you're online</td>
              <td className="border px-4 py-2">On for course members</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Learning Activity</td>
              <td className="border px-4 py-2">Controls whether your course progress is visible to instructors</td>
              <td className="border px-4 py-2">On</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Search Visibility</td>
              <td className="border px-4 py-2">Controls whether you appear in platform search results</td>
              <td className="border px-4 py-2">On for course members</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Data Usage</td>
              <td className="border px-4 py-2">Controls how your data is used for platform improvements</td>
              <td className="border px-4 py-2">Basic analytics only</td>
            </tr>
          </tbody>
        </table>
      </div>

      <StepByStepGuide title="Adjusting Privacy Settings" description="Follow these steps to update privacy preferences:">
        <Step number={1} title="Access Privacy Settings">
          From Account Settings, select the "Privacy" tab or section.
        </Step>
        <Step number={2} title="Review Current Settings">
          Review your current privacy settings and their implications.
        </Step>
        <Step number={3} title="Adjust Settings">
          Toggle each privacy option according to your preferences.
        </Step>
        <Step number={4} title="Review Data Usage">
          Review and adjust how your data is used for analytics and improvements.
        </Step>
        <Step number={5} title="Save Changes">
          Click "Save" or "Apply" to update your privacy settings.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="note" title="Institutional Policies">
        Some privacy settings may be controlled by your educational institution's policies
        and cannot be changed individually. These settings will typically be marked as
        "Managed by Institution" or similar.
      </HelpCallout>

      {/* Account Management */}
      <h2 id="account-management" className="text-2xl font-bold mt-8">Account Management</h2>
      <Separator className="my-2" />
      <p>
        These settings allow you to manage your account status and data.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <LogOut className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Session Management</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            View and log out of active sessions on different devices.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Connected Applications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage third-party applications that have access to your account.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Data Export</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Request a download of your account data and content.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Account Deactivation</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Temporarily disable or permanently delete your account.
          </p>
        </div>
      </div>

      <StepByStepGuide title="Managing Active Sessions" description="Follow these steps to view and manage your active sessions:">
        <Step number={1} title="Access Security Settings">
          From Account Settings, select the "Security" tab or section.
        </Step>
        <Step number={2} title="Find Session Management">
          Look for "Active Sessions" or "Where You're Logged In" section.
        </Step>
        <Step number={3} title="Review Sessions">
          Review the list of devices and locations where your account is currently active.
        </Step>
        <Step number={4} title="Log Out Sessions">
          Click "Log Out" next to any session you want to terminate, or "Log Out All Other Sessions" to terminate all except your current one.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="warning" title="Account Deactivation">
        Account deactivation or deletion may have significant consequences, including loss of
        access to courses, assignments, and other content. Before proceeding, ensure you have
        downloaded any important data and understand the implications.
      </HelpCallout>

      {/* Troubleshooting */}
      <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting</h2>
      <Separator className="my-2" />
      <p>
        If you encounter issues with your account settings, here are some common problems and solutions.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Issue</th>
              <th className="border px-4 py-2 text-left">Possible Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Settings Not Saving</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Ensure you click the "Save" button after making changes</li>
                  <li>Check your internet connection</li>
                  <li>Try using a different browser</li>
                  <li>Clear your browser cache and try again</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Cannot Access Certain Settings</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Some settings may be restricted based on your user role</li>
                  <li>Institutional policies may limit certain settings</li>
                  <li>Contact support if you believe you should have access</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Two-Factor Authentication Issues</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Ensure your device's time is correctly synchronized</li>
                  <li>Try using backup codes if you can't access your primary method</li>
                  <li>Contact support if you're locked out of your account</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <HelpCallout type="important" title="Support Contact">
        If you continue to experience issues with your account settings, contact platform support
        with specific details about the problem, including any error messages you receive.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, these settings help customize your learning experience:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set your time zone correctly to ensure assignment deadlines appear accurately</li>
              <li>Enable two-factor authentication to protect your academic records</li>
              <li>Adjust notification settings to stay informed about course activities</li>
              <li>Review privacy settings to control what instructors and classmates can see</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, these settings help manage your teaching environment:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configure security settings to protect sensitive student information</li>
              <li>Set appropriate privacy levels for your teaching activities</li>
              <li>Customize display settings for course creation and management</li>
              <li>Manage connected applications that integrate with your courses</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you have additional settings management capabilities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configure institution-wide default settings</li>
              <li>Define which settings users can modify themselves</li>
              <li>Set security policies such as password requirements</li>
              <li>Manage integration settings with other institutional systems</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Updating Your Profile",
          href: "/help/account/profile"
        }}
        nextArticle={{
          title: "Notification Preferences",
          href: "/help/account/notifications"
        }}
      />
    </article>
  );
}
