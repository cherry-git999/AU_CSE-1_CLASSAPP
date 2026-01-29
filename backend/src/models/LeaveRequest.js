import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  regNo: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String,
    default: 'CR'
  }
}, {
  timestamps: true
});

// Index for faster queries
leaveRequestSchema.index({ studentId: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ createdAt: -1 });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
