// components/ui/confirmation-dialog.tsx
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react"; // For loading state

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"; // Import Button for variant prop
import { cn } from "@/lib/utils"; // For combining class names
import { DyraneButtonProps } from "../dyrane-ui/dyrane-button";

interface ConfirmationDialogProps {
    trigger: React.ReactNode; // The element that opens the dialog (e.g., a Button or DropdownMenuItem)
    title: string; // The main question (e.g., "Are you absolutely sure?")
    description: React.ReactNode; // More details about the action's consequences
    confirmText?: string; // Text for the confirmation button (default: "Confirm")
    cancelText?: string; // Text for the cancel button (default: "Cancel")
    onConfirm: () => Promise<void> | void; // Function to execute on confirmation (can be async)
    variant?: DyraneButtonProps["variant"]; // To style the confirm button (e.g., "destructive")
    confirmDisabled?: boolean; // Explicitly disable confirm button
    dialogOpen?: boolean; // Controlled open state (optional)
    onDialogOpenChange?: (open: boolean) => void; // Controlled open state handler (optional)
}

export function ConfirmationDialog({
    trigger,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    variant = "default", // Default variant for confirm button
    confirmDisabled = false,
    dialogOpen,
    onDialogOpenChange,
}: ConfirmationDialogProps) {
    const [isConfirming, setIsConfirming] = React.useState(false);

    const handleConfirmClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Prevent default form submission if applicable
        setIsConfirming(true);
        try {
            await onConfirm();
            // If controlled, the parent will close it via onDialogOpenChange(false)
            // If uncontrolled, it closes automatically, but we reset loading state
            // Let's assume uncontrolled for simplicity here unless dialogOpen is provided
            if (dialogOpen === undefined) {
                // It will close automatically via AlertDialogAction default behavior
                // We just need to reset loading state for next time
                setTimeout(() => setIsConfirming(false), 100); // Small delay to allow closing animation
            } else {
                // Parent is controlling state, just reset loading indicator
                setIsConfirming(false);
            }

        } catch (error) {
            console.error("Confirmation action failed:", error);
            setIsConfirming(false); // Reset loading state on error
            // Optionally show an error message here
        }
    };

    return (
        <AlertDialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
            {/* Use asChild to avoid rendering an extra div/button around the trigger */}
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isConfirming}>{cancelText}</AlertDialogCancel>
                    {/* Apply variant and loading state to the action button */}
                    <Button
                        // Use AlertDialogAction props indirectly via Button onClick/disabled/type
                        // Note: AlertDialogAction itself might handle closing. If issues arise,
                        // replace Button with AlertDialogAction and manage state carefully.
                        // For now, Button gives more control over loading state.
                        variant={variant}
                        disabled={isConfirming || confirmDisabled}
                        onClick={handleConfirmClick}
                    >
                        {isConfirming ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isConfirming ? 'Processing...' : confirmText}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}