import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
  attended: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Eligible', 'Not Eligible', 'At Risk'],
    default: 'Eligible'
  }
}, {
  timestamps: true
});

// Index for faster lookups
attendanceSchema.index({ studentId: 1 });

// Calculate percentage before saving
attendanceSchema.pre('save', function(next) {
  if (this.total > 0) {
    this.percentage = Math.round((this.attended / this.total) * 100);
    
    // Determine status based on percentage
    if (this.percentage >= 75) {
      this.status = 'Eligible';
    } else if (this.percentage >= 65) {
      this.status = 'At Risk';
    } else {
      this.status = 'Not Eligible';
    }
  } else {
    this.percentage = 0;
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
