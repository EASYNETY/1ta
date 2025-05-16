'use client'

import React from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Shield, 
  Users, 
  Clock, 
  ThumbsUp, 
  AlertTriangle, 
  Flag, 
  BookOpen, 
  Check, 
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
    title: 'Direct Messaging', 
    href: '/help/discussions/messaging',
    description: 'Send private messages to individuals'
  },
  { 
    title: 'Account Settings', 
    href: '/help/account/settings',
    description: 'Manage your account preferences and privacy settings'
  },
];

export default function CommunicationGuidelinesHelpPage() {
  return (
    <article className="mx-auto space-y-6">
      <ArticleHeader
        title="Communication Guidelines"
        icon={Shield}
        description="Learn about best practices and expectations for respectful and effective communication on the platform."
        breadcrumbs={[
          { label: 'Help Center', href: '/help' },
          { label: 'Discussions', href: '/help/discussions' },
          { label: 'Communication Guidelines' },
        ]}
      />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <p className="text-lg">
        Effective communication is essential for a productive learning environment. These guidelines
        help ensure that all platform interactions remain respectful, constructive, and aligned with
        academic goals.
      </p>

      <HelpCallout type="important" title="Community Standards">
        All communication on the platform must adhere to the institution's code of conduct and
        academic integrity policies. Violations may result in disciplinary action.
      </HelpCallout>

      {/* General Principles */}
      <h2 id="general-principles" className="text-2xl font-bold mt-8">General Principles</h2>
      <Separator className="my-2" />
      <p>
        These core principles apply to all forms of communication on the platform, including chatrooms,
        direct messages, discussion boards, and comments.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Respect</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Treat all community members with courtesy and respect, regardless of differences in opinion or background.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Academic Focus</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Keep communications relevant to academic purposes and learning objectives.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Clarity</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Communicate clearly and concisely, organizing thoughts before posting.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Inclusivity</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Use inclusive language that welcomes and respects all community members.
          </p>
        </div>
      </div>

      {/* Chatroom Etiquette */}
      <h2 id="chatroom-etiquette" className="text-2xl font-bold mt-8">Chatroom Etiquette</h2>
      <Separator className="my-2" />
      <p>
        Chatrooms are collaborative spaces where multiple users interact simultaneously. Following these
        guidelines helps maintain productive group discussions.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Chatroom Best Practices
        </h3>
        <ul className="space-y-3">
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
              <strong>Be Concise</strong>
              <p className="text-sm text-muted-foreground">Write clear, focused messages rather than long paragraphs that are difficult to follow.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Avoid Spamming</strong>
              <p className="text-sm text-muted-foreground">Don't send multiple short messages in quick succession; consolidate your thoughts.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Use Threads</strong>
              <p className="text-sm text-muted-foreground">For related follow-up discussions, use the reply feature to create threaded conversations.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Direct Messaging Guidelines */}
      <h2 id="direct-messaging" className="text-2xl font-bold mt-8">Direct Messaging Guidelines</h2>
      <Separator className="my-2" />
      <p>
        Direct messages allow for private communication between individuals. These guidelines help ensure
        that one-on-one interactions remain appropriate and respectful.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Respect Time Boundaries</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Be mindful of when you message others and don't expect immediate responses outside of business hours.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Maintain Professionalism</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Keep communications professional, especially when messaging instructors or administrators.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Academic Purpose</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Use direct messages for legitimate academic purposes, not for personal matters unrelated to courses.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Clear Context</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Provide sufficient context when initiating a conversation, especially with instructors.
          </p>
        </div>
      </div>

      <HelpCallout type="note" title="Instructor Communication">
        When messaging instructors, include your name, course, and section number in your initial
        message to help them identify you quickly. Be specific about your question or concern.
      </HelpCallout>

      {/* Academic Integrity in Communications */}
      <h2 id="academic-integrity" className="text-2xl font-bold mt-8">Academic Integrity in Communications</h2>
      <Separator className="my-2" />
      <p>
        All platform communications must adhere to academic integrity standards. Understanding what is
        and isn't appropriate collaboration is essential.
      </p>

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border px-4 py-2 text-left">Appropriate</th>
              <th className="border px-4 py-2 text-left">Inappropriate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Discussing general concepts and ideas</li>
                  <li>Asking clarifying questions about assignments</li>
                  <li>Sharing resources with proper citation</li>
                  <li>Collaborating on designated group projects</li>
                </ul>
              </td>
              <td className="border px-4 py-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Sharing answers to individual assignments</li>
                  <li>Asking others to complete your work</li>
                  <li>Sharing exam content or questions</li>
                  <li>Misrepresenting others' work as your own</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <HelpCallout type="warning" title="Consequences">
        Violations of academic integrity in communications may result in disciplinary action,
        including course failure or more severe institutional penalties.
      </HelpCallout>

      {/* Constructive Communication */}
      <h2 id="constructive-communication" className="text-2xl font-bold mt-8">Constructive Communication</h2>
      <Separator className="my-2" />
      <p>
        Constructive communication fosters a positive learning environment and meaningful discussions.
      </p>

      <div className="bg-muted/30 p-6 rounded-lg mt-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <ThumbsUp className="h-5 w-5 text-primary" />
          Tips for Constructive Communication
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <strong>Focus on Ideas, Not People</strong>
              <p className="text-sm text-muted-foreground">Critique ideas rather than individuals when disagreeing with a perspective.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <strong>Ask Questions</strong>
              <p className="text-sm text-muted-foreground">Use questions to clarify understanding rather than making assumptions.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <strong>Provide Evidence</strong>
              <p className="text-sm text-muted-foreground">Support your points with evidence, examples, or references when appropriate.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <strong>Be Open to Different Perspectives</strong>
              <p className="text-sm text-muted-foreground">Approach discussions with a willingness to consider alternative viewpoints.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Reporting Inappropriate Communication */}
      <h2 id="reporting" className="text-2xl font-bold mt-8">Reporting Inappropriate Communication</h2>
      <Separator className="my-2" />
      <p>
        If you encounter communication that violates platform guidelines or makes you uncomfortable,
        you can report it for review.
      </p>

      <StepByStepGuide title="Reporting Inappropriate Messages" description="Follow these steps to report problematic communications:">
        <Step number={1} title="Identify the Violation">
          Determine which guideline or policy has been violated in the communication.
        </Step>
        <Step number={2} title="Access Reporting Tools">
          For messages: Click the three dots menu next to the message and select "Report".<br />
          For chatrooms: Click the settings icon in the chatroom and select "Report Issue".
        </Step>
        <Step number={3} title="Select Reason">
          Choose the appropriate category for the report from the dropdown menu.
        </Step>
        <Step number={4} title="Provide Details">
          Add any relevant context or details about the violation in the description field.
        </Step>
        <Step number={5} title="Submit Report">
          Click "Submit Report" to send the information to platform administrators for review.
        </Step>
      </StepByStepGuide>

      <HelpCallout type="note" title="Confidentiality">
        Reports are handled confidentially, and your identity will not be disclosed to the
        reported user. You may be contacted for additional information if needed.
      </HelpCallout>

      {/* Role-specific content */}
      <RoleContent
        studentContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Students</h3>
            <p>
              As a student, effective communication skills are essential for your academic success:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use proper grammar and spelling in academic communications</li>
              <li>Be specific when asking questions to get more helpful responses</li>
              <li>Respect instructors' communication preferences and office hours</li>
              <li>Contribute meaningfully to group discussions rather than just posting for participation credit</li>
            </ul>
          </div>
        }
        teacherContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Teachers</h3>
            <p>
              As a teacher, you set the tone for communication in your courses:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clearly communicate your expectations for student interactions at the beginning of the course</li>
              <li>Model respectful and constructive communication in your own messages</li>
              <li>Provide timely feedback on inappropriate communications</li>
              <li>Establish and communicate your response time expectations for messages</li>
            </ul>
          </div>
        }
        adminContent={
          <div className="space-y-4">
            <h3 className="text-lg font-medium">For Administrators</h3>
            <p>
              As an administrator, you help establish and enforce communication standards:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Develop clear institutional communication policies</li>
              <li>Provide training on effective digital communication for faculty and students</li>
              <li>Establish fair and consistent procedures for handling communication violations</li>
              <li>Regularly review and update communication guidelines based on emerging needs</li>
            </ul>
          </div>
        }
      />

      {/* Related Topics */}
      <RelatedTopics topics={relatedTopics} />

      {/* Article Footer with feedback */}
      <ArticleFooter 
        previousArticle={{
          title: "Direct Messaging",
          href: "/help/discussions/messaging"
        }}
        nextArticle={{
          title: "Payment Methods",
          href: "/help/payments/methods"
        }}
      />
    </article>
  );
}
