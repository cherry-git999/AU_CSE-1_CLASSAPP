import fs from "fs";
import path from "path";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../src/models/Student.js";
import Attendance from "../src/models/Attendance.js";
import DailyAttendance from "../src/models/DailyAttendance.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

const csvFilePath = path.join(process.cwd(), "data", "students.csv");

const students = [];

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const importStudents = async () => {
  try {
    await connectDB();

    console.log("\n📋 Reading CSV file...");

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        if (!row.Name || !row.RegNo || !row.DOB || !row.Email) {
          return;
        }

        students.push({
          name: row.Name.trim(),
          regNo: row.RegNo.trim(),
          dob: new Date(row.DOB),
          email: row.Email.trim()
        });
      })
      .on("end", async () => {
        try {
          let newCount = 0;
          let updatedCount = 0;
          let unchangedCount = 0;

          // Process each student - update if exists, create if new
          for (const studentData of students) {
            const existingStudent = await Student.findOne({ regNo: studentData.regNo });
            
            if (existingStudent) {
              // Check if any data changed
              const nameChanged = existingStudent.name !== studentData.name;
              const dobChanged = existingStudent.dob?.getTime() !== studentData.dob.getTime();
              const emailChanged = existingStudent.email !== studentData.email;

              if (nameChanged || dobChanged || emailChanged) {
                // Update existing student (keeps same _id, preserves attendance links)
                existingStudent.name = studentData.name;
                existingStudent.dob = studentData.dob;
                existingStudent.email = studentData.email;
                await existingStudent.save();
                updatedCount++;
              } else {
                unchangedCount++;
              }
            } else {
              // Create new student
              await Student.create(studentData);
              newCount++;
            }
          }

          console.log(`\n✅ Import completed successfully!`);
          console.log(`   📊 New students: ${newCount}`);
          console.log(`   🔄 Updated students: ${updatedCount}`);
          console.log(`   ✓  Unchanged students: ${unchangedCount}`);
          console.log(`   📝 Total in CSV: ${students.length}`);
          console.log("\n✨ Attendance records preserved for all existing students!");
        } catch (error) {
          console.error("❌ Import failed:", error.message);
          process.exit(1);
        } finally {
          mongoose.connection.close();
          console.log("\n🔌 Database connection closed");
        }
      })
      .on("error", (error) => {
        console.error("❌ CSV read failed:", error.message);
        mongoose.connection.close();
        process.exit(1);
      });
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

importStudents();
