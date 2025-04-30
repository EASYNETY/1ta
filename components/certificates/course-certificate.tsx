"use client"

import { useRef } from "react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { Award, Download, Share2 } from "lucide-react"
import { format } from "date-fns"

interface CourseCertificateProps {
    courseTitle: string
    studentName: string
    completionDate: Date
    instructorName: string
    certificateId: string
}

export function CourseCertificate({
    courseTitle,
    studentName,
    completionDate,
    instructorName,
    certificateId,
}: CourseCertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null)

    // Function to download certificate as image
    const downloadCertificate = () => {
        if (!certificateRef.current) return

        // In a real implementation, you would use html2canvas or a similar library
        // to convert the certificate to an image and download it
        alert("Certificate download functionality would be implemented here")
    }

    // Function to share certificate
    const shareCertificate = () => {
        // In a real implementation, you would generate a shareable link
        alert("Certificate sharing functionality would be implemented here")
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Course Certificate</h2>
                <div className="flex gap-2">
                    <DyraneButton variant="outline" size="sm" onClick={downloadCertificate}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </DyraneButton>
                    <DyraneButton variant="outline" size="sm" onClick={shareCertificate}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </DyraneButton>
                </div>
            </div>

            <DyraneCard className="overflow-hidden">
                <CardContent className="p-0">
                    <div
                        ref={certificateRef}
                        className="relative bg-white p-8 md:p-12 text-center"
                        style={{ aspectRatio: "16/9" }}
                    >
                        {/* Certificate Border */}
                        <div className="absolute inset-4 border-4 border-primary/20 rounded-lg"></div>

                        {/* Certificate Content */}
                        <div className="relative h-full flex flex-col justify-between">
                            {/* Header */}
                            <div>
                                <div className="flex justify-center mb-4">
                                    <Award className="h-16 w-16 text-primary" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Certificate of Completion</h1>
                                <p className="text-muted-foreground">This certifies that</p>
                            </div>

                            {/* Body */}
                            <div className="my-6">
                                <p className="text-2xl md:text-4xl font-serif italic mb-6">{studentName}</p>
                                <p className="text-muted-foreground mb-4">has successfully completed the course</p>
                                <p className="text-xl md:text-2xl font-bold mb-6">{courseTitle}</p>
                                <p className="text-muted-foreground">on {format(completionDate, "MMMM d, yyyy")}</p>
                            </div>

                            {/* Footer */}
                            <div>
                                <div className="flex justify-center items-center gap-12 md:gap-24 mb-4">
                                    <div className="text-center">
                                        <div className="w-32 border-t-2 border-primary/50 mb-2"></div>
                                        <p className="text-sm font-medium">{instructorName}</p>
                                        <p className="text-xs text-muted-foreground">Instructor</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-32 border-t-2 border-primary/50 mb-2"></div>
                                        <p className="text-sm font-medium">Dr. James Wilson</p>
                                        <p className="text-xs text-muted-foreground">Academy Director</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">Certificate ID: {certificateId}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </DyraneCard>
        </div>
    )
}
