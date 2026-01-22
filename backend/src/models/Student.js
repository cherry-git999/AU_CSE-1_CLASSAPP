import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  regNo: { type: String, unique: true },
  dob: Date,
  email: String
});

export default mongoose.model("Student", studentSchema);
