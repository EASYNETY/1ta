'use client'

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  Image, 
  Edit, 
  Save, 
  Shield, 
  Eye, 
  EyeOff, 
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
    title: 'Account Settings', 
    href: '/help/account/settings',
    description: 'Manage your account preferences and security options'
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

export default function UpdateProfileHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Updating Your Profile"
        icon={User}
        description="Learn how to edit your personal information, update your profile picture, and manage your public profile."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Account Management', href: '/help/account' },
          { label: 'Updating Your Profile' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Your profile contains important information about you that is used throughout the platform.
        Keeping your profile up-to-date ensures that instructors, classmates, and administrators
        can identify and contact you appropriately.
      </p>

      <HelpCallout type="note" title="Profile vs. Account Settings">
        Your profile contains personal information and preferences that may be visible to others,
        while account settings control system-level preferences and security options. This guide
        focuses on profile information; for account settings, see the related help article.
      </HelpCallout>

      {/* Accessing Your Profile */}
      <h2 id="accessing-profile" className="text-2xl font-bold mt-8">Accessing Your Profile</h2>
      <Separator className="my-2" />
      <p>
        You can access your profile through several paths within the platform.
      </p>

      <StepByStepGuide title="Accessing Your Profile" description="Follow these steps to view and edit your profile:">
        <Step number={1} title="Click Profile Picture">
          Click on your profile picture or avatar in the top-right corner of any page.
        </Step>
        <Step number={2} title="Select Profile Option">
          From the dropdown menu, select "Profile" or "View Profile."
        </Step>
        <Step number={3} title="Enter Edit Mode">
          On your profile page, click the "Edit Profile" button to make changes.
        </Step>
        <Step number={4} title="Alternative Access">
          You can also access your profile through Account Settings → Profile.
        </Step>
      </StepByStepGuide>

      {/* Updating Basic Information */}
      <h2 id="basic-information" className="text-2xl font-bold mt-8">Updating Basic Information</h2>
      <Separator className="my-2" />
      <p>
        Your basic profile information includes details that identify you on the platform.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Editable Profile Information
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Full Name</strong>
              <p className="text-sm text-muted-foreground">Your first and last name as displayed throughout the platform.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Display Name/Username</strong>
              <p className="text-sm text-muted-foreground">The name or handle that appears in discussions and comments.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Contact Information</strong>
              <p className="text-sm text-muted-foreground">Email address, phone number, and other contact details.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Bio/About Me</strong>
              <p className="text-sm text-muted-foreground">A brief description about yourself that appears on your profile.</p>
            </div>
          </li>
        </ul>
      </div>

      <StepByStepGuide title="Updating Basic Information" description="Follow these steps to update your profile details:">
        <Step number={1} title="Enter Edit Mode">
          On your profile page, click the "Edit Profile" or pencil icon.
        </Step>
        <Step number={2} title="Update Fields">
          Edit the information in the provided fields:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Full Name</li>
            <li>Display Name</li>
            <li>Email Address (may require verification)</li>
            <li>Phone Number</li>
            <li>Bio/About Me</li>
          </ul>
        </Step>
        <Step number={3} title="Save Changes">
          Click the "Save" or "Update Profile" button to apply your changes.
        </Step>
        <Step number={4} title="Verify Changes">
          Review your profile to ensure all updates appear correctly.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="important" title="Email Changes">
        If you update your email address, you may need to verify the new address before
        the change takes effect. Check your new email inbox for a verification link.
      </HelpCallout>

      {/* Profile Picture */}
      <h2 id="profile-picture" className="text-2xl font-bold mt-8">Updating Your Profile Picture</h2>
      <Separator className="my-2" />
      <p>
        Your profile picture helps others identify you on the platform and personalizes your account.
      </p>

      <StepByStepGuide title="Changing Your Profile Picture" description="Follow these steps to update your profile image:">
        <Step number={1} title="Access Profile">
          Navigate to your profile page as described earlier.
        </Step>
        <Step number={2} title="Select Profile Picture">
          Click on your current profile picture or the camera/edit icon overlaying it.
        </Step>
        <Step number={3} title="Upload New Image">
          Choose one of the following options:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Upload from your device</li>
            <li>Take a photo (if on mobile)</li>
            <li>Select from gallery (if available)</li>
          </ul>
        </Step>
        <Step number={4} title="Crop and Adjust">
          Use the cropping tool to adjust how your image appears.
        </Step>
        <Step number={5} title="Save Changes">
          Click "Save" or "Apply" to update your profile picture.
        </Step>
      </StepByStepGuide>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Recommended</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            <ul className="list-disc pl-4 space-y-1">
              <li>Clear, recognizable face photo</li>
              <li>Square or 1:1 aspect ratio</li>
              <li>At least 400x400 pixels</li>
              <li>Well-lit, professional appearance</li>
            </ul>
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Not Recommended</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            <ul className="list-disc pl-4 space-y-1">
              <li>Group photos or distant shots</li>
              <li>Inappropriate or offensive images</li>
              <li>Very low resolution images</li>
              <li>Images with text or complex graphics</li>
            </ul>
          </p>
        </div>
      </div>

      <HelpCallout type="tip" title="Professional Image">
        Choose a professional-looking profile picture, especially in educational contexts.
        A clear headshot helps instructors and classmates recognize you both online and in person.
      </HelpCallout>

      {/* Privacy Settings */}
      <h2 id="privacy-settings" className="text-2xl font-bold mt-8">Profile Privacy Settings</h2>
      <Separator className="my-2" />
      <p>
        You can control who can see different parts of your profile information.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Profile Element</th>
              <th className="border px-4 py-2 text-left">Privacy Options</th>
              <th className="border px-4 py-2 text-left">Recommended Setting</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Full Name</td>
              <td className="border px-4 py-2">Public, Course Members, Private</td>
              <td className="border px-4 py-2">Course Members</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Profile Picture</td>
              <td className="border px-4 py-2">Public, Course Members, Private</td>
              <td className="border px-4 py-2">Course Members</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Contact Information</td>
              <td className="border px-4 py-2">Public, Course Members, Instructors Only, Private</td>
              <td className="border px-4 py-2">Instructors Only</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Bio/About Me</td>
              <td className="border px-4 py-2">Public, Course Members, Private</td>
              <td className="border px-4 py-2">Course Members</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Enrolled Courses</td>
              <td className="border px-4 py-2">Public, Course Members, Private</td>
              <td className="border px-4 py-2">Course Members</td>
            </tr>
          </tbody>
        </table>
      </div>

      <StepByStepGuide title="Adjusting Privacy Settings" description="Follow these steps to control your profile privacy:">
        <Step number={1} title="Access Profile Settings">
          From your profile page, click "Privacy Settings" or a similar option.
        </Step>
        <Step number={2} title="Review Current Settings">
          Review the current visibility settings for each profile element.
        </Step>
        <Step number={3} title="Adjust Settings">
          For each profile element, select your preferred visibility level:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Public: Visible to anyone on the platform</li>
            <li>Course Members: Visible only to people in your courses</li>
            <li>Instructors Only: Visible only to your instructors</li>
            <li>Private: Visible only to you and administrators</li>
          </ul>
        </Step>
        <Step number={4} title="Save Changes">
          Click "Save" or "Apply" to update your privacy settings.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="note" title="Administrative Access">
        Platform administrators may have access to your profile information regardless of
        privacy settings for administrative and support purposes.
      </HelpCallout>

      {/* Additional Profile Elements */}
      <h2 id="additional-elements" className="text-2xl font-bold mt-8">Additional Profile Elements</h2>
      <Separator className="my-2" />
      <p>
        Depending on your role and institution, your profile may include additional elements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Student-Specific</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            <ul className="list-disc pl-4 space-y-1">
              <li>Student ID number</li>
              <li>Program/Major</li>
              <li>Academic level</li>
              <li>Expected graduation date</li>
            </ul>
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Instructor-Specific</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            <ul className="list-disc pl-4 space-y-1">
              <li>Faculty position/title</li>
              <li>Department</li>
              <li>Office location</li>
              <li>Office hours</li>
            </ul>
          </p>
        </div>
      </div>

      <StepByStepGuide title="Updating Role-Specific Information" description="Follow these steps to update specialized profile elements:">
        <Step number={1} title="Access Profile">
          Navigate to your profile page as described earlier.
        </Step>
        <Step number={2} title="Find Specialized Sections">
          Look for sections specific to your role (Student Information, Faculty Information, etc.).
        </Step>
        <Step number={3} title="Edit Information">
          Click the edit icon or button for the specific section you want to update.
        </Step>
        <Step number={4} title="Complete Fields">
          Fill in or update the specialized fields as needed.
        </Step>
        <Step number={5} title="Save Changes">
          Click "Save" or "Update" to apply your changes.
        </Step>
      </StepByStepGuide>

      {/* Troubleshooting */}
      <h2 id="troubleshooting" className="text-2xl font-bold mt-8">Troubleshooting</h2>
      <Separator className="my-2" />
      <p>
        If you encounter issues when updating your profile, here are some common problems and solutions.
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
              <td className="border px-4 py-2">Changes Not Saving</td>
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
              <td className="border px-4 py-2">Profile Picture Upload Fails</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Verify the image is in a supported format (JPG, PNG, GIF)</li>
                  <li>Check that the file size is under the maximum limit (typically 5MB)</li>
                  <li>Try resizing the image to a smaller dimension</li>
                  <li>Use a different image file</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Cannot Edit Certain Fields</td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Some fields may be locked by administrators</li>
                  <li>Certain information may require administrator approval to change</li>
                  <li>Contact support if you need to update restricted information</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <HelpCallout type="important" title="Support Contact">
        If you continue to experience issues updating your profile, contact platform support
        with specific details about the problem, including any error messages you receive.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, maintaining an accurate profile helps with course interactions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep your contact information current so instructors can reach you</li>
              <li>Update your profile picture so classmates can recognize you in group activities</li>
              <li>Consider adding relevant academic interests to your bio to connect with like-minded peers</li>
              <li>Ensure your student ID and program information are accurate for administrative purposes</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, your profile helps establish your presence with students:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain a professional profile picture that students can easily recognize</li>
              <li>Include your office hours and preferred contact method in your profile</li>
              <li>Add a brief bio highlighting your expertise and teaching philosophy</li>
              <li>Keep your department and position information up to date</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you have additional profile management capabilities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Configure which profile fields are required, optional, or hidden</li>
              <li>Set default privacy levels for different profile elements</li>
              <li>Define role-specific profile fields for students, faculty, and staff</li>
              <li>Establish profile completion requirements for platform access</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Receipts and Invoices",
          href: "/help/payments/receipts"
        }}
        nextArticle={{
          title: "Account Settings",
          href: "/help/account/settings"
        }}
      />
    </article>
  );
}
