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

    // Clear old students
    await Student.deleteMany({});
    console.log("✅ Old students cleared");

    // Also clear attendance records to prevent orphaned references
    await Attendance.deleteMany({});
    console.log("✅ Old attendance summaries cleared");

    await DailyAttendance.deleteMany({});
    console.log("✅ Old daily attendance records cleared");

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
          await Student.insertMany(students, { ordered: false });
          console.log(`\n✅ Successfully imported ${students.length} students`);
          console.log("\n⚠️  Important: All previous attendance records have been cleared.");
          console.log("You can now mark fresh attendance for these students.");
        } catch (error) {
          console.error("❌ Insert failed:", error.message);
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
