"use client";

import { useState, useEffect, useCallback } from "react";
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
            
            // Find student by barcode ID
            const foundStudent = users.find(
                (user: any) => 
                    user.barcodeId === lastScannedId || 
                    user.id === lastScannedId
            );

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
                        classId: selectedClass.id,
                    }));
                }
            } else {
                console.log(`No student found with barcode ID: ${lastScannedId}`);
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
        />
    );
}
