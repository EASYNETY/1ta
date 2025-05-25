"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";

// Components
import { PageHeader } from "@/components/layout/auth/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import BarcodeScanner from "@/lib/barcode-scanner";

// Icons
import { ScanBarcode, User, CreditCard, Clock, BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Redux
import { fetchUsersByRole } from "@/features/auth/store/user-thunks";
import { selectSafeUsers } from "@/features/auth/store/auth-selectors";

// Types
interface StudentInfo {
    id: string;
    name: string;
    email: string;
    barcodeId: string;
    classId?: string | null;
    isActive?: boolean;
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
    phone?: string | null;
}

interface PaymentStatus {
    status: 'paid' | 'pending' | 'overdue' | 'partial';
    lastPaymentDate?: string;
    amountDue?: number;
    nextDueDate?: string;
}

interface CourseInfo {
    title: string;
    instructor?: string;
    schedule?: string;
}

export default function CustomerCareScanPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Redux state
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const allUsers = useAppSelector(selectSafeUsers);

    // Local state
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [scannedStudent, setScannedStudent] = useState<StudentInfo | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
    const [scanTime, setScanTime] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const initialStudentsFetchAttempted = useRef(false);

    // Authorization check - allow customer_care, super_admin, and admin roles
    useEffect(() => {
        if (loggedInUser === undefined) return;
        if (!loggedInUser || !['customer_care', 'super_admin', 'admin'].includes(loggedInUser.role)) {
            toast({
                variant: "destructive",
                title: "Unauthorized",
                description: "Customer Care access required."
            });
            router.replace("/dashboard");
            return;
        }
    }, [loggedInUser, router, toast]);

    // Fetch students for barcode lookup
    useEffect(() => {
        if (loggedInUser && !initialStudentsFetchAttempted.current) {
            console.log("CustomerCareScan: Fetching all students for barcode lookup.");
            dispatch(fetchUsersByRole({ role: "student" }));
            initialStudentsFetchAttempted.current = true;
        }
    }, [dispatch, loggedInUser]);

    // Mock function to get payment status (replace with real API call)
    const getPaymentStatus = useCallback(async (studentId: string): Promise<PaymentStatus> => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock payment data - replace with real API
        const mockStatuses: PaymentStatus[] = [
            { status: 'paid', lastPaymentDate: '2025-01-20', amountDue: 0 },
            { status: 'pending', amountDue: 150000, nextDueDate: '2025-02-01' },
            { status: 'overdue', amountDue: 200000, nextDueDate: '2025-01-15' },
            { status: 'partial', amountDue: 75000, nextDueDate: '2025-01-30', lastPaymentDate: '2025-01-10' }
        ];

        return mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    }, []);

    // Mock function to get course info (replace with real API call)
    const getCourseInfo = useCallback(async (classId: string): Promise<CourseInfo> => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        // Mock course data - replace with real API
        const mockCourses: CourseInfo[] = [
            { title: 'PMP Certification Bootcamp', instructor: 'Dr. Sarah Johnson', schedule: 'Mon/Wed/Fri 10:00 AM' },
            { title: 'Data Science Fundamentals', instructor: 'Prof. Michael Chen', schedule: 'Tue/Thu 2:00 PM' },
            { title: 'Cybersecurity Essentials', instructor: 'Ms. Emily Rodriguez', schedule: 'Mon/Wed 6:00 PM' },
            { title: 'Digital Marketing Mastery', instructor: 'Mr. David Wilson', schedule: 'Sat 9:00 AM - 5:00 PM' }
        ];

        return mockCourses[Math.floor(Math.random() * mockCourses.length)];
    }, []);

    // Handle barcode scan
    const handleBarcodeDetected = useCallback(async (scannedData: string) => {
        console.log("Customer Care Scan Detected:", scannedData);
        setIsScannerActive(false);
        setIsLoading(true);
        setScanTime(new Date().toLocaleString());

        try {
            // Find student by barcode ID or user ID
            const student = allUsers.find(user =>
                user.role === 'student' &&
                (user.barcodeId === scannedData || user.id === scannedData)
            ) as StudentInfo | undefined;

            if (!student) {
                toast({
                    variant: "destructive",
                    title: "Student Not Found",
                    description: `No student found with barcode: ${scannedData}`
                });
                setIsLoading(false);
                return;
            }

            setScannedStudent(student);

            // Fetch payment status and course info in parallel
            const [paymentData, courseData] = await Promise.all([
                getPaymentStatus(student.id),
                student.classId ? getCourseInfo(student.classId) : Promise.resolve({ title: 'No Course Assigned' })
            ]);

            setPaymentStatus(paymentData);
            setCourseInfo(courseData);

            toast({
                title: "Student Information Retrieved",
                description: `Showing details for ${student.name}`,
            });

        } catch (error) {
            console.error("Error fetching student information:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to retrieve student information"
            });
        } finally {
            setIsLoading(false);
        }
    }, [allUsers, getPaymentStatus, getCourseInfo, toast]);

    const getPaymentStatusBadge = (status: PaymentStatus['status']) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
            case 'partial':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200"><AlertCircle className="w-3 h-3 mr-1" />Partial</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Customer Care - Student Scanner"
                subheading="Scan student barcodes to instantly view their information"
            />

            {/* Scanner Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ScanBarcode className="h-5 w-5" />
                        Barcode Scanner
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isScannerActive ? (
                        <div className="text-center py-8">
                            <DyraneButton
                                onClick={() => setIsScannerActive(true)}
                                size="lg"
                                className="mb-4"
                            >
                                <ScanBarcode className="mr-2 h-5 w-5" />
                                Start Scanner
                            </DyraneButton>
                            <p className="text-sm text-muted-foreground">
                                Click to activate the barcode scanner
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <BarcodeScanner
                                    onDetected={handleBarcodeDetected}
                                    width="100%"
                                    height={300}
                                    isActive={isScannerActive}
                                />
                            </div>
                            <div className="text-center">
                                <DyraneButton
                                    variant="outline"
                                    onClick={() => setIsScannerActive(false)}
                                >
                                    Stop Scanner
                                </DyraneButton>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Student Information Display */}
            {(scannedStudent || isLoading) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Student Information
                        </CardTitle>
                        {scanTime && (
                            <p className="text-sm text-muted-foreground">
                                Scanned at: {scanTime}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ) : scannedStudent ? (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{scannedStudent.name}</h3>
                                        <p className="text-muted-foreground">{scannedStudent.email}</p>
                                        <p className="text-sm text-muted-foreground">ID: {scannedStudent.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={scannedStudent.isActive ? "default" : "secondary"}>
                                            {scannedStudent.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                {/* Payment Status */}
                                {paymentStatus && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            <span className="font-medium">Payment Status</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {getPaymentStatusBadge(paymentStatus.status)}
                                            {paymentStatus.amountDue && paymentStatus.amountDue > 0 && (
                                                <span className="text-sm font-medium">
                                                    Due: {formatCurrency(paymentStatus.amountDue)}
                                                </span>
                                            )}
                                        </div>
                                        {paymentStatus.nextDueDate && (
                                            <p className="text-sm text-muted-foreground">
                                                Next due: {new Date(paymentStatus.nextDueDate).toLocaleDateString()}
                                            </p>
                                        )}
                                        {paymentStatus.lastPaymentDate && (
                                            <p className="text-sm text-muted-foreground">
                                                Last payment: {new Date(paymentStatus.lastPaymentDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <Separator />

                                {/* Course Information */}
                                {courseInfo && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            <span className="font-medium">Course Information</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{courseInfo.title}</h4>
                                            {courseInfo.instructor && (
                                                <p className="text-sm text-muted-foreground">
                                                    Instructor: {courseInfo.instructor}
                                                </p>
                                            )}
                                            {courseInfo.schedule && (
                                                <p className="text-sm text-muted-foreground">
                                                    Schedule: {courseInfo.schedule}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
