# Attendance Marking API Implementation Guide

This guide provides detailed instructions for implementing the `/api/attendance/mark` endpoint on the backend.

## Overview

The attendance marking API allows authorized users (teachers, admins) to record student attendance for specific class sessions. The API should be robust, handle errors gracefully, and provide clear feedback to the frontend.

## API Endpoint Specifications

- **URL**: `/api/attendance/mark`
- **Method**: `POST`
- **Authentication**: Required (JWT Bearer Token)

## Implementation Steps

### 1. Create Controller Function

\`\`\`javascript
// controllers/attendanceController.js
const markAttendance = async (req, res) => {
  try {
    // 1. Extract data from request body
    const { 
      studentId, 
      classInstanceId, 
      markedByUserId, 
      timestamp, 
      status = 'present', // Default to present if not provided
      notes 
    } = req.body;

    // 2. Validate required fields
    if (!studentId || !classInstanceId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        validationErrors: {
          ...(studentId ? {} : { studentId: 'Student ID is required' }),
          ...(classInstanceId ? {} : { classInstanceId: 'Class instance ID is required' })
        }
      });
    }

    // 3. Get authenticated user from request (set by auth middleware)
    const authenticatedUserId = req.user.id;
    
    // 4. Use authenticated user ID if markedByUserId is not provided
    const actualMarkedById = markedByUserId || authenticatedUserId;

    // 5. Check if user has permission to mark attendance
    const hasPermission = await checkPermission(authenticatedUserId, 'mark_attendance');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to mark attendance',
        errorCode: 'PERMISSION_DENIED'
      });
    }

    // 6. Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        errorCode: 'STUDENT_NOT_FOUND'
      });
    }

    // 7. Verify class instance exists
    const classInstance = await ClassInstance.findById(classInstanceId);
    if (!classInstance) {
      return res.status(404).json({
        success: false,
        message: 'Class instance not found',
        errorCode: 'CLASS_INSTANCE_NOT_FOUND'
      });
    }

    // 8. Check for existing attendance record
    const existingAttendance = await Attendance.findOne({
      studentId,
      classInstanceId,
      date: new Date(timestamp).toISOString().split('T')[0] // Extract date part
    });

    let attendanceRecord;

    if (existingAttendance) {
      // 9a. Update existing record
      existingAttendance.status = status;
      existingAttendance.notes = notes;
      existingAttendance.recordedBy = actualMarkedById;
      existingAttendance.recordedAt = new Date();
      attendanceRecord = await existingAttendance.save();
    } else {
      // 9b. Create new attendance record
      attendanceRecord = await Attendance.create({
        studentId,
        studentName: student.name, // Store name for easier querying
        classId: classInstance.classId,
        classInstanceId,
        date: new Date(timestamp).toISOString().split('T')[0],
        status,
        notes,
        recordedBy: actualMarkedById,
        recordedAt: new Date()
      });
    }

    // 10. Return success response
    return res.status(200).json({
      success: true,
      studentId,
      attendanceId: attendanceRecord.id,
      message: existingAttendance ? 'Attendance updated successfully' : 'Attendance marked successfully',
      timestamp: attendanceRecord.recordedAt.toISOString(),
      status: attendanceRecord.status
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    
    // 11. Return error response
    return res.status(500).json({
      success: false,
      message: 'Failed to mark attendance: ' + (error.message || 'Unknown error'),
      errorCode: 'SERVER_ERROR'
    });
  }
};
\`\`\`

### 2. Set Up Routes

\`\`\`javascript
// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all attendance routes
router.use(authMiddleware);

// Mark attendance route
router.post('/mark', attendanceController.markAttendance);

// Other attendance routes...
router.get('/student/:studentId', attendanceController.getStudentAttendance);
router.get('/class/:classId', attendanceController.getClassAttendance);

module.exports = router;
\`\`\`

### 3. Create Database Schema

\`\`\`javascript
// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  classInstanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassInstance',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  notes: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index for uniqueness
attendanceSchema.index({ studentId: 1, classInstanceId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
\`\`\`

## Error Handling

The API should handle the following error scenarios:

1. **Missing Required Fields**: Return 400 with validation errors
2. **Student Not Found**: Return 404 with STUDENT_NOT_FOUND error code
3. **Class Instance Not Found**: Return 404 with CLASS_INSTANCE_NOT_FOUND error code
4. **Permission Denied**: Return 403 with PERMISSION_DENIED error code
5. **Server Errors**: Return 500 with SERVER_ERROR error code

## Testing

Here are some test cases to verify the API implementation:

1. **Valid Attendance Marking**: Should return success with attendance ID
2. **Missing Student ID**: Should return validation error
3. **Missing Class Instance ID**: Should return validation error
4. **Invalid Student ID**: Should return STUDENT_NOT_FOUND error
5. **Invalid Class Instance ID**: Should return CLASS_INSTANCE_NOT_FOUND error
6. **Unauthorized User**: Should return 401 Unauthorized
7. **User Without Permission**: Should return PERMISSION_DENIED error
8. **Duplicate Attendance**: Should update existing record and return success

## Performance Considerations

1. **Indexing**: Ensure proper indexes on the Attendance collection for efficient queries
2. **Caching**: Consider caching frequently accessed data like class instances
3. **Batch Processing**: Implement batch attendance marking for multiple students

## Security Considerations

1. **Input Validation**: Validate all input data to prevent injection attacks
2. **Authorization**: Ensure only authorized users can mark attendance
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Audit Logging**: Log all attendance marking actions for audit purposes

## Integration with Frontend

The frontend currently expects the following response structure:

\`\`\`typescript
interface MarkAttendanceSuccessResponse {
  success: boolean;
  studentId: string;
  attendanceId: string;
  message?: string;
  timestamp: string;
  status: "present" | "absent" | "late" | "excused";
}
\`\`\`

Ensure your implementation returns this exact structure for successful responses.
