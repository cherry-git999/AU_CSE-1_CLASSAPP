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
    const existingAttendance = await DailyAttendance.findOne({ date, subject })
      .populate('records.studentId', 'name regNo');
    
    if (existingAttendance) {
      // Return existing attendance data for edit mode
      const records = existingAttendance.records.map(record => ({
        studentId: record.studentId._id,
        name: record.studentId.name,
        regNo: record.studentId.regNo,
        status: record.status
      }));

      return res.status(409).json({ 
        message: `Attendance already marked for ${subject} on ${date}`,
        alreadyMarked: true,
        date,
        subject,
        records,
        markedBy: existingAttendance.markedBy,
        markedAt: existingAttendance.createdAt
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
 * Update Existing Attendance Controller
 * Updates attendance for a specific subject and date that was already marked
 * Access: CR only (JWT protected)
 */
export const updateAttendance = async (req, res) => {
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

    // Check if attendance exists for this date + subject
    const existingDailyAttendance = await DailyAttendance.findOne({ date, subject });
    if (!existingDailyAttendance) {
      return res.status(404).json({ 
        message: `No attendance found for ${subject} on ${date}. Please mark attendance first.` 
      });
    }

    // Create a map of old records for comparison
    const oldRecordsMap = new Map();
    existingDailyAttendance.records.forEach(record => {
      oldRecordsMap.set(record.studentId.toString(), record.status);
    });

    // Process each student record
    const dailyRecords = [];
    const results = [];
    const errors = [];
    const changedRecords = [];

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

        // Check if status changed
        const oldStatus = oldRecordsMap.get(studentId.toString());
        const statusChanged = oldStatus !== status;

        if (statusChanged) {
          changedRecords.push({
            studentId,
            regNo: student.regNo,
            name: student.name,
            oldStatus,
            newStatus: status
          });

          // Find and update attendance summary for this student and subject
          let attendanceRecord = await Attendance.findOne({ 
            studentId, 
            subject 
          });

          if (!attendanceRecord) {
            // This shouldn't happen, but handle it gracefully
            attendanceRecord = new Attendance({
              studentId,
              subject,
              attended: status === 'Present' ? 1 : 0,
              total: 1
            });
          } else {
            // Update the record based on status change
            if (oldStatus === 'Present' && status === 'Absent') {
              // Changed from Present to Absent - decrease attended
              attendanceRecord.attended = Math.max(0, attendanceRecord.attended - 1);
            } else if (oldStatus === 'Absent' && status === 'Present') {
              // Changed from Absent to Present - increase attended
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
            status: attendanceRecord.status,
            changed: true
          });
        } else {
          // No change, but include in results
          const attendanceRecord = await Attendance.findOne({ studentId, subject });
          results.push({
            studentId,
            regNo: student.regNo,
            name: student.name,
            subject,
            attended: attendanceRecord?.attended || 0,
            total: attendanceRecord?.total || 0,
            percentage: attendanceRecord?.percentage || 0,
            status: attendanceRecord?.status || 'N/A',
            changed: false
          });
        }

      } catch (error) {
        console.error(`Error processing student ${record.studentId}:`, error);
        errors.push({ 
          studentId: record.studentId, 
          error: 'Failed to update attendance' 
        });
      }
    }

    // Update DailyAttendance document
    existingDailyAttendance.records = dailyRecords;
    await existingDailyAttendance.save();

    // Send response
    res.status(200).json({
      message: 'Attendance updated successfully',
      subject,
      date,
      processed: results.length,
      changed: changedRecords.length,
      errors: errors.length,
      results,
      changedRecords,
      failedRecords: errors
    });

  } catch (error) {
    console.error('Attendance update error:', error);
    res.status(500).json({ 
      message: 'Server error during attendance update' 
    });
  }
};

/**
 * Get Attendance for Specific Date and Subject
 * Returns attendance records if already marked
 * Access: CR only (JWT protected)
 */
export const getAttendanceForEdit = async (req, res) => {
  try {
    const { date, subject } = req.query;

    // Validate query parameters
    if (!date || !subject) {
      return res.status(400).json({ 
        message: 'Date and subject are required' 
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

    // Find existing attendance
    const existingAttendance = await DailyAttendance.findOne({ date, subject })
      .populate('records.studentId', 'name regNo');

    if (!existingAttendance) {
      return res.status(404).json({ 
        message: 'No attendance found for this date and subject',
        alreadyMarked: false
      });
    }

    // Format the response
    const records = existingAttendance.records.map(record => ({
      studentId: record.studentId._id,
      name: record.studentId.name,
      regNo: record.studentId.regNo,
      status: record.status
    }));

    res.status(200).json({
      alreadyMarked: true,
      date,
      subject,
      records,
      markedBy: existingAttendance.markedBy,
      markedAt: existingAttendance.createdAt
    });

  } catch (error) {
    console.error('Get attendance for edit error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching attendance' 
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
 * Returns attendance records for a specific date and subject
 * Shows all students with their attendance status for that day
 * Access: CR only (JWT protected)
 */
export const getAttendanceByDate = async (req, res) => {
  try {
    console.log('getAttendanceByDate called with:', req.query);
    
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

    // Validate subject
    if (!subject) {
      return res.status(400).json({ 
        message: 'Subject is required' 
      });
    }

    if (!ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ 
        message: `Invalid subject. Allowed subjects: ${ALLOWED_SUBJECTS.join(', ')}` 
      });
    }

    // Get daily attendance record for the specific date and subject
    const dailyAttendance = await DailyAttendance.findOne({ date, subject })
      .populate('records.studentId', 'regNo name')
      .lean();

    if (!dailyAttendance) {
      return res.status(200).json({
        date,
        subject,
        message: `No attendance records found for ${subject} on ${date}`,
        data: []
      });
    }

    console.log(`Found daily attendance with ${dailyAttendance.records.length} records`);

    // Build result array with attendance data
    const result = [];

    for (const record of dailyAttendance.records) {
      if (!record.studentId) {
        console.warn('Record missing studentId:', record);
        continue;
      }

      // Get student's overall attendance for this subject
      const studentAttendance = await Attendance.findOne({
        studentId: record.studentId._id,
        subject: subject
      }).lean();

      result.push({
        regNo: record.studentId.regNo,
        name: record.studentId.name,
        subject: subject,
        status: record.status, // Present or Absent for this specific date
        attended: studentAttendance ? studentAttendance.attended : 0,
        total: studentAttendance ? studentAttendance.total : 0,
        percentage: studentAttendance ? studentAttendance.percentage : 0,
        overallStatus: studentAttendance ? studentAttendance.status : 'N/A'
      });
    }

    // Sort by regNo for consistent display
    result.sort((a, b) => a.regNo.localeCompare(b.regNo));

    console.log(`Returning ${result.length} student records`);

    res.status(200).json({
      date,
      subject,
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching attendance by date',
      error: error.message
    });
  }
};

/**
 * Get Attendance Summary by Date Range (CR Only)
 * Returns aggregated attendance for students within a date range
 * Supports single subject or all subjects
 * Access: CR only (JWT protected)
 */
export const getAttendanceSummary = async (req, res) => {
  try {
    console.log('getAttendanceSummary called with:', req.query);
    
    const { fromDate, toDate, subject } = req.query;

    // Validate dates
    if (!fromDate || !toDate) {
      return res.status(400).json({ 
        message: 'Both fromDate and toDate are required (format: YYYY-MM-DD)' 
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ 
        message: 'fromDate cannot be after toDate' 
      });
    }

    // Validate subject
    if (!subject) {
      return res.status(400).json({ 
        message: 'Subject is required (use specific subject or "ALL")' 
      });
    }

    if (subject !== 'ALL' && !ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ 
        message: `Invalid subject. Use: ${ALLOWED_SUBJECTS.join(', ')} or "ALL"` 
      });
    }

    // Get all students
    const students = await Student.find().sort({ regNo: 1 }).lean();
    
    if (students.length === 0) {
      return res.status(200).json({
        fromDate,
        toDate,
        subject,
        message: 'No students found in the system',
        data: []
      });
    }

    console.log(`Found ${students.length} students`);

    // Get daily attendance records in the date range
    const dailyQuery = {
      date: { $gte: fromDate, $lte: toDate }
    };
    
    if (subject !== 'ALL') {
      dailyQuery.subject = subject;
    }

    const dailyRecords = await DailyAttendance.find(dailyQuery).lean();
    console.log(`Found ${dailyRecords.length} daily attendance records in range`);

    const result = [];

    if (subject === 'ALL') {
      // ALL subjects: return subject-wise breakdown + overall average
      for (const student of students) {
        const studentData = {
          regNo: student.regNo,
          name: student.name,
          subjects: {},
          overall: { total: 0, attended: 0, percentage: 0 }
        };

        let totalClassesAllSubjects = 0;
        let totalAttendedAllSubjects = 0;

        for (const subj of ALLOWED_SUBJECTS) {
          // Count classes for this subject in date range
          const subjectRecords = dailyRecords.filter(dr => dr.subject === subj);
          const total = subjectRecords.length;
          
          // Count attended classes
          let attended = 0;
          for (const dr of subjectRecords) {
            const record = dr.records.find(r => r.studentId.toString() === student._id.toString());
            if (record && record.status === 'Present') {
              attended++;
            }
          }

          const percentage = total > 0 ? (attended / total) * 100 : 0;
          
          // Get overall status from Attendance collection
          const attendance = await Attendance.findOne({
            studentId: student._id,
            subject: subj
          }).lean();

          studentData.subjects[subj] = {
            total,
            attended,
            percentage: parseFloat(percentage.toFixed(2)),
            status: attendance ? attendance.status : 'N/A'
          };

          totalClassesAllSubjects += total;
          totalAttendedAllSubjects += attended;
        }

        // Calculate overall percentage
        const overallPercentage = totalClassesAllSubjects > 0 
          ? (totalAttendedAllSubjects / totalClassesAllSubjects) * 100 
          : 0;

        studentData.overall = {
          total: totalClassesAllSubjects,
          attended: totalAttendedAllSubjects,
          percentage: parseFloat(overallPercentage.toFixed(2))
        };

        result.push(studentData);
      }
    } else {
      // Single subject
      for (const student of students) {
        // Count classes for this subject in date range
        const subjectRecords = dailyRecords.filter(dr => dr.subject === subject);
        const total = subjectRecords.length;
        
        // Count attended classes
        let attended = 0;
        for (const dr of subjectRecords) {
          const record = dr.records.find(r => r.studentId.toString() === student._id.toString());
          if (record && record.status === 'Present') {
            attended++;
          }
        }

        const percentage = total > 0 ? (attended / total) * 100 : 0;
        
        // Get overall status from Attendance collection
        const attendance = await Attendance.findOne({
          studentId: student._id,
          subject: subject
        }).lean();

        result.push({
          regNo: student.regNo,
          name: student.name,
          total,
          attended,
          percentage: parseFloat(percentage.toFixed(2)),
          status: attendance ? attendance.status : 'N/A'
        });
      }
    }

    console.log(`Returning ${result.length} student records`);

    res.status(200).json({
      fromDate,
      toDate,
      subject,
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching attendance summary',
      error: error.message
    });
  }
};

/**
 * Export Attendance as CSV (CR Only)
 * Generates and downloads CSV file for attendance data
 * Access: CR only (JWT protected)
 */
export const exportAttendanceCSV = async (req, res) => {
  try {
    console.log('exportAttendanceCSV called with:', req.query);
    
    const { fromDate, toDate, subject, format } = req.query;

    // Validate format
    if (format && format !== 'csv') {
      return res.status(400).json({ 
        message: 'Only CSV format is supported currently' 
      });
    }

    // Validate dates
    if (!fromDate || !toDate) {
      return res.status(400).json({ 
        message: 'Both fromDate and toDate are required (format: YYYY-MM-DD)' 
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Validate subject
    if (!subject) {
      return res.status(400).json({ 
        message: 'Subject is required (use specific subject or "ALL")' 
      });
    }

    if (subject !== 'ALL' && !ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({ 
        message: `Invalid subject. Use: ${ALLOWED_SUBJECTS.join(', ')} or "ALL"` 
      });
    }

    // Get all students
    const students = await Student.find().sort({ regNo: 1 }).lean();
    
    if (students.length === 0) {
      return res.status(400).json({
        message: 'No students found in the system'
      });
    }

    // Get daily attendance records in the date range
    const dailyQuery = {
      date: { $gte: fromDate, $lte: toDate }
    };
    
    if (subject !== 'ALL') {
      dailyQuery.subject = subject;
    }

    const dailyRecords = await DailyAttendance.find(dailyQuery).lean();

    let csvContent = '';

    if (subject === 'ALL') {
      // CSV for all subjects
      const headers = ['RegNo', 'Name'];
      ALLOWED_SUBJECTS.forEach(subj => {
        headers.push(`${subj} Total`, `${subj} Attended`, `${subj} %`, `${subj} Status`);
      });
      headers.push('Overall Total', 'Overall Attended', 'Overall %');
      csvContent += headers.join(',') + '\n';

      // Process each student
      for (const student of students) {
        const row = [student.regNo, `"${student.name}"`];
        
        let totalClassesAllSubjects = 0;
        let totalAttendedAllSubjects = 0;

        for (const subj of ALLOWED_SUBJECTS) {
          const subjectRecords = dailyRecords.filter(dr => dr.subject === subj);
          const total = subjectRecords.length;
          
          let attended = 0;
          for (const dr of subjectRecords) {
            const record = dr.records.find(r => r.studentId.toString() === student._id.toString());
            if (record && record.status === 'Present') {
              attended++;
            }
          }

          const percentage = total > 0 ? (attended / total) * 100 : 0;
          
          const attendance = await Attendance.findOne({
            studentId: student._id,
            subject: subj
          }).lean();

          row.push(total, attended, percentage.toFixed(2), attendance ? attendance.status : 'N/A');

          totalClassesAllSubjects += total;
          totalAttendedAllSubjects += attended;
        }

        const overallPercentage = totalClassesAllSubjects > 0 
          ? (totalAttendedAllSubjects / totalClassesAllSubjects) * 100 
          : 0;

        row.push(totalClassesAllSubjects, totalAttendedAllSubjects, overallPercentage.toFixed(2));

        csvContent += row.join(',') + '\n';
      }
    } else {
      // CSV for single subject
      csvContent += 'RegNo,Name,Total,Attended,Percentage,Status\n';

      for (const student of students) {
        const subjectRecords = dailyRecords.filter(dr => dr.subject === subject);
        const total = subjectRecords.length;
        
        let attended = 0;
        for (const dr of subjectRecords) {
          const record = dr.records.find(r => r.studentId.toString() === student._id.toString());
          if (record && record.status === 'Present') {
            attended++;
          }
        }

        const percentage = total > 0 ? (attended / total) * 100 : 0;
        
        const attendance = await Attendance.findOne({
          studentId: student._id,
          subject: subject
        }).lean();

        const status = attendance ? attendance.status : 'N/A';

        csvContent += `${student.regNo},"${student.name}",${total},${attended},${percentage.toFixed(2)},${status}\n`;
      }
    }

    // Set response headers for CSV download
    const filename = `attendance_${subject}_${fromDate}_to_${toDate}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    console.log(`Sending CSV file: ${filename}`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export attendance CSV error:', error);
    res.status(500).json({ 
      message: 'Server error while exporting attendance',
      error: error.message
    });
  }
};

/**
 * Reset All Attendance Data (CR Only)
 * Deletes all documents from attendance and dailyattendances collections
 * DOES NOT delete students or announcements
 * Access: CR only (JWT protected)
 * For testing purposes only
 */
export const resetAttendance = async (req, res) => {
  try {
    console.log('resetAttendance called - WARNING: Deleting all attendance data');

    // Delete all attendance records (cumulative data)
    const attendanceResult = await Attendance.deleteMany({});
    console.log(`Deleted ${attendanceResult.deletedCount} documents from attendance collection`);

    // Delete all daily attendance records
    const dailyResult = await DailyAttendance.deleteMany({});
    console.log(`Deleted ${dailyResult.deletedCount} documents from dailyattendances collection`);

    res.status(200).json({
      message: 'All attendance data has been reset successfully',
      deleted: {
        attendance: attendanceResult.deletedCount,
        dailyAttendances: dailyResult.deletedCount
      }
    });

  } catch (error) {
    console.error('Reset attendance error:', error);
    res.status(500).json({ 
      message: 'Server error while resetting attendance data',
      error: error.message
    });
  }
};
