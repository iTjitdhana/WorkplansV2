const express = require('express');
const ProcessStep = require('../models/ProcessStep');
const { pool } = require('../config/database');

const router = express.Router();

// GET /api/process-steps/search - ค้นหางานผลิต
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json({
        success: true,
        data: []
      });
    }

    // ค้นหาจาก job_code หรือ job_name
    const query_sql = `
      SELECT DISTINCT job_code, job_name
      FROM process_steps
      WHERE job_code LIKE ? OR job_name LIKE ?
      ORDER BY job_code
      LIMIT 10
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(query_sql, [searchTerm, searchTerm]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error searching process steps:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหางานผลิต'
    });
  }
});

// GET /api/process-steps/job-codes - ดึงรายการรหัสงานทั้งหมด
router.get('/job-codes', async (req, res) => {
  try {
    const jobCodes = await ProcessStep.getJobCodes();
    
    res.json({
      success: true,
      data: jobCodes
    });
  } catch (error) {
    console.error('Error fetching job codes:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการรหัสงาน'
    });
  }
});

module.exports = router; 