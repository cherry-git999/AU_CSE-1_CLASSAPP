import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';

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
