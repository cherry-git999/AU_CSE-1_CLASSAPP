import express from 'express';
import { lookupAttendance, markAttendance, getAllAttendance } from '../controllers/attendanceController.js';
import { protectCR } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/attendance/mark
 * @desc    Mark attendance for a subject (CR only)
 * @access  CR only (JWT protected)
 */
router.post('/mark', protectCR, markAttendance);

/**
 * @route   GET /api/attendance/all
 * @desc    Get all students attendance records (CR only)
 * @access  CR only (JWT protected)
 */
router.get('/all', protectCR, getAllAttendance);

/**
 * @route   POST /api/attendance/lookup
 * @desc    Student attendance lookup using regNo and DOB
 * @access  Public (read-only, no authentication)
 */
router.post('/lookup', lookupAttendance);

export default router;
