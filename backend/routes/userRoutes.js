const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users - ดึงรายการผู้ใช้ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการผู้ใช้'
    });
  }
});

// GET /api/users/:id - ดึงข้อมูลผู้ใช้ตาม ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.getById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้นี้'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
});

module.exports = router; 