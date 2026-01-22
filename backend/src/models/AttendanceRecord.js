import mongoose from 'mongoose';

// This model stores individual attendance entries for each class/date
const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  present: {
    type: Boolean,
    required: true
  },
  markedBy: {
    type: String,
    default: 'CR'
  }
}, {
  timestamps: true
});

// Compound index for faster lookups
attendanceRecordSchema.index({ studentId: 1, subject: 1, date: 1 });
attendanceRecordSchema.index({ date: -1 });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

export default AttendanceRecord;
