import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import AttendanceRecord from '../models/AttendanceRecord.js';

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

    // Validate date format
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
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

    // Process each student record
    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        const { studentId, present } = record;

        if (!studentId) {
          errors.push({ studentId: 'unknown', error: 'Student ID is required' });
          continue;
        }

        if (typeof present !== 'boolean') {
          errors.push({ studentId, error: 'Present field must be boolean' });
          continue;
        }

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Find or create attendance record for this student and subject
        let attendanceRecord = await Attendance.findOne({ 
          studentId, 
          subject 
        });

        if (!attendanceRecord) {
          // Create new attendance record
          attendanceRecord = new Attendance({
            studentId,
            subject,
            attended: present ? 1 : 0,
            total: 1
          });
        } else {
          // Update existing record
          attendanceRecord.total += 1;
          if (present) {
            attendanceRecord.attended += 1;
          }
        }

        // Save (pre-save hook will calculate percentage and status)
        await attendanceRecord.save();

        // Also create individual attendance record for date tracking
        await AttendanceRecord.create({
          studentId,
          subject,
          date: attendanceDate,
          present,
          markedBy: 'CR'
        });

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
 * This is NOT authentication - it's a read-only lookup
 */
export const lookupAttendance = async (req, res) => {
  try {
    const { regNo, dob } = req.body;

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

    // Fetch attendance records for this student
    const attendanceRecords = await Attendance.find({ 
      studentId: student._id 
    }).select('subject attended total percentage status -_id');

    // Fetch detailed date-wise attendance records
    const detailedRecords = await AttendanceRecord.find({
      studentId: student._id
    }).select('subject date present -_id').sort({ date: -1 }).lean();

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
      attendance: attendance,
      detailedRecords: detailedRecords
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
    // Get all students
    const students = await Student.find().select('_id name regNo').lean();

    // Get all attendance records
    const attendanceRecords = await Attendance.find().lean();

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

    res.status(200).json({
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching attendance records' 
    });
  }
};
