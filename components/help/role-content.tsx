"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, UserCog } from 'lucide-react';
import { Presentation } from 'phosphor-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface RoleContentProps {
  studentContent?: React.ReactNode;
  teacherContent?: React.ReactNode;
  adminContent?: React.ReactNode;
  defaultTab?: 'student' | 'teacher' | 'admin';
  className?: string;
}

export function RoleContent({
  studentContent,
  teacherContent,
  adminContent,
  defaultTab = 'student',
  className
}: RoleContentProps) {
  // Determine the default tab based on available content
  const determineDefaultTab = () => {
    if (defaultTab === 'student' && !studentContent) {
      if (teacherContent) return 'teacher';
      if (adminContent) return 'admin';
    }
    if (defaultTab === 'teacher' && !teacherContent) {
      if (studentContent) return 'student';
      if (adminContent) return 'admin';
    }
    if (defaultTab === 'admin' && !adminContent) {
      if (studentContent) return 'student';
      if (teacherContent) return 'teacher';
    }
    return defaultTab;
  };

  const activeTab = determineDefaultTab();

  // No need to count tabs anymore

  return (
    <div className={cn("my-6", className)}>
      <Tabs defaultValue={activeTab} className="w-full">
        <div className="relative">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max border-b-0 px-4">
              {studentContent && (
                <TabsTrigger value="student" className="flex items-center gap-2 whitespace-nowrap">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span>For Students</span>
                </TabsTrigger>
              )}
              {teacherContent && (
                <TabsTrigger value="teacher" className="flex items-center gap-2 whitespace-nowrap">
                  <Presentation className="h-4 w-4 flex-shrink-0" />
                  <span>For Teachers</span>
                </TabsTrigger>
              )}
              {adminContent && (
                <TabsTrigger value="admin" className="flex items-center gap-2 whitespace-nowrap">
                  <UserCog className="h-4 w-4 flex-shrink-0" />
                  <span>For Administrators</span>
                </TabsTrigger>
              )}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
        </div>

        {studentContent && (
          <TabsContent value="student" className="p-4 border rounded-md mt-4">
            {studentContent}
          </TabsContent>
        )}

        {teacherContent && (
          <TabsContent value="teacher" className="p-4 border rounded-md mt-4">
            {teacherContent}
          </TabsContent>
        )}

        {adminContent && (
          <TabsContent value="admin" className="p-4 border rounded-md mt-4">
            {adminContent}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
