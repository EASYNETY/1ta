// features/analytics/utils/export-utils.ts
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import type { 
  StudentReport, 
  StudentBiodataReport, 
  CourseReport, 
  PaymentReport, 
  AttendanceReport 
} from '../types/report-types';

/**
 * Generic function to export data as CSV
 * @param data Array of data to export
 * @param filename Name of the file without extension
 */
export function exportToCSV<T>(data: T[], filename: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}

/**
 * Format date for use in filenames
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function getFormattedDate(): string {
  const date = new Date();
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Export student reports as CSV
 * @param data Array of student reports
 * @param filename Optional custom filename
 */
export function exportStudentReports(data: StudentReport[], filename?: string): void {
  const defaultFilename = `student-reports-${getFormattedDate()}`;
  exportToCSV(data, filename || defaultFilename);
}

/**
 * Export student biodata reports as CSV
 * @param data Array of student biodata reports
 * @param filename Optional custom filename
 */
export function exportStudentBiodataReports(data: StudentBiodataReport[], filename?: string): void {
  const defaultFilename = `student-biodata-reports-${getFormattedDate()}`;
  exportToCSV(data, filename || defaultFilename);
}

/**
 * Export course reports as CSV
 * @param data Array of course reports
 * @param filename Optional custom filename
 */
export function exportCourseReports(data: CourseReport[], filename?: string): void {
  const defaultFilename = `course-reports-${getFormattedDate()}`;
  exportToCSV(data, filename || defaultFilename);
}

/**
 * Export payment reports as CSV
 * @param data Array of payment reports
 * @param filename Optional custom filename
 */
export function exportPaymentReports(data: PaymentReport[], filename?: string): void {
  const defaultFilename = `payment-reports-${getFormattedDate()}`;
  exportToCSV(data, filename || defaultFilename);
}

/**
 * Export attendance reports as CSV
 * @param data Array of attendance reports
 * @param filename Optional custom filename
 */
export function exportAttendanceReports(data: AttendanceReport[], filename?: string): void {
  const defaultFilename = `attendance-reports-${getFormattedDate()}`;
  exportToCSV(data, filename || defaultFilename);
}
