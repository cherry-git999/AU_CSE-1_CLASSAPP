import mongoose from "mongoose";
import dotenv from "dotenv";
import Attendance from "../src/models/Attendance.js";
import DailyAttendance from "../src/models/DailyAttendance.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const cleanupAttendance = async () => {
  try {
    await connectDB();

    console.log("🧹 Cleaning up attendance records...");
    console.log("⚠️  This will delete ALL attendance history.");
    console.log("⚠️  Students will NOT be affected.\n");

    // Delete all attendance summary records
    const attendanceResult = await Attendance.deleteMany({});
    console.log(`✅ Deleted ${attendanceResult.deletedCount} attendance summary records`);

    // Delete all daily attendance records
    const dailyAttendanceResult = await DailyAttendance.deleteMany({});
    console.log(`✅ Deleted ${dailyAttendanceResult.deletedCount} daily attendance records`);

    console.log("\n✨ Cleanup completed successfully!");
    console.log("✅ All student data preserved!");
    console.log("\n📝 Use this when starting a new semester or fixing attendance errors.");
    console.log("You can now mark fresh attendance for all subjects.");

  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

cleanupAttendance();
