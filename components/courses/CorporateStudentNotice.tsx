// components/courses/CorporateStudentNotice.tsx

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CorporateStudentNotice() {
    return (
        <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6">
            <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle>Corporate Student Account</AlertTitle>
            <AlertDescription>
                As a corporate student, your courses are managed by your organization. You can access your assigned courses in
                the "My Courses" tab.
            </AlertDescription>
        </Alert>
    )
}
