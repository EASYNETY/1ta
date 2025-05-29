"use client";

import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    markStudentAttendance,
    resetMarkingStatus,
    selectAttendanceMarkingLoading,
    selectAttendanceMarkingError,
    selectAttendanceMarkingStatus
} from "@/features/attendance/store/attendance-slice";
import { selectCourseClass } from "@/features/classes/store/classSessionSlice";
import { StudentInfoModal } from "@/components/students/student-info-modal";
import { safeArray } from "@/lib/utils/safe-data";

interface StudentInfo {
    id: string;
    name: string;
    email: string;
    dateOfBirth?: string | null;
    classId?: string | null;
    barcodeId: string;
    isActive?: boolean;
    avatarUrl?: string | null;
}

interface ScanResultHandlerProps {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    lastScannedId: string | null;
    setLastScannedId: (id: string | null) => void;
    studentInfo: StudentInfo | null;
    setStudentInfo: (info: StudentInfo | null) => void;
    fetchingStudentInfo: boolean;
    setFetchingStudentInfo: (isFetching: boolean) => void;
    setIsScannerActive: (isActive: boolean) => void;
    casualScanMode: boolean;
    allFetchedUsers: any[];
}

export function ScanResultHandler({
    isModalOpen,
    setIsModalOpen,
    lastScannedId,
    setLastScannedId,
    studentInfo,
    setStudentInfo,
    fetchingStudentInfo,
    setFetchingStudentInfo,
    setIsScannerActive,
    casualScanMode,
    allFetchedUsers
}: ScanResultHandlerProps) {
    const dispatch = useAppDispatch();
    const selectedClass = useAppSelector(selectCourseClass);
    const markingLoading = useAppSelector(selectAttendanceMarkingLoading);
    const apiError = useAppSelector(selectAttendanceMarkingError);
    const apiStatus = useAppSelector(selectAttendanceMarkingStatus);

    // Handle modal close
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
    }, [setIsModalOpen]);

    // Handle resume scan
    const handleResumeScan = useCallback(() => {
        setLastScannedId(null);
        setStudentInfo(null);
        setIsScannerActive(true);
        dispatch(resetMarkingStatus());
    }, [setLastScannedId, setStudentInfo, setIsScannerActive, dispatch]);

    // Effect to process scanned barcode
    useEffect(() => {
        if (lastScannedId && isModalOpen && fetchingStudentInfo) {
            const users = safeArray(allFetchedUsers);

            // Log the scanned ID and the number of users available for lookup
            console.log(`Processing scan for barcode ID: "${lastScannedId}"`);
            console.log(`Total users available for lookup: ${users.length}`);

            // Log a sample of users for debugging (first 3)
            if (users.length > 0) {
                console.log("Sample of available users:", users.slice(0, 3).map(user => ({
                    id: user.id,
                    name: user.name,
                    barcodeId: user.barcodeId,
                    role: user.role
                })));
            }

            // Find student by barcode ID with improved matching
            const foundStudent = users.find((user: any) => {
                // Normalize both the scanned ID and the stored IDs for comparison
                const normalizedScannedId = lastScannedId?.trim().toLowerCase();
                const normalizedBarcodeId = user.barcodeId?.trim().toLowerCase();
                const normalizedUserId = user.id?.trim().toLowerCase();

                // Log for debugging
                console.log(`Comparing scanned ID: "${normalizedScannedId}" with user:`, {
                    name: user.name,
                    barcodeId: normalizedBarcodeId,
                    userId: normalizedUserId
                });

                // Check for matches with both barcodeId and id
                return (
                    (normalizedBarcodeId && normalizedBarcodeId === normalizedScannedId) ||
                    (normalizedUserId && normalizedUserId === normalizedScannedId)
                );
            });

            if (foundStudent) {
                // Map user to StudentInfo for the modal
                const studentDataForModal: StudentInfo = {
                    id: foundStudent.id,
                    name: foundStudent.name,
                    email: foundStudent.email,
                    dateOfBirth: foundStudent.dateOfBirth,
                    classId: foundStudent.classId,
                    barcodeId: foundStudent.barcodeId || lastScannedId,
                    isActive: foundStudent.isActive,
                    avatarUrl: foundStudent.avatarUrl,
                };
                setStudentInfo(studentDataForModal);

                // Mark attendance if not in casual mode and class is selected
                if (!casualScanMode && selectedClass?.id) {
                    dispatch(markStudentAttendance({
                        studentId: foundStudent.id,
                        classInstanceId: selectedClass.id,
                        markedByUserId: '', // This will be filled by the backend
                        timestamp: new Date().toISOString()
                    }));
                }
            } else {
                console.log(`No student found with barcode ID: "${lastScannedId}"`);

                // Additional debugging: Check if any users have barcodeId that partially matches
                const partialMatches = users.filter(user =>
                    user.barcodeId &&
                    (user.barcodeId.includes(lastScannedId) ||
                        lastScannedId.includes(user.barcodeId))
                );

                if (partialMatches.length > 0) {
                    console.log("Found partial matches that didn't exactly match:",
                        partialMatches.map(user => ({
                            name: user.name,
                            barcodeId: user.barcodeId
                        }))
                    );

                    // If we have exactly one partial match, use it as a fallback
                    if (partialMatches.length === 1) {
                        console.log("Using the single partial match as a fallback:", partialMatches[0].name);

                        // Map user to StudentInfo for the modal
                        const studentDataForModal: StudentInfo = {
                            id: partialMatches[0].id,
                            name: partialMatches[0].name,
                            email: partialMatches[0].email,
                            dateOfBirth: partialMatches[0].dateOfBirth,
                            classId: partialMatches[0].classId,
                            barcodeId: partialMatches[0].barcodeId || lastScannedId,
                            isActive: partialMatches[0].isActive,
                            avatarUrl: partialMatches[0].avatarUrl,
                        };
                        setStudentInfo(studentDataForModal);

                        // Mark attendance if not in casual mode and class is selected
                        if (!casualScanMode && selectedClass?.id) {
                            dispatch(markStudentAttendance({
                                studentId: partialMatches[0].id,
                                classInstanceId: selectedClass.id,
                                markedByUserId: '', // This will be filled by the backend
                                timestamp: new Date().toISOString()
                            }));
                        }

                        // Exit early since we found a match
                        setFetchingStudentInfo(false);
                        return;
                    }
                }

                setStudentInfo(null);
            }

            setFetchingStudentInfo(false);
        }
    }, [
        lastScannedId,
        isModalOpen,
        fetchingStudentInfo,
        allFetchedUsers,
        casualScanMode,
        selectedClass,
        dispatch,
        setStudentInfo,
        setFetchingStudentInfo
    ]);

    return (
        <StudentInfoModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onResumeScan={handleResumeScan}
            studentInfo={studentInfo}
            isLoading={fetchingStudentInfo}
            scannedId={lastScannedId}
            apiStatus={casualScanMode ? 'success' : (markingLoading ? 'loading' : apiStatus)}
            apiError={apiError}
            casualScanMode={casualScanMode}
            checkInDateTime={new Date().toISOString()}
            lectureName={selectedClass.courseName}
        />
    );
}
