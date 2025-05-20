"use client";

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { MediaUpload, MediaUploadProps } from '@/components/ui/media-upload';

export interface FormMediaUploadProps extends Omit<MediaUploadProps, 'onUrlChange' | 'initialUrl'> {
  /**
   * The name of the form field
   */
  name: string;
  
  /**
   * The label for the form field
   */
  label?: string;
  
  /**
   * The description for the form field
   */
  description?: string;
}

/**
 * A form field wrapper for the MediaUpload component
 */
export function FormMediaUpload({
  name,
  label,
  description,
  ...props
}: FormMediaUploadProps) {
  const { control } = useFormContext();
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <MediaUpload
              initialUrl={field.value}
              onUrlChange={(url) => {
                field.onChange(url);
              }}
              {...props}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * A standalone form field wrapper for the MediaUpload component
 * This is useful when you're not using a FormProvider
 */
export interface StandaloneFormMediaUploadProps extends Omit<MediaUploadProps, 'onUrlChange' | 'initialUrl'> {
  /**
   * The control from useForm
   */
  control: any;
  
  /**
   * The name of the form field
   */
  name: string;
  
  /**
   * The label for the form field
   */
  label?: string;
  
  /**
   * The description for the form field
   */
  description?: string;
}

export function StandaloneFormMediaUpload({
  control,
  name,
  label,
  description,
  ...props
}: StandaloneFormMediaUploadProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          {label && (
            <label
              htmlFor={name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          <MediaUpload
            initialUrl={field.value}
            onUrlChange={(url) => {
              field.onChange(url);
            }}
            {...props}
          />
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
          {fieldState.error && (
            <p className="text-sm font-medium text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
