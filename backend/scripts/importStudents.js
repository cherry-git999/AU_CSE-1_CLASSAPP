import fs from "fs";
import path from "path";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../src/models/Student.js";

dotenv.config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

// CSV file path
const csvFilePath = path.join(process.cwd(), "data", "students.csv");

const students = [];

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

const importStudents = async () => {
  try {
    await connectDB();

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        students.push({
          name: row.Name.trim(),
          regNo: row.RegNo.trim(),
          dob: new Date(row.DOB),
          email: row.Email.trim()
        });
      })
      .on("end", async () => {
        for (const student of students) {
          try {
            await Student.updateOne(
              { regNo: student.regNo },
              { $setOnInsert: student },
              { upsert: true }
            );
          } catch (err) {
            console.error(`⚠️ Skipped ${student.regNo}`, err.message);
          }
        }

        console.log(`✅ Imported ${students.length} students`);
        mongoose.connection.close();
      });
  } catch (error) {
    console.error("❌ Import failed", error);
    mongoose.connection.close();
  }
};

importStudents();
