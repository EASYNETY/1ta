'use client'

import React from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  User, 
  Search, 
  Send, 
  Image, 
  Paperclip, 
  Bell, 
  Lock, 
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
    title: 'Using Chatrooms', 
    href: '/help/discussions/chatrooms',
    description: 'Learn how to participate in group discussions'
  },
  { 
    title: 'Communication Guidelines', 
    href: '/help/discussions/etiquette',
    description: 'Understand the best practices for online communication'
  },
  { 
    title: 'Notification Preferences', 
    href: '/help/account/notifications',
    description: 'Manage your notification settings for messages'
  },
];

export default function DirectMessagingHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Direct Messaging"
        icon={MessageCircle}
        description="Learn how to send private messages to instructors, classmates, and other platform users."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Discussions', href: '/help/discussions' },
          { label: 'Direct Messaging' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Direct messaging allows you to have private, one-on-one conversations with other users on the platform.
        This feature is useful for asking personal questions, discussing sensitive topics, or collaborating
        with specific individuals outside of group chatrooms.
      </p>

      <HelpCallout type="note" title="Academic Purpose">
        Like all communication tools on the platform, direct messaging is intended for academic and
        professional purposes. All messages should adhere to the platform's code of conduct.
      </HelpCallout>

      {/* Accessing Direct Messages */}
      <h2 id="accessing-messages" className="text-2xl font-bold mt-8">Accessing Direct Messages</h2>
      <Separator className="my-2" />
      <p>
        You can access your direct messages through several paths within the platform.
      </p>

      <StepByStepGuide title="Accessing Direct Messages" description="Follow these steps to find your direct messages:">
        <Step number={1} title="Navigate to Messages">
          Click on the message icon in the top navigation bar to access your messages dashboard.
        </Step>
        <Step number={2} title="View Conversations">
          The messages dashboard displays all your active conversations, sorted by most recent activity.
        </Step>
        <Step number={3} title="Select a Conversation">
          Click on a conversation to open the message thread and view the full exchange.
        </Step>
        <Step number={4} title="Alternative Access">
          You can also access messages from the Discussions section by clicking on the "Direct Messages" tab.
        </Step>
      </StepByStepGuide>

      {/* Starting a New Conversation */}
      <h2 id="starting-conversation" className="text-2xl font-bold mt-8">Starting a New Conversation</h2>
      <Separator className="my-2" />
      <p>
        You can initiate direct message conversations with other users in several ways.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Methods to Start a Conversation
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>From Messages Dashboard</strong>
              <p className="text-sm text-muted-foreground">Click the "New Message" button in your messages dashboard and search for the recipient.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>From User Profiles</strong>
              <p className="text-sm text-muted-foreground">Visit a user's profile and click the "Message" button to start a conversation.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>From Course Roster</strong>
              <p className="text-sm text-muted-foreground">Access the course roster, find the person you want to message, and click the message icon.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>From Chatrooms</strong>
              <p className="text-sm text-muted-foreground">Click on a user's name in a chatroom and select "Message Privately" from the options.</p>
            </div>
          </li>
        </ul>
      </div>

      <StepByStepGuide title="Starting a New Conversation" description="Follow these steps to start a new direct message:">
        <Step number={1} title="Open Messages">
          Navigate to your messages dashboard by clicking the message icon in the top navigation.
        </Step>
        <Step number={2} title="Create New">
          Click the "New Message" or "+" button to start a new conversation.
        </Step>
        <Step number={3} title="Find Recipient">
          Use the search field to find the person you want to message by typing their name.
        </Step>
        <Step number={4} title="Select Recipient">
          Click on the correct person from the search results to select them as the recipient.
        </Step>
        <Step number={5} title="Compose Message">
          Write your message in the text field and press Enter or click Send to initiate the conversation.
        </Step>
      </StepByStepGuide>

      {/* Sending and Receiving Messages */}
      <h2 id="sending-receiving" className="text-2xl font-bold mt-8">Sending and Receiving Messages</h2>
      <Separator className="my-2" />
      <p>
        Once you've started a conversation, you can exchange messages and use various messaging features.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Text Messages</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Type your message in the text field and press Enter or click the Send button to deliver it.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Paperclip className="h-5 w-5 text-primary" />
            <h4 className="font-medium">File Attachments</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Click the paperclip icon to attach documents, PDFs, or other files to your message.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Images</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Share images by clicking the image icon or pasting directly into the message field.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Notifications</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Receive alerts when you get new messages based on your notification preferences.
          </p>
        </div>
      </div>

      <HelpCallout type="tip" title="Message Status">
        You can see if your message has been delivered and read by looking for the status indicators:
        <ul className="list-disc pl-6 mt-2">
          <li>One checkmark: Message sent</li>
          <li>Two checkmarks: Message delivered</li>
          <li>Blue checkmarks: Message read</li>
        </ul>
      </HelpCallout>

      {/* Managing Conversations */}
      <h2 id="managing-conversations" className="text-2xl font-bold mt-8">Managing Conversations</h2>
      <Separator className="my-2" />
      <p>
        You can organize and manage your direct message conversations to keep your inbox tidy.
      </p>

      <StepByStepGuide title="Managing Your Conversations" description="Here's how to organize your direct messages:">
        <Step number={1} title="Pin Important Conversations">
          Hover over a conversation in your list and click the pin icon to keep it at the top of your inbox.
        </Step>
        <Step number={2} title="Archive Old Conversations">
          To declutter your inbox, archive conversations you no longer need by clicking the archive icon.
        </Step>
        <Step number={3} title="Search Messages">
          Use the search function at the top of your messages dashboard to find specific conversations or message content.
        </Step>
        <Step number={4} title="Mute Notifications">
          If a conversation is very active but not urgent, you can mute notifications by clicking the bell icon.
        </Step>
      </StepByStepGuide>

      {/* Privacy and Security */}
      <h2 id="privacy-security" className="text-2xl font-bold mt-8">Privacy and Security</h2>
      <Separator className="my-2" />
      <p>
        Direct messages are private, but there are important privacy considerations to keep in mind.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Privacy Considerations
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Message Visibility</strong>
              <p className="text-sm text-muted-foreground">Direct messages are visible only to you and the recipient, not to other users or classmates.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Administrative Access</strong>
              <p className="text-sm text-muted-foreground">Platform administrators may have access to message content in cases of reported misconduct.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Message Retention</strong>
              <p className="text-sm text-muted-foreground">Messages are retained according to the platform's data retention policy, even if deleted from your view.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Reporting Inappropriate Messages</strong>
              <p className="text-sm text-muted-foreground">If you receive inappropriate messages, you can report them using the report function.</p>
            </div>
          </li>
        </ul>
      </div>

      <HelpCallout type="important" title="Academic Integrity">
        Remember that direct messages are subject to the same academic integrity standards as
        other communications on the platform. Do not use direct messaging to share answers or
        collaborate inappropriately on individual assignments.
      </HelpCallout>

      {/* Messaging Etiquette */}
      <h2 id="messaging-etiquette" className="text-2xl font-bold mt-8">Messaging Etiquette</h2>
      <Separator className="my-2" />
      <p>
        Following proper etiquette ensures respectful and effective communication.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Respect Boundaries</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Be mindful of when you message others and respect their time and availability.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Clear Communication</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Be concise and clear in your messages, providing context when necessary.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Professional Tone</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Maintain a professional and respectful tone, especially when messaging instructors.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Response Time</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Understand that responses may not be immediate and be patient when waiting for replies.
          </p>
        </div>
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
              As a student, direct messaging can be a valuable tool for your academic journey:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Message instructors with specific questions about assignments or course material</li>
              <li>Connect with classmates to form study groups or discuss course concepts</li>
              <li>Reach out to academic advisors for guidance on your educational path</li>
              <li>Be mindful of instructors' office hours and response time expectations</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, direct messaging allows for personalized student interaction:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide individual feedback to students on their work or participation</li>
              <li>Address sensitive academic concerns privately</li>
              <li>Set clear boundaries about when you'll respond to messages</li>
              <li>Consider using templates for common responses to save time</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you can configure and monitor messaging functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set up messaging policies and guidelines for your institution</li>
              <li>Configure message retention settings and privacy controls</li>
              <li>Establish protocols for handling reported inappropriate messages</li>
              <li>Provide training on effective and appropriate use of direct messaging</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Using Chatrooms",
          href: "/help/discussions/chatrooms"
        }}
        nextArticle={{
          title: "Communication Guidelines",
          href: "/help/discussions/etiquette"
        }}
      />
    </article>
  );
}
