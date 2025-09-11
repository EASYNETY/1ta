// utils/attendance-analytics.ts
export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  class: {
    id: string;
    name: string;
  };
  markedBy?: {
    id: string;
    name: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: {
    records: AttendanceRecord[];
    summary: {
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// API service to fetch attendance data
export class AttendanceAnalyticsService {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async fetchAttendanceData(params: {
    startDate?: string;
    endDate?: string;
    courseId?: string;
    classId?: string;
    studentId?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<AttendanceResponse> {
    const queryParams = new URLSearchParams();
    
    // Default to last 6 months if no date range provided
    if (!params.startDate && !params.endDate) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      params.startDate = startDate.toISOString().split('T')[0];
      params.endDate = endDate.toISOString().split('T')[0];
    }

    // Add all valid parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    // Set high limit to get all records for analytics (or paginate if needed)
    if (!params.limit) {
      queryParams.set('limit', '1000');
    }

    const response = await fetch(`${this.baseUrl}/api/attendance?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance data: ${response.statusText}`);
    }

    return response.json();
  }

  // Process attendance data for analytics
  async getAttendanceAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    courseId?: string;
  }) {
    try {
      const attendanceData = await this.fetchAttendanceData(params);
      const records = attendanceData.data.records;

      return {
        // Overall statistics
        overallStats: this.calculateOverallStats(records),
        
        // Attendance trends by month
        attendanceTrends: this.calculateAttendanceTrends(records),
        
        // Attendance by day of week
        attendanceByDay: this.calculateAttendanceByDay(records),
        
        // Attendance status distribution
        statusDistribution: this.calculateStatusDistribution(records),
        
        // Attendance by class
        attendanceByClass: this.calculateAttendanceByClass(records),
        
        // Student attendance patterns
        studentPatterns: this.calculateStudentPatterns(records),
        
        // Recent attendance summary
        recentSummary: attendanceData.data.summary
      };
    } catch (error) {
      console.error('Error processing attendance analytics:', error);
      throw error;
    }
  }

  private calculateOverallStats(records: AttendanceRecord[]) {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;

    return {
      totalRecords: total,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      excusedCount: excused
    };
  }

  private calculateAttendanceTrends(records: AttendanceRecord[]) {
    const monthlyData = new Map<string, { total: number; present: number }>();

    records.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, present: 0 });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      monthData.total++;
      if (record.status === 'present') {
        monthData.present++;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        date: month,
        value: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        total: data.total,
        present: data.present
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6); // Last 6 months
  }

  private calculateAttendanceByDay(records: AttendanceRecord[]) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = new Map<number, { total: number; present: number }>();

    // Initialize all days
    dayNames.forEach((_, index) => {
      dayData.set(index, { total: 0, present: 0 });
    });

    records.forEach(record => {
      const dayOfWeek = new Date(record.date).getDay();
      const data = dayData.get(dayOfWeek)!;
      data.total++;
      if (record.status === 'present') {
        data.present++;
      }
    });

    return dayNames.map((name, index) => {
      const data = dayData.get(index)!;
      return {
        name,
        value: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        total: data.total,
        present: data.present
      };
    });
  }

  private calculateStatusDistribution(records: AttendanceRecord[]) {
    const statusCount = new Map<string, number>();
    
    records.forEach(record => {
      const count = statusCount.get(record.status) || 0;
      statusCount.set(record.status, count + 1);
    });

    return Array.from(statusCount.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }

  private calculateAttendanceByClass(records: AttendanceRecord[]) {
    const classData = new Map<string, { total: number; present: number; className: string }>();

    records.forEach(record => {
      const classId = record.class.id;
      const className = record.class.name;
      
      if (!classData.has(classId)) {
        classData.set(classId, { total: 0, present: 0, className });
      }
      
      const data = classData.get(classId)!;
      data.total++;
      if (record.status === 'present') {
        data.present++;
      }
    });

    return Array.from(classData.entries())
      .map(([classId, data]) => ({
        classId,
        className: data.className,
        attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        totalSessions: data.total,
        presentSessions: data.present
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 10); // Top 10 classes
  }

  private calculateStudentPatterns(records: AttendanceRecord[]) {
    const studentData = new Map<string, { 
      total: number; 
      present: number; 
      late: number; 
      absent: number;
      name: string;
      email: string;
    }>();

    records.forEach(record => {
      const studentId = record.student.id;
      
      if (!studentData.has(studentId)) {
        studentData.set(studentId, { 
          total: 0, 
          present: 0, 
          late: 0, 
          absent: 0,
          name: record.student.name,
          email: record.student.email
        });
      }
      
      const data = studentData.get(studentId)!;
      data.total++;
      
      switch (record.status) {
        case 'present':
          data.present++;
          break;
        case 'late':
          data.late++;
          break;
        case 'absent':
          data.absent++;
          break;
      }
    });

    return Array.from(studentData.entries())
      .map(([studentId, data]) => ({
        studentId,
        studentName: data.name,
        studentEmail: data.email,
        attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        totalSessions: data.total,
        presentSessions: data.present,
        lateSessions: data.late,
        absentSessions: data.absent
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }
}

// Hook for React components
import { useState, useEffect } from 'react';

export function useAttendanceAnalytics(
  baseUrl: string, 
  authToken: string, 
  params?: { startDate?: string; endDate?: string; courseId?: string }
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!baseUrl || !authToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const service = new AttendanceAnalyticsService(baseUrl, authToken);
      const analytics = await service.getAttendanceAnalytics(params);
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance analytics');
      console.error('Attendance analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [baseUrl, authToken, JSON.stringify(params)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Enhanced analytics page integration
export function integrateAttendanceIntoAnalytics(existingStats: any, attendanceAnalytics: any) {
  if (!attendanceAnalytics) return existingStats;

  return {
    ...existingStats,
    attendanceStats: {
      averageRate: attendanceAnalytics.overallStats.attendanceRate,
      totalRecords: attendanceAnalytics.overallStats.totalRecords,
      rateTrends: attendanceAnalytics.attendanceTrends,
      byDayOfWeek: attendanceAnalytics.attendanceByDay,
      statusDistribution: attendanceAnalytics.statusDistribution,
      byClass: attendanceAnalytics.attendanceByClass,
      studentPatterns: attendanceAnalytics.studentPatterns,
      recentSummary: attendanceAnalytics.recentSummary
    }
  };
}
