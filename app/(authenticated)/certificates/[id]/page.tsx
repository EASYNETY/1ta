"use client"

import { useParams } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { CourseCertificate } from "@/components/certificates/course-certificate"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CertificatePage() {
    const { id } = useParams()
    const { user } = useAppSelector((state) => state.auth)
    const { courses } = useAppSelector((state) => state.auth_courses)

    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to view your certificate.</p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/login">Go to Login</Link>
                    </DyraneButton>
                </div>
            </div>
        )
    }

    // Find the course that matches the certificate ID
    // In a real app, you would fetch the certificate data from an API
    const course = courses.find((course) => course.id === id)

    if (!course) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Certificate Not Found</h2>
                    <p className="text-muted-foreground mt-2">
                        The certificate you're looking for doesn't exist or you don't have access to it.
                    </p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/courses">Back to Courses</Link>
                    </DyraneButton>
                </div>
            </div>
        )
    }

    // Mock certificate data
    const certificateData = {
        courseTitle: course.title,
        studentName: user.name,
        completionDate: new Date(),
        instructorName: course.instructor.name,
        certificateId: `CERT-${id}-${user.id?.substring(0, 6)}`,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <DyraneButton variant="outline" size="sm" asChild>
                    <Link href={`/courses/${course.slug}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Course
                    </Link>
                </DyraneButton>
            </div>

            <CourseCertificate {...certificateData} />
        </div>
    )
}
