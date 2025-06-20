"use client"

import React from 'react'
import { SearchResult } from '../types/search-types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  BookOpen, User, FileText, GraduationCap, Calendar, CreditCard,
  ExternalLink, Eye, Edit, Download, Clock, CheckCircle, Play,
  MessageSquare, BarChart, Share2, CircleHelp
} from 'lucide-react'
import { HelpSearchResultCard } from './HelpSearchResultCard'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SearchResultCardProps {
  result: SearchResult
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const router = useRouter();

  // For help results, use the specialized help card
  if (result.type === 'help') {
    return <HelpSearchResultCard result={result} />;
  }

  // Handle click on the card (main action)
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(result.href);
  };

  // Get primary and secondary actions based on result type
  const { primaryAction, secondaryActions } = getResultActions(result);

  return (
    <Card className="overflow-hidden transition-colors hover:bg-muted/50">
      <div className="cursor-pointer" onClick={handleCardClick}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {result.image ? (
                <div className="h-10 w-10 rounded-md overflow-hidden">
                  <Image
                    src={result.image}
                    alt={result.title}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="p-1 rounded-md bg-primary/10">
                  {getResultIcon(result.type)}
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{result.title}</CardTitle>
                {result.metadata?.instructor && (
                  <p className="text-xs text-muted-foreground">
                    Instructor: {result.metadata.instructor}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize",
                  result.status ? getStatusColor(result.status) : ""
                )}
              >
                {result.type}
                {result.status && ` • ${result.status}`}
              </Badge>

              {result.category && (
                <Badge variant="outline" className="text-xs">
                  {result.category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">{result.description}</CardDescription>

          {/* Additional metadata based on type */}
          {result.type === 'class' && (
            <div className="mt-2 text-xs text-muted-foreground">
              {result.metadata?.schedule && <div>Schedule: {result.metadata.schedule}</div>}
              {result.metadata?.location && <div>Location: {result.metadata.location}</div>}
              {result.metadata?.teacherName && <div>Instructor: {result.metadata.teacherName}</div>}
              {result.metadata?.availableSlots !== undefined && (
                <div className="mt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Available Slots</span>
                    <span>{result.metadata.availableSlots} / {result.metadata.maxSlots}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{
                        width: `${result.metadata.maxSlots ?
                          (result.metadata.availableSlots / result.metadata.maxSlots) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {result.type === 'course' && result.metadata?.progress !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{result.metadata.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${result.metadata.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {result.type === 'assignment' && result.metadata?.pointsPossible && (
            <div className="mt-2 text-xs text-muted-foreground">
              Points: {result.metadata.pointsPossible} • Course: {result.metadata.courseTitle}
            </div>
          )}

          {result.type === 'grade' && result.metadata?.score !== undefined && (
            <div className="mt-2 text-xs text-muted-foreground">
              Score: {result.metadata.score}% • Course: {result.metadata.courseName}
            </div>
          )}

          {result.type === 'payment' && result.metadata?.amount && (
            <div className="mt-2 text-xs text-muted-foreground">
              Amount: ₦{(result.metadata.amount).toLocaleString()} •
              Provider: {result.metadata.provider}
            </div>
          )}

          {result.type === 'event' && result.metadata?.location && (
            <div className="mt-2 text-xs text-muted-foreground">
              Location: {result.metadata.location} •
              {result.metadata.courseTitle && `Course: ${result.metadata.courseTitle}`}
            </div>
          )}
        </CardContent>
        {result.date && (
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(result.date), { addSuffix: true })}
          </CardFooter>
        )}
      </div>

      {/* Action buttons */}
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(result.href);
            }}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            View
          </Button>

          {primaryAction && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.action();
              }}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
        </div>

        {secondaryActions && secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {secondaryActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  )
}

function getResultIcon(type: string) {
  switch (type) {
    case 'course':
      return <BookOpen className="h-4 w-4" />
    case 'class':
      return <Clock className="h-4 w-4" />
    case 'user':
      return <User className="h-4 w-4" />
    case 'assignment':
      return <FileText className="h-4 w-4" />
    case 'grade':
      return <GraduationCap className="h-4 w-4" />
    case 'event':
      return <Calendar className="h-4 w-4" />
    case 'payment':
      return <CreditCard className="h-4 w-4" />
    case 'help':
      return <CircleHelp className="h-4 w-4" />
    default:
      return null
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'succeeded':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'refunded':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'enroled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'not_enroled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    // Class-specific statuses
    case 'open':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'closed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'upcoming':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

// Get actions for each result type
function getResultActions(result: SearchResult) {
  const router = useRouter();

  // Default actions
  let primaryAction = null;
  let secondaryActions: any[] = [];

  switch (result.type) {
    case 'class':
      // Primary action for class
      const isEnrolable = result.status === 'open';
      primaryAction = {
        label: isEnrolable ? 'Enrol' : 'View Details',
        icon: isEnrolable
          ? <CheckCircle className="h-3.5 w-3.5 mr-1" />
          : <Eye className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          router.push(`/classes/${result.id}`);
        }
      };

      // Secondary actions for class
      secondaryActions = [
        {
          label: 'View Schedule',
          icon: <Calendar className="h-4 w-4" />,
          action: () => {
            router.push(`/timetable?classId=${result.id}`);
          }
        },
        {
          label: 'View Course',
          icon: <BookOpen className="h-4 w-4" />,
          action: () => {
            router.push(`/courses/${result.metadata?.courseId}`);
          }
        }
      ];

      // Add join meeting action if available
      if (result.metadata?.meetingLink) {
        secondaryActions.push({
          label: 'Join Meeting',
          icon: <Play className="h-4 w-4" />,
          action: () => {
            window.open(result.metadata.meetingLink, '_blank');
          }
        });
      }
      break;

    case 'course':
      // Primary action for course
      primaryAction = {
        label: 'Continue',
        icon: <Play className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          router.push(`/courses/${result.id}/learn`);
        }
      };

      // Secondary actions for course
      secondaryActions = [
        {
          label: 'View Syllabus',
          icon: <FileText className="h-4 w-4" />,
          action: () => {
            router.push(`/courses/${result.id}/syllabus`);
          }
        },
        {
          label: 'Discussion Forum',
          icon: <MessageSquare className="h-4 w-4" />,
          action: () => {
            router.push(`/courses/${result.id}/discussions`);
          }
        },
        {
          label: 'View Grades',
          icon: <BarChart className="h-4 w-4" />,
          action: () => {
            router.push(`/courses/${result.id}/grades`);
          }
        }
      ];
      break;

    case 'assignment':
      // Primary action for assignment
      primaryAction = {
        label: result.status === 'pending' ? 'Submit' : 'View Submission',
        icon: result.status === 'pending'
          ? <Edit className="h-3.5 w-3.5 mr-1" />
          : <Eye className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          router.push(`/assignments/${result.id}`);
        }
      };

      // Secondary actions for assignment
      secondaryActions = [
        {
          label: 'Download Instructions',
          icon: <Download className="h-4 w-4" />,
          action: () => {
            router.push(`/assignments/${result.id}/download`);
          }
        },
        {
          label: 'View Course',
          icon: <BookOpen className="h-4 w-4" />,
          action: () => {
            router.push(`/courses/${result.metadata?.courseId}`);
          }
        }
      ];
      break;

    case 'grade':
      // Primary action for grade
      primaryAction = {
        label: 'View Details',
        icon: <BarChart className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          router.push(`/grades/${result.id}`);
        }
      };

      // Secondary actions for grade
      secondaryActions = [
        {
          label: 'View Course',
          icon: <BookOpen className="h-4 w-4" />,
          action: () => {
            router.push(`/courses/${result.metadata?.courseId}`);
          }
        }
      ];
      break;

    case 'event':
      // Primary action for event
      primaryAction = {
        label: 'Add to Calendar',
        icon: <Calendar className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          // Logic to add to calendar
          alert('Added to calendar');
        }
      };

      // Secondary actions for event
      secondaryActions = [
        {
          label: 'Join Meeting',
          icon: <Play className="h-4 w-4" />,
          action: () => {
            if (result.metadata?.meetingLink) {
              window.open(result.metadata.meetingLink, '_blank');
            }
          }
        },
        {
          label: 'Set Reminder',
          icon: <Clock className="h-4 w-4" />,
          action: () => {
            // Logic to set reminder
            alert('Reminder set');
          }
        }
      ];
      break;

    case 'payment':
      // Primary action for payment
      primaryAction = {
        label: 'Receipt',
        icon: <Download className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          router.push(`/payments/${result.id}/receipt`);
        }
      };

      // Secondary actions for payment
      secondaryActions = [
        {
          label: 'View Transaction',
          icon: <CreditCard className="h-4 w-4" />,
          action: () => {
            router.push(`/payments/${result.id}`);
          }
        }
      ];
      break;

    case 'help':
      // Primary action for help content
      primaryAction = {
        label: 'View Help Article',
        icon: <CircleHelp className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          router.push(result.href);
        }
      };

      // Secondary actions for help
      secondaryActions = [
        {
          label: 'Related Topics',
          icon: <BookOpen className="h-4 w-4" />,
          action: () => {
            router.push(`/help`);
          }
        }
      ];
      break;

    default:
      // Default primary action
      primaryAction = {
        label: 'View Details',
        icon: <Eye className="h-3.5 w-3.5 mr-1" />,
        action: () => {
          router.push(result.href);
        }
      };
  }

  return { primaryAction, secondaryActions };
}
