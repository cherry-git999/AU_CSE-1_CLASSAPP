import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './src/models/Student.js';
import Attendance from './src/models/Attendance.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/classapp';

// Sample data
const sampleStudents = [
  {
    name: "John Doe",
    regNo: "CSE001",
    dob: new Date("2002-02-25"),
    email: "john.doe@example.com"
  },
  {
    name: "Jane Smith",
    regNo: "CSE002",
    dob: new Date("2002-05-15"),
    email: "jane.smith@example.com"
  },
  {
    name: "Mike Johnson",
    regNo: "CSE003",
    dob: new Date("2002-08-10"),
    email: "mike.johnson@example.com"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Student.deleteMany({});
    // await Attendance.deleteMany({});
    // console.log('Cleared existing data');

    // Insert students
    const students = await Student.insertMany(sampleStudents);
    console.log(`✅ Inserted ${students.length} students`);

    // Create attendance records for each student
    const attendanceData = [];
    
    for (const student of students) {
      // Subject 1: DSA
      attendanceData.push({
        studentId: student._id,
        subject: "Data Structures & Algorithms",
        attended: 41,
        total: 50
      });

      // Subject 2: DBMS
      attendanceData.push({
        studentId: student._id,
        subject: "Database Management Systems",
        attended: 36,
        total: 50
      });

      // Subject 3: OS
      attendanceData.push({
        studentId: student._id,
        subject: "Operating Systems",
        attended: 44,
        total: 50
      });

      // Subject 4: CN
      attendanceData.push({
        studentId: student._id,
        subject: "Computer Networks",
        attended: 30,
        total: 50
      });
    }

    const attendance = await Attendance.insertMany(attendanceData);
    console.log(`✅ Inserted ${attendance.length} attendance records`);

    // Display summary
    console.log('\n📊 Sample Data Summary:');
    console.log('========================');
    for (const student of students) {
      console.log(`\nStudent: ${student.name}`);
      console.log(`RegNo: ${student.regNo}`);
      console.log(`DOB: ${student.dob.toISOString().split('T')[0]}`);
      console.log(`Email: ${student.email}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n🧪 Test the API with:');
    console.log('POST http://localhost:5000/api/attendance/lookup');
    console.log('Body: { "regNo": "CSE001", "dob": "2002-02-25" }');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
