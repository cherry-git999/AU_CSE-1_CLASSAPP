import express from 'express';
import { lookupAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

/**
 * @route   POST /api/attendance/lookup
 * @desc    Student attendance lookup using regNo and DOB
 * @access  Public (read-only, no authentication)
 */
router.post('/lookup', lookupAttendance);

export default router;
