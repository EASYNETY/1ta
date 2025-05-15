"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, UserCog, ChalkboardTeacher } from 'lucide-react';

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
  return (
    <div className={cn("my-6", className)}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {studentContent && (
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">For Students</span>
              <span className="sm:hidden">Students</span>
            </TabsTrigger>
          )}
          {teacherContent && (
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <ChalkboardTeacher className="h-4 w-4" />
              <span className="hidden sm:inline">For Teachers</span>
              <span className="sm:hidden">Teachers</span>
            </TabsTrigger>
          )}
          {adminContent && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">For Administrators</span>
              <span className="sm:hidden">Admins</span>
            </TabsTrigger>
          )}
        </TabsList>
        
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
