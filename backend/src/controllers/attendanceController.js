import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import DailyAttendance from '../models/DailyAttendance.js';

// Allowed subjects list
const ALLOWED_SUBJECTS = ['ME', 'MP', 'DBMS', 'DAA', 'FLAT'];

/**
 * CR Attendance Marking Controller
 * Marks attendance for a specific subject and date
 * Access: CR only (JWT protected)
 */
export const markAttendance = async (req, res) => {
  try {
    const { subject, date, records } = req.body;

    // Validate request body
    if (!subject || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ 
        message: 'Subject, date, and records array are required' 
      });
    }

    // Validate subject against allowed list
    if (!ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ 
        message: `Invalid subject. Allowed subjects: ${ALLOWED_SUBJECTS.join(', ')}` 
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Validate records array
    if (records.length === 0) {
      return res.status(400).json({ 
        message: 'Records array cannot be empty' 
      });
    }

    // Check if attendance already exists for this date + subject
    const existingAttendance = await DailyAttendance.findOne({ date, subject });
    if (existingAttendance) {
      return res.status(400).json({ 
        message: `Attendance already marked for ${subject} on ${date}` 
      });
    }

    // Process each student record
    const dailyRecords = [];
    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        const { studentId, status } = record;

        if (!studentId) {
          errors.push({ studentId: 'unknown', error: 'Student ID is required' });
          continue;
        }

        if (!status || !['Present', 'Absent'].includes(status)) {
          errors.push({ studentId, error: 'Status must be "Present" or "Absent"' });
          continue;
        }

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Add to daily records
        dailyRecords.push({
          studentId,
          status
        });

        // Find or create attendance summary for this student and subject
        let attendanceRecord = await Attendance.findOne({ 
          studentId, 
          subject 
        });

        if (!attendanceRecord) {
          // Create new attendance record
          attendanceRecord = new Attendance({
            studentId,
            subject,
            attended: status === 'Present' ? 1 : 0,
            total: 1
          });
        } else {
          // Update existing record
          attendanceRecord.total += 1;
          if (status === 'Present') {
            attendanceRecord.attended += 1;
          }
        }

        // Save (pre-save hook will calculate percentage and status)
        await attendanceRecord.save();

        results.push({
          studentId,
          regNo: student.regNo,
          name: student.name,
          subject,
          attended: attendanceRecord.attended,
          total: attendanceRecord.total,
          percentage: attendanceRecord.percentage,
          status: attendanceRecord.status
        });

      } catch (error) {
        console.error(`Error processing student ${record.studentId}:`, error);
        errors.push({ 
          studentId: record.studentId, 
          error: 'Failed to update attendance' 
        });
      }
    }

    // Save DailyAttendance document (single source of truth)
    if (dailyRecords.length > 0) {
      await DailyAttendance.create({
        date,
        subject,
        records: dailyRecords,
        markedBy: 'CR'
      });
    }

    // Send response
    res.status(200).json({
      message: 'Attendance marking completed',
      subject,
      date,
      processed: results.length,
      errors: errors.length,
      results,
      failedRecords: errors
    });

  } catch (error) {
    console.error('Attendance marking error:', error);
    res.status(500).json({ 
      message: 'Server error during attendance marking' 
    });
  }
};

/**
 * Student Attendance Lookup Controller
 * Validates registration number and DOB, returns student info and attendance
 * Can optionally filter by specific date
 * This is NOT authentication - it's a read-only lookup
 */
export const lookupAttendance = async (req, res) => {
  try {
    const { regNo, dob, date } = req.body;

    // Validate request body
    if (!regNo || !dob) {
      return res.status(400).json({ 
        message: 'Registration number and date of birth are required' 
      });
    }

    // Validate date format
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Find student by registration number
    const student = await Student.findOne({ regNo: regNo.trim() });

    if (!student) {
      return res.status(401).json({ 
        message: 'Invalid registration number or date of birth' 
      });
    }

    // Compare DOB (normalize to date only, ignore time)
    const storedDOB = new Date(student.dob);
    const providedDOB = new Date(dob);
    
    // Compare year, month, and day only
    const storedDate = storedDOB.toISOString().split('T')[0];
    const providedDate = providedDOB.toISOString().split('T')[0];

    if (storedDate !== providedDate) {
      return res.status(401).json({ 
        message: 'Invalid registration number or date of birth' 
      });
    }

    // If date is provided, return date-specific attendance
    if (date) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ 
          message: 'Invalid date format. Use YYYY-MM-DD' 
        });
      }

      // Get all subjects conducted on this date
      const dailyAttendances = await DailyAttendance.find({ date }).lean();

      if (dailyAttendances.length === 0) {
        return res.status(200).json({
          name: student.name,
          regNo: student.regNo,
          date,
          message: 'No classes conducted on this date',
          subjects: []
        });
      }

      // Extract this student's attendance for the date
      const subjects = dailyAttendances.map(dailyAtt => {
        const studentRecord = dailyAtt.records.find(
          r => r.studentId.toString() === student._id.toString()
        );

        return {
          subject: dailyAtt.subject,
          status: studentRecord ? studentRecord.status : 'Not Marked'
        };
      });

      // Get overall attendance summary
      const attendanceSummary = await Attendance.find({ 
        studentId: student._id 
      }).select('subject attended total percentage status -_id').lean();

      return res.status(200).json({
        name: student.name,
        regNo: student.regNo,
        date,
        subjects,
        overallAttendance: attendanceSummary.map(record => ({
          subject: record.subject,
          attended: record.attended,
          total: record.total,
          percentage: record.percentage,
          status: record.status
        }))
      });
    }

    // Default: return overall attendance summary (original behavior)
    const attendanceRecords = await Attendance.find({ 
      studentId: student._id 
    }).select('subject attended total percentage status -_id');

    // Format attendance data
    const attendance = attendanceRecords.map(record => ({
      subject: record.subject,
      attended: record.attended,
      total: record.total,
      percentage: record.percentage,
      status: record.status
    }));

    // Send response (do NOT expose email)
    res.status(200).json({
      name: student.name,
      regNo: student.regNo,
      attendance: attendance
    });

  } catch (error) {
    console.error('Attendance lookup error:', error);
    res.status(500).json({ 
      message: 'Server error during attendance lookup' 
    });
  }
};

/**
 * Get All Attendance Records (CR Only)
 * Returns all students with their attendance records
 * Access: CR only (JWT protected)
 */
export const getAllAttendance = async (req, res) => {
  try {
    console.log('getAllAttendance called');
    
    // Get all students
    const students = await Student.find().select('_id name regNo').lean();
    console.log(`Found ${students.length} students`);

    if (students.length === 0) {
      console.warn('No students found in database');
      return res.status(200).json({
        count: 0,
        data: [],
        message: 'No students found. Please import students first.'
      });
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.find().lean();
    console.log(`Found ${attendanceRecords.length} attendance records`);

    // Build a map of attendance by studentId
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      const studentId = record.studentId.toString();
      if (!attendanceMap[studentId]) {
        attendanceMap[studentId] = [];
      }
      attendanceMap[studentId].push({
        subject: record.subject,
        attended: record.attended,
        total: record.total,
        percentage: record.percentage,
        status: record.status
      });
    });

    // Combine students with their attendance
    const result = students.map(student => {
      const studentId = student._id.toString();
      const attendance = attendanceMap[studentId] || [];
      
      // Create subject-wise attendance object
      const attendanceBySubject = {};
      ALLOWED_SUBJECTS.forEach(subject => {
        const subjectAttendance = attendance.find(a => a.subject === subject);
        attendanceBySubject[subject] = subjectAttendance || {
          attended: 0,
          total: 0,
          percentage: 0,
          status: 'N/A'
        };
      });

      return {
        regNo: student.regNo,
        name: student.name,
        ...attendanceBySubject
      };
    });

    console.log(`Returning ${result.length} student records`);
    res.status(200).json({
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching attendance records',
      error: error.message
    });
  }
};

/**
 * Get Attendance by Date (CR Only)
 * Returns attendance records for a specific date and optional subject filter
 * Access: CR only (JWT protected)
 */
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date, subject } = req.query;

    // Validate date
    if (!date) {
      return res.status(400).json({ 
        message: 'Date is required (format: YYYY-MM-DD)' 
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Build query
    const query = { date };
    if (subject) {
      if (!ALLOWED_SUBJECTS.includes(subject)) {
        return res.status(400).json({ 
          message: `Invalid subject. Allowed subjects: ${ALLOWED_SUBJECTS.join(', ')}` 
        });
      }
      query.subject = subject;
    }

    // Get daily attendance records for the date (and subject if specified)
    const dailyAttendances = await DailyAttendance.find(query)
      .populate('records.studentId', 'regNo name')
      .lean();

    if (dailyAttendances.length === 0) {
      return res.status(200).json({
        date,
        subject: subject || 'All subjects',
        message: 'No attendance records found for this date',
        data: []
      });
    }

    // Format the response
    const result = [];

    for (const dailyAtt of dailyAttendances) {
      for (const record of dailyAtt.records) {
        // Get student's overall attendance for this subject
        const studentAttendance = await Attendance.findOne({
          studentId: record.studentId._id,
          subject: dailyAtt.subject
        }).lean();

        result.push({
          regNo: record.studentId.regNo,
          name: record.studentId.name,
          subject: dailyAtt.subject,
          status: record.status,
          attended: studentAttendance ? studentAttendance.attended : 0,
          total: studentAttendance ? studentAttendance.total : 0,
          percentage: studentAttendance ? studentAttendance.percentage : 0,
          overallStatus: studentAttendance ? studentAttendance.status : 'N/A'
        });
      }
    }

    // Sort by regNo
    result.sort((a, b) => a.regNo.localeCompare(b.regNo));

    res.status(200).json({
      date,
      subject: subject || 'All subjects',
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching attendance by date' 
    });
  }
};
