import LeaveRequest from '../models/LeaveRequest.js';
import Student from '../models/Student.js';

/**
 * Create Leave Request Controller
 * Students submit leave requests using only regNo
 * Access: Public (no authentication required)
 */
export const createLeaveRequest = async (req, res) => {
  console.log('\n=== NEW LEAVE REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { regNo, startDate, endDate, reason } = req.body;

    // Validate fields
    if (!regNo) {
      console.error('Missing regNo');
      return res.status(400).json({ message: 'Registration number is required' });
    }
    if (!startDate) {
      console.error('Missing startDate');
      return res.status(400).json({ message: 'Start date is required' });
    }
    if (!endDate) {
      console.error('Missing endDate');
      return res.status(400).json({ message: 'End date is required' });
    }
    if (!reason) {
      console.error('Missing reason');
      return res.status(400).json({ message: 'Reason is required' });
    }

    // Find student
    console.log('Searching for student with regNo:', regNo);
    const student = await Student.findOne({ regNo: regNo.trim() });
    
    if (!student) {
      console.error('Student not found');
      return res.status(404).json({ message: 'Student not found with registration number: ' + regNo });
    }

    console.log('Found student:', student.name, student._id);

    // Parse dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    console.log('Parsed dates:', { start: startDateObj, end: endDateObj });

    // Create leave request object
    const leaveData = {
      studentId: student._id,
      studentName: student.name,
      regNo: student.regNo,
      startDate: startDateObj,
      endDate: endDateObj,
      reason: reason.trim(),
      status: 'Pending'
    };
    
    console.log('Creating leave request with data:', leaveData);
    
    const leaveRequest = new LeaveRequest(leaveData);
    
    console.log('Attempting to save...');
    const savedLeave = await leaveRequest.save();
    
    console.log('✅ SUCCESS! Saved leave request:', savedLeave._id);

    return res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: {
        id: savedLeave._id,
        studentName: savedLeave.studentName,
        regNo: savedLeave.regNo,
        startDate: savedLeave.startDate,
        endDate: savedLeave.endDate,
        reason: savedLeave.reason,
        status: savedLeave.status
      }
    });

  } catch (error) {
    console.error('\n❌ FULL ERROR:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({ 
      message: 'Server error: ' + error.message,
      error: error.message
    });
  }
};

/**
 * Get Leave Requests Controller
 * Retrieves all leave requests (CR) or student's own requests (Students)
 * Access: Public for students (with regNo + DOB), CR gets all
 */
export const getLeaveRequests = async (req, res) => {
  try {
    const { regNo, dob } = req.query;

    // If regNo and DOB provided, return only that student's requests
    if (regNo && dob) {
      // Validate student
      const student = await Student.findOne({ regNo: regNo.trim() });

      if (!student) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Compare DOB - handle both Date objects and strings
      const storedDOB = new Date(student.dob);
      const providedDOB = new Date(dob);
      
      // Check if dates are valid
      if (isNaN(storedDOB.getTime()) || isNaN(providedDOB.getTime())) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }
      
      const storedDate = storedDOB.toISOString().split('T')[0];
      const providedDate = providedDOB.toISOString().split('T')[0];

      if (storedDate !== providedDate) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      // Fetch student's leave requests
      const leaveRequests = await LeaveRequest.find({ studentId: student._id })
        .sort({ createdAt: -1 })
        .select('studentName regNo startDate endDate reason status createdAt reviewedAt');

      return res.status(200).json({
        count: leaveRequests.length,
        leaveRequests
      });
    }

    // Otherwise, return all leave requests (for CR)
    const leaveRequests = await LeaveRequest.find()
      .sort({ createdAt: -1 })
      .select('studentName regNo startDate endDate reason status createdAt reviewedAt');

    res.status(200).json({
      count: leaveRequests.length,
      leaveRequests
    });

  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching leave requests' 
    });
  }
};

/**
 * Update Leave Request Status Controller
 * CR approves or rejects leave requests
 * Access: CR only (JWT protected)
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ 
        message: 'Leave request ID is required' 
      });
    }

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be either "Approved" or "Rejected"' 
      });
    }

    // Find and update the leave request
    const leaveRequest = await LeaveRequest.findById(id);

    if (!leaveRequest) {
      return res.status(404).json({ 
        message: 'Leave request not found' 
      });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ 
        message: `Leave request has already been ${leaveRequest.status.toLowerCase()}` 
      });
    }

    leaveRequest.status = status;
    leaveRequest.reviewedAt = new Date();
    await leaveRequest.save();

    res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest: {
        id: leaveRequest._id,
        studentName: leaveRequest.studentName,
        regNo: leaveRequest.regNo,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        reviewedAt: leaveRequest.reviewedAt
      }
    });

  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ 
      message: 'Server error while updating leave status' 
    });
  }
};

/**
 * Delete Leave Request Controller
 * CR can delete leave requests
 * Access: CR only (JWT protected)
 */
export const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: 'Leave request ID is required' 
      });
    }

    const leaveRequest = await LeaveRequest.findByIdAndDelete(id);

    if (!leaveRequest) {
      return res.status(404).json({ 
        message: 'Leave request not found' 
      });
    }

    res.status(200).json({
      message: 'Leave request deleted successfully'
    });

  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting leave request' 
    });
  }
};
