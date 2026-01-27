import mongoose from 'mongoose';

// Daily Attendance Model - Single source of truth for date-wise attendance
const dailyAttendanceSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['ME', 'MP', 'DBMS', 'DAA', 'FLAT'],
    trim: true
  },
  records: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
      },
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
      }
    }
  ],
  markedBy: {
    type: String,
    default: 'CR'
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate attendance for same date + subject
dailyAttendanceSchema.index({ date: 1, subject: 1 }, { unique: true });

// Index for faster date-based queries
dailyAttendanceSchema.index({ date: -1 });

const DailyAttendance = mongoose.model('DailyAttendance', dailyAttendanceSchema);

export default DailyAttendance;
