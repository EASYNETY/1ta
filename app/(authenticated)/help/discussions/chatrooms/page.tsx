'use client'

import React from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Image, 
  Paperclip, 
  Search, 
  Bell, 
  Settings, 
  Shield, 
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
    title: 'Direct Messaging', 
    href: '/help/discussions/messaging',
    description: 'Learn how to send private messages to individuals'
  },
  { 
    title: 'Communication Guidelines', 
    href: '/help/discussions/etiquette',
    description: 'Understand the best practices for online communication'
  },
  { 
    title: 'Notification Preferences', 
    href: '/help/account/notifications',
    description: 'Manage your notification settings for discussions'
  },
];

export default function ChatroomsHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Using Chatrooms"
        icon={MessageSquare}
        description="Learn how to participate in group discussions and collaborate with classmates and instructors."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Discussions', href: '/help/discussions' },
          { label: 'Using Chatrooms' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Chatrooms provide a space for group discussions related to courses, projects, or specific topics.
        They facilitate collaboration, question-asking, and community building among students and instructors.
      </p>

      <HelpCallout type="note" title="Academic Purpose">
        Chatrooms are designed for academic discussions and collaboration. All communications
        should be related to learning objectives and follow the platform's code of conduct.
      </HelpCallout>

      {/* Types of Chatrooms */}
      <h2 id="chatroom-types" className="text-2xl font-bold mt-8">Types of Chatrooms</h2>
      <Separator className="my-2" />
      <p>
        The platform offers several types of chatrooms to support different discussion needs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Course Chatrooms</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            General discussion spaces for all students enrolled in a specific course.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Group Project Rooms</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Private spaces for students working together on group assignments or projects.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Office Hours</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Scheduled chat sessions where instructors are available to answer questions.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Study Groups</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Student-created chatrooms for collaborative studying and peer support.
          </p>
        </div>
      </div>

      {/* Accessing Chatrooms */}
      <h2 id="accessing-chatrooms" className="text-2xl font-bold mt-8">Accessing Chatrooms</h2>
      <Separator className="my-2" />
      <p>
        You can access chatrooms through several paths within the platform.
      </p>

      <StepByStepGuide title="Accessing Chatrooms" description="Follow these steps to find and join chatrooms:">
        <Step number={1} title="Navigate to Discussions">
          Click on "Discussions" in the main sidebar to access the discussions hub.
        </Step>
        <Step number={2} title="Browse Available Chatrooms">
          The discussions page displays all chatrooms you have access to, organized by category.
        </Step>
        <Step number={3} title="Select a Chatroom">
          Click on a chatroom name to enter the discussion space.
        </Step>
        <Step number={4} title="Alternative Access">
          You can also access course-specific chatrooms directly from the course page by clicking on the "Discussions" tab.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="tip" title="Pin Favorite Chatrooms">
        You can pin frequently used chatrooms to the top of your discussions list by clicking the pin icon
        next to the chatroom name. This makes it easier to quickly access important conversations.
      </HelpCallout>

      {/* Participating in Discussions */}
      <h2 id="participating" className="text-2xl font-bold mt-8">Participating in Discussions</h2>
      <Separator className="my-2" />
      <p>
        Once you've joined a chatroom, you can actively participate in the ongoing discussions.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Basic Chatroom Functions
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Sending Messages</strong>
              <p className="text-sm text-muted-foreground">Type your message in the text field at the bottom of the chatroom and press Enter or click the Send button.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Attaching Files</strong>
              <p className="text-sm text-muted-foreground">Click the paperclip icon to attach documents, images, or other files to your message.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Mentioning Users</strong>
              <p className="text-sm text-muted-foreground">Type @ followed by a username to mention someone specifically in your message.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Replying to Messages</strong>
              <p className="text-sm text-muted-foreground">Hover over a message and click the reply icon to create a threaded response to that specific message.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Advanced Features */}
      <h2 id="advanced-features" className="text-2xl font-bold mt-8">Advanced Chatroom Features</h2>
      <Separator className="my-2" />
      <p>
        Chatrooms include several advanced features to enhance collaboration and discussion quality.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Search Messages</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the search function to find specific messages or topics within a chatroom's history.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Notification Settings</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Customize notification preferences for each chatroom to manage alert frequency.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Paperclip className="h-5 w-5 text-primary" />
            <h4 className="font-medium">File Sharing</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Share documents, images, and other files directly in the chatroom for group access.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Screen Sharing</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your screen during live chat sessions to demonstrate concepts or collaborate on work.
          </p>
        </div>
      </div>

      {/* Creating and Managing Chatrooms */}
      <h2 id="creating-managing" className="text-2xl font-bold mt-8">Creating and Managing Chatrooms</h2>
      <Separator className="my-2" />
      <p>
        Depending on your role, you may be able to create new chatrooms or manage existing ones.
      </p>

      <StepByStepGuide title="Creating a New Chatroom" description="Follow these steps to create a new chatroom:">
        <Step number={1} title="Access Discussions">
          Navigate to the Discussions section from the main sidebar.
        </Step>
        <Step number={2} title="Create New">
          Click the "Create New Chatroom" button in the top-right corner.
        </Step>
        <Step number={3} title="Configure Settings">
          Fill in the required information:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Chatroom name</li>
            <li>Description</li>
            <li>Type (course, project, study group)</li>
            <li>Access permissions (who can join)</li>
          </ul>
        </Step>
        <Step number={4} title="Invite Members">
          Add participants by searching for their names or selecting from a list.
        </Step>
        <Step number={5} title="Create">
          Click "Create Chatroom" to finalize and launch the new discussion space.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="note" title="Creation Permissions">
        Students can typically create study group chatrooms, while instructors and administrators
        can create course chatrooms and project rooms. Permission settings may vary based on
        institutional policies.
      </HelpCallout>

      {/* Chatroom Etiquette */}
      <h2 id="etiquette" className="text-2xl font-bold mt-8">Chatroom Etiquette</h2>
      <Separator className="my-2" />
      <p>
        Following proper etiquette ensures that chatrooms remain productive and respectful spaces for everyone.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4">Best Practices for Chatroom Communication</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Stay On Topic</strong>
              <p className="text-sm text-muted-foreground">Keep discussions relevant to the chatroom's purpose and course material.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Be Respectful</strong>
              <p className="text-sm text-muted-foreground">Treat all participants with courtesy and respect, even during disagreements.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Use Clear Communication</strong>
              <p className="text-sm text-muted-foreground">Write concise, clear messages and use proper formatting for readability.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Avoid Spamming</strong>
              <p className="text-sm text-muted-foreground">Don't send multiple short messages in quick succession; consolidate your thoughts.</p>
            </div>
          </li>
        </ul>
      </div>

      <p className="mt-4">
        For more detailed guidelines on communication etiquette, please refer to the 
        <Link href="/help/discussions/etiquette" className="text-primary hover:underline mx-1">
          Communication Guidelines
        </Link>
        help article.
      </p>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, chatrooms can enhance your learning experience:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use course chatrooms to ask questions about lectures, assignments, or course materials</li>
              <li>Create study group chatrooms to collaborate with peers on exam preparation</li>
              <li>Participate in office hours chatrooms to get direct assistance from instructors</li>
              <li>Share relevant resources and insights that might benefit your classmates</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, chatrooms provide valuable channels for student engagement:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create separate chatrooms for different course topics or modules</li>
              <li>Schedule regular office hours chatroom sessions for student questions</li>
              <li>Use announcement features to highlight important information</li>
              <li>Monitor discussions to identify common misconceptions or areas needing clarification</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can configure and oversee chatroom functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set up institution-wide chatroom policies and permissions</li>
              <li>Monitor chatroom activity for compliance with academic conduct standards</li>
              <li>Create department or program-level chatrooms for broader discussions</li>
              <li>Configure moderation tools and reporting mechanisms</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Schedule Notifications",
          href: "/help/timetable/notifications"
        }}
        nextArticle={{
          title: "Direct Messaging",
          href: "/help/discussions/messaging"
        }}
      />
    </article>
  );
}
