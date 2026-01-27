import LeaveRequest from '../models/LeaveRequest.js';
import Student from '../models/Student.js';

/**
 * Create Leave Request Controller
 * Students submit leave requests
 * Access: Public (students use regNo + DOB validation)
 */
export const createLeaveRequest = async (req, res) => {
  try {
    const { regNo, dob, startDate, endDate, reason } = req.body;

    // Validate request body
    if (!regNo || !dob || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        message: 'All fields are required (regNo, dob, startDate, endDate, reason)' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    if (end < start) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    // Validate student credentials (regNo + DOB)
    const student = await Student.findOne({ regNo: regNo.trim() });

    if (!student) {
      return res.status(401).json({ 
        message: 'Invalid registration number or date of birth' 
      });
    }

    // Compare DOB
    const storedDOB = new Date(student.dob);
    const providedDOB = new Date(dob);
    
    const storedDate = storedDOB.toISOString().split('T')[0];
    const providedDate = providedDOB.toISOString().split('T')[0];

    if (storedDate !== providedDate) {
      return res.status(401).json({ 
        message: 'Invalid registration number or date of birth' 
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      studentId: student._id,
      studentName: student.name,
      regNo: student.regNo,
      startDate: start,
      endDate: end,
      reason: reason.trim()
    });

    await leaveRequest.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: {
        id: leaveRequest._id,
        studentName: leaveRequest.studentName,
        regNo: leaveRequest.regNo,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        createdAt: leaveRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ 
      message: 'Server error while creating leave request' 
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

      // Compare DOB
      const storedDOB = new Date(student.dob);
      const providedDOB = new Date(dob);
      
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
