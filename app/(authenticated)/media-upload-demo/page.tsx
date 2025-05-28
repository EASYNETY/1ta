"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MediaUpload } from '@/components/ui/media-upload';
import { FormMediaUpload } from '@/components/ui/form-media-upload';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { MediaType } from '@/lib/services/media-upload-service';
import { useToast } from '@/hooks/use-toast';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  profileImage: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  documentUrl: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MediaUploadDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('form');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [standaloneImageUrl, setStandaloneImageUrl] = useState<string | null>(null);
  const [standaloneVideoUrl, setStandaloneVideoUrl] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      profileImage: null,
      coverImage: null,
      videoUrl: null,
      documentUrl: null,
    },
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
    toast({
      title: 'Form Submitted',
      description: 'Check the console for the form data',
    });
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Media Upload Components Demo</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-10">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className={cn(
            // Mobile first (scrollable)
            "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
            "gap-1", // Add gap between items for scrolling
            // SM breakpoint and up (grid)
            "sm:grid sm:w-full sm:grid-cols-3 sm:justify-center sm:gap-2"
          )}>
            <TabsTrigger value="form" className="sm:flex-1">Form Integration</TabsTrigger>
            <TabsTrigger value="standalone" className="sm:flex-1">Standalone Components</TabsTrigger>
            <TabsTrigger value="avatar" className="sm:flex-1">Avatar Upload</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>

        {/* Form Integration Tab */}
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Form with Media Uploads</CardTitle>
              <CardDescription>
                Example of media upload components integrated with React Hook Form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Profile Image Upload */}
                    <FormMediaUpload
                      name="profileImage"
                      label="Profile Image"
                      description="Upload a profile image (JPG, PNG, or GIF)"
                      mediaType={MediaType.IMAGE}
                      showFileName={false}
                    />

                    {/* Cover Image Upload */}
                    <FormMediaUpload
                      name="coverImage"
                      label="Cover Image"
                      description="Upload a cover image (1280x720px recommended)"
                      mediaType={MediaType.IMAGE}
                      showFileName={false}
                    />

                    {/* Video Upload */}
                    <FormMediaUpload
                      name="videoUrl"
                      label="Video"
                      description="Upload a video (MP4, WebM, or OGG)"
                      mediaType={MediaType.VIDEO}
                    />

                    {/* Document Upload */}
                    <FormMediaUpload
                      name="documentUrl"
                      label="Document"
                      description="Upload a document (PDF, Word, Excel)"
                      mediaType={MediaType.DOCUMENT}
                    />

                    <Button type="submit">Submit Form</Button>
                  </form>
                </Form>
              </FormProvider>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Standalone Components Tab */}
        <TabsContent value="standalone">
          <Card>
            <CardHeader>
              <CardTitle>Standalone Media Upload Components</CardTitle>
              <CardDescription>
                Examples of media upload components used outside of a form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Standalone Image Upload */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Image Upload</h3>
                <MediaUpload
                  mediaType={MediaType.IMAGE}
                  initialUrl={standaloneImageUrl}
                  onUrlChange={setStandaloneImageUrl}
                  label="Upload Image"
                  description="PNG, JPG or GIF up to 10MB"
                  uploadOptions={{
                    folder: "demo-images",
                    onUploadSuccess: (response) => {
                      console.log('Image uploaded successfully:', response);
                      toast({
                        title: 'Image Uploaded',
                        description: `File uploaded: ${response.data.files[0].originalName}`,
                        variant: 'success',
                      });
                    },
                    onUploadError: (error) => {
                      console.error('Image upload failed:', error);
                      toast({
                        title: 'Upload Failed',
                        description: error.message,
                        variant: 'destructive',
                      });
                    },
                  }}
                />
                {standaloneImageUrl && (
                  <p className="text-sm text-muted-foreground break-all">
                    URL: {standaloneImageUrl}
                  </p>
                )}
              </div>

              {/* Standalone Video Upload */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Video Upload</h3>
                <MediaUpload
                  mediaType={MediaType.VIDEO}
                  initialUrl={standaloneVideoUrl}
                  onUrlChange={setStandaloneVideoUrl}
                  label="Upload Video"
                  description="MP4, WebM or OGG up to 100MB"
                  uploadOptions={{
                    folder: "demo-videos",
                    onUploadSuccess: (response) => {
                      console.log('Video uploaded successfully:', response);
                      toast({
                        title: 'Video Uploaded',
                        description: `File uploaded: ${response.data.files[0].originalName}`,
                        variant: 'success',
                      });
                    },
                  }}
                />
                {standaloneVideoUrl && (
                  <p className="text-sm text-muted-foreground break-all">
                    URL: {standaloneVideoUrl}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Avatar Upload Tab */}
        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>Avatar Upload Component</CardTitle>
              <CardDescription>
                Examples of the avatar upload component in different sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-8">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-center">Extra Large</h3>
                  <AvatarUpload
                    size="xl"
                    initialUrl={avatarUrl}
                    onUrlChange={setAvatarUrl}
                    name="John Doe"
                    uploadOptions={{
                      folder: "profile-avatars",
                    }}
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-center">Large</h3>
                    <AvatarUpload
                      size="lg"
                      initialUrl={avatarUrl}
                      onUrlChange={setAvatarUrl}
                      name="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-center">Medium</h3>
                    <AvatarUpload
                      size="md"
                      initialUrl={avatarUrl}
                      onUrlChange={setAvatarUrl}
                      name="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-center">Small</h3>
                    <AvatarUpload
                      size="sm"
                      initialUrl={avatarUrl}
                      onUrlChange={setAvatarUrl}
                      name="John Doe"
                    />
                  </div>
                </div>

                {avatarUrl && (
                  <p className="text-sm text-muted-foreground break-all">
                    Avatar URL: {avatarUrl}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
