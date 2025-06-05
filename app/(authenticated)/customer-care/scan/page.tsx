// app/(authenticated)/customer-care/scan/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import useExternalScannerSocket from "@/hooks/use-external-scanner-socket"; // Assuming reusable
import useDirectScanner from "@/hooks/use-direct-scanner"; // Assuming reusable
import { beepSounds } from "@/public/sound/beep";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// No attendance slice needed here. We'll use auth slice for user lookup.
import { selectSafeUsers } from "@/features/auth/store/auth-selectors";
import { fetchAllUsersComplete } from "@/features/auth/store/user-thunks"; // To get all users for barcode lookup

// UI Components
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/auth/page-header";
import { CustomerCareGuard } from "@/components/auth/PermissionGuard"; // Use correct guard

// Custom Components
// We'll need a simplified version of ScannerModeSelector, ScannerControls, ScannerStatusBadge
// and a new component for displaying student info.

import { Button } from "@/components/ui/button";
import { Loader2, UserCircle, Mail, Briefcase, X, QrCode as ScanIcon, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { isStudent } from "@/types/user.types";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Types (You might have a more detailed User type from your auth slice)
interface ScannedStudentInfo {
    id: string;
    name: string;
    email: string;
    role?: string; // Assuming role is part of your User type
    barcodeId: string;
    isActive?: boolean;
    avatarUrl?: string | null;
    // Add other relevant fields you want to display
    department?: string;
    level?: string;
    phone?: string;
}


// Simplified Scanner Mode Selector for this page
function CustomerCareScannerModeSelector({
    scannerMode,
    setScannerMode,
    isScannerActive,
    socketStatus,
    reconnectSocket,
    directScannerStatus,
    directScannerErrorMessage,
}: {
    scannerMode: "camera" | "external" | "direct";
    setScannerMode: (mode: "camera" | "external" | "direct") => void;
    isScannerActive: boolean;
    socketStatus?: string;
    reconnectSocket?: () => void;
    directScannerStatus?: string;
    directScannerErrorMessage?: string | null;

}) {
    // Basic mode selector - can be expanded with camera integration later if needed
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Scanner Input Method:</p>
            <div className="flex gap-2">
                <Button
                    variant={scannerMode === 'direct' ? 'default' : 'outline'}
                    onClick={() => setScannerMode('direct')}
                    disabled={isScannerActive && scannerMode !== 'direct'}
                >
                    USB/HID Scanner
                </Button>
                <Button
                    variant={scannerMode === 'external' ? 'default' : 'outline'}
                    onClick={() => {
                        setScannerMode('external');
                        if (reconnectSocket && socketStatus !== 'connected' && socketStatus !== 'connecting') reconnectSocket();
                    }}
                    disabled={isScannerActive && scannerMode !== 'external'}
                >
                    External (Network)
                </Button>
                {/* Camera scanner can be added here if needed */}
            </div>
            {scannerMode === 'external' && socketStatus && (
                <p className="text-xs text-muted-foreground">Network Scanner: {socketStatus}</p>
            )}
            {scannerMode === 'direct' && directScannerStatus && (
                <p className="text-xs text-muted-foreground">USB Scanner: {directScannerStatus} {directScannerErrorMessage ? `(${directScannerErrorMessage})` : ''}</p>
            )}
        </div>
    );
}


export default function CustomerCareScanPage() {
    const router = useRouter();
    const { toast } = useToast();
    const dispatch = useAppDispatch();

    const loggedInUser = useAppSelector((state) => state.auth.user);
    const allUsersFromStore = useAppSelector(selectSafeUsers); // Use safe selector

    const [isScannerActive, setIsScannerActive] = useState(true); // Start active
    const [lastScannedBarcodeId, setLastScannedBarcodeId] = useState<string | null>(null);
    const [scannedStudentInfo, setScannedStudentInfo] = useState<ScannedStudentInfo | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [scannerMode, setScannerMode] = useState<"camera" | "external" | "direct">("direct");

    const initialUsersFetchAttempted = useRef(false);

    // Effect: User validation
    useEffect(() => {
        if (loggedInUser === undefined) return; // Wait for user data
        if (!loggedInUser || !["admin", "super_admin", "customer_care"].includes(loggedInUser.role)) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Access denied to this page." });
            router.replace("/dashboard");
        }
    }, [loggedInUser, router, toast]);

    // Effect: Fetch all users for barcode lookup
    useEffect(() => {
        if (loggedInUser && !initialUsersFetchAttempted.current) {
            dispatch(fetchAllUsersComplete()); // This thunk should fetch all users without pagination
            initialUsersFetchAttempted.current = true;
        }
    }, [dispatch, loggedInUser]);

    const findStudentByBarcode = useCallback((barcodeId: string): ScannedStudentInfo | null => {
        if (!allUsersFromStore || allUsersFromStore.length === 0) {
            console.warn("User list is empty or not yet loaded.");
            // Consider fetching users again if list is empty and fetch was attempted
            if (!initialUsersFetchAttempted.current) {
                dispatch(fetchAllUsersComplete());
                initialUsersFetchAttempted.current = true;
            }
            return null;
        }
        // Assuming your User type from auth slice has a 'barcodeId' or similar field
        const foundUser = allUsersFromStore.find(
            user => (isStudent(user) && user.barcodeId?.toLocaleLowerCase()) === barcodeId.toLocaleUpperCase()
        );

        if (foundUser) {
            return {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
                barcodeId: barcodeId,
                isActive: foundUser.isActive,
                avatarUrl: foundUser.avatarUrl,
                phone: foundUser.phone as string,
            };
        }
        return null;
    }, [allUsersFromStore, dispatch]);


    const handleBarcodeDetected = useCallback(async (scannedData: any) => {
        console.log("--- Customer Care Scan Detected ---", scannedData);
        setIsScannerActive(false); // Pause scanner while processing
        setErrorMessage(null);
        setScannedStudentInfo(null);

        beepSounds.success(); // Or a different beep

        let processedBarcodeId: string;
        if (typeof scannedData === 'object' && scannedData?.text) { // From camera
            processedBarcodeId = scannedData.text.trim();
        } else if (typeof scannedData === 'string') { // From direct or external
            processedBarcodeId = scannedData.trim();
        } else {
            toast({ title: "Scan Error", description: "Unrecognized barcode format.", variant: "destructive" });
            setIsScannerActive(true); // Resume scanner
            return;
        }

        setLastScannedBarcodeId(processedBarcodeId);
        console.log(`Customer Care: Processed Barcode ID: "${processedBarcodeId}"`);

        const student = findStudentByBarcode(processedBarcodeId);

        if (student) {
            setScannedStudentInfo(student);
            setIsInfoModalOpen(true);
        } else {
            setErrorMessage(`No student found with Barcode ID: ${processedBarcodeId}. User list length: ${allUsersFromStore?.length || 0}`);
            toast({ title: "Student Not Found", description: `No student record matches barcode: ${processedBarcodeId}`, variant: "destructive" });
            setTimeout(() => setIsScannerActive(true), 1000); // Resume scanner after a short delay
        }
    }, [findStudentByBarcode, toast, allUsersFromStore?.length]);


    const isWebSocketEnabled = scannerMode === 'external' && isScannerActive;
    const { status: socketStatus, reconnect: reconnectSocket } = useExternalScannerSocket({
        onBarcodeReceived: handleBarcodeDetected,
        isEnabled: isWebSocketEnabled,
        verbose: process.env.NODE_ENV !== 'production'
    });

    const isDirectScannerEnabled = scannerMode === 'direct' && isScannerActive;
    const { status: directScannerStatus, errorMessage: directScannerErrorMessage } = useDirectScanner({
        onBarcodeReceived: handleBarcodeDetected,
        isEnabled: isDirectScannerEnabled,
        verbose: process.env.NODE_ENV !== 'production'
    });


    const closeModalAndResumeScan = () => {
        setIsInfoModalOpen(false);
        setScannedStudentInfo(null);
        setLastScannedBarcodeId(null);
        setIsScannerActive(true); // Resume scanner
    };

    return (
        <CustomerCareGuard>
            <div className="w-full mx-auto p-4 md:p-6 space-y-6">
                <PageHeader
                    heading='Scan Student ID'
                    subheading='Scan a student ID card to view their information.'
                    actions={
                        <Badge variant={isScannerActive ? "secondary" : "outline"} className="text-sm px-3 py-1.5">
                            {isScannerActive ? "Scanner Active" : "Scanner Paused"}
                        </Badge>
                    }
                />

                <Card className="bg-card/5 backdrop-blur-sm border border-card/30 shadow-lg">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <Button onClick={() => setIsScannerActive(prev => !prev)} className="w-full md:w-auto">
                                {isScannerActive ? "Pause Scanner" : "Resume Scanner"}
                            </Button>
                            <CustomerCareScannerModeSelector
                                scannerMode={scannerMode}
                                setScannerMode={setScannerMode}
                                isScannerActive={isScannerActive}
                                socketStatus={socketStatus}
                                reconnectSocket={reconnectSocket}
                                directScannerStatus={directScannerStatus}
                                directScannerErrorMessage={directScannerErrorMessage}
                            />
                        </div>

                        {errorMessage && !isInfoModalOpen && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Scan Error</AlertTitle>
                                <CardDescription>{errorMessage}</CardDescription>
                            </Alert>
                        )}

                        {!isScannerActive && !isInfoModalOpen && (
                            <div className="text-center py-8">
                                <ScanIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Scanner is paused. Click "Resume Scanner" to start.</p>
                            </div>
                        )}
                        {isScannerActive && (
                            <div className="text-center py-8 bg-primary/5 rounded-md border border-primary/20">
                                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
                                <p className="font-semibold text-primary">Scanner Active - Awaiting Scan</p>
                                <p className="text-sm text-muted-foreground mt-1">Using {scannerMode} scanner mode.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Student Info Modal */}
                <Dialog open={isInfoModalOpen} onOpenChange={(open) => { if (!open) closeModalAndResumeScan(); }}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Student Information</DialogTitle>
                            <DialogDescription>
                                Details for scanned Barcode ID: {lastScannedBarcodeId || "N/A"}
                            </DialogDescription>
                        </DialogHeader>
                        {scannedStudentInfo ? (
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-4">
                                    {scannedStudentInfo.avatarUrl ? (
                                        <Image src={scannedStudentInfo.avatarUrl} alt={scannedStudentInfo.name} width={80} height={80} className="rounded-full object-cover" />
                                    ) : (
                                        <UserCircle className="h-20 w-20 text-muted-foreground" />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-semibold">{scannedStudentInfo.name}</h3>
                                        <p className="text-sm text-muted-foreground">{scannedStudentInfo.email}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><strong className="text-muted-foreground">Student ID:</strong> {scannedStudentInfo.id}</p>
                                    <p><strong className="text-muted-foreground">Role:</strong> <Badge variant="outline">{scannedStudentInfo.role}</Badge></p>
                                    <p><strong className="text-muted-foreground">Status:</strong>
                                        <Badge variant={scannedStudentInfo.isActive ? "secondary" : "destructive"}>
                                            {scannedStudentInfo.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </p>
                                    {scannedStudentInfo.phone && <p><strong className="text-muted-foreground">Phone:</strong> {scannedStudentInfo.phone}</p>}
                                    {scannedStudentInfo.department && <p><strong className="text-muted-foreground">Department:</strong> {scannedStudentInfo.department}</p>}
                                    {scannedStudentInfo.level && <p><strong className="text-muted-foreground">Level:</strong> {scannedStudentInfo.level}</p>}
                                </div>
                                {/* Add more details as needed */}
                                <Button
                                    variant="link"
                                    className="mt-2 justify-start px-0"
                                    onClick={() => router.push(`/admin/users/${scannedStudentInfo.id}`)} // Or appropriate student profile page
                                >
                                    View Full Profile →
                                </Button>
                            </div>
                        ) : (
                            <div className="py-4 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p>Loading student details...</p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={closeModalAndResumeScan}>Close & Scan Next</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </CustomerCareGuard>
    );
}