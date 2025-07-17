// ไฟล์สำหรับทดสอบ API แบบง่าย
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// ตั้งค่า axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ฟังก์ชันสำหรับ log ผลลัพธ์
const logResult = (testName, result, error = null) => {
  console.log(`\n=== ${testName} ===`);
  if (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } else {
    console.log('✅ Success:', JSON.stringify(result.data, null, 2));
  }
};

// ฟังก์ชันทดสอบ
const runTests = async () => {
  console.log('🚀 เริ่มทดสอบ ESP Tracker API');
  
  try {
    // 1. ทดสอบ Health Check
    try {
      const health = await api.get('/health');
      logResult('Health Check', health);
    } catch (error) {
      logResult('Health Check', null, error);
    }

    // 2. ทดสอบดึงข้อมูล Work Plans
    try {
      const workPlans = await api.get('/work-plans');
      logResult('Get Work Plans', workPlans);
    } catch (error) {
      logResult('Get Work Plans', null, error);
    }

    // 3. ทดสอบสร้าง Work Plan ใหม่
    try {
      const newWorkPlan = {
        production_date: '2025-07-16',
        job_code: 'TEST001',
        job_name: 'Test Job สำหรับทดสอบ',
        start_time: '09:00:00',
        end_time: '11:00:00',
        operators: [
          { id_code: 'EMP001' }
        ]
      };
      
      const createResult = await api.post('/work-plans', newWorkPlan);
      logResult('Create Work Plan', createResult);
      
      const createdId = createResult.data.data.id;
      
      // 4. ทดสอบดึงข้อมูล Work Plan ตาม ID
      try {
        const workPlan = await api.get(`/work-plans/${createdId}`);
        logResult('Get Work Plan by ID', workPlan);
      } catch (error) {
        logResult('Get Work Plan by ID', null, error);
      }

      // 5. ทดสอบเริ่มกระบวนการ
      try {
        const startProcess = await api.post('/logs/start', {
          workPlanId: createdId,
          processNumber: 1
        });
        logResult('Start Process', startProcess);
      } catch (error) {
        logResult('Start Process', null, error);
      }

      // 6. ทดสอบหยุดกระบวนการ
      try {
        const stopProcess = await api.post('/logs/stop', {
          workPlanId: createdId,
          processNumber: 1
        });
        logResult('Stop Process', stopProcess);
      } catch (error) {
        logResult('Stop Process', null, error);
      }

      // 7. ทดสอบดูสถานะกระบวนการ
      try {
        const processStatus = await api.get(`/logs/work-plan/${createdId}/status`);
        logResult('Get Process Status', processStatus);
      } catch (error) {
        logResult('Get Process Status', null, error);
      }

      // 8. ทดสอบทำเครื่องหมายเสร็จสิ้น
      try {
        const finishResult = await api.patch(`/work-plans/${createdId}/finish`);
        logResult('Mark as Finished', finishResult);
      } catch (error) {
        logResult('Mark as Finished', null, error);
      }

      // 9. ทดสอบดึงข้อมูล Logs
      try {
        const logs = await api.get(`/logs/work-plan/${createdId}`);
        logResult('Get Logs', logs);
      } catch (error) {
        logResult('Get Logs', null, error);
      }

      // 10. ทดสอบดึงสรุปการผลิต
      try {
        const summary = await api.get('/logs/summary/2025-07-16');
        logResult('Get Production Summary', summary);
      } catch (error) {
        logResult('Get Production Summary', null, error);
      }

      // 11. ทดสอบอัปเดต Work Plan
      try {
        const updateData = {
          production_date: '2025-07-16',
          job_code: 'TEST001',
          job_name: 'Test Job (Updated)',
          start_time: '09:00:00',
          end_time: '12:00:00'
        };
        
        const updateResult = await api.put(`/work-plans/${createdId}`, updateData);
        logResult('Update Work Plan', updateResult);
      } catch (error) {
        logResult('Update Work Plan', null, error);
      }

      // 12. ทดสอบลบ Work Plan (ทำเป็นตัวสุดท้าย)
      try {
        const deleteResult = await api.delete(`/work-plans/${createdId}`);
        logResult('Delete Work Plan', deleteResult);
      } catch (error) {
        logResult('Delete Work Plan', null, error);
      }

    } catch (error) {
      logResult('Create Work Plan', null, error);
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error.message);
  }
  
  console.log('\n🏁 การทดสอบเสร็จสิ้น');
};

// รันการทดสอบ
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 