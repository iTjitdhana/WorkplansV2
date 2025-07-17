# ESP Tracker Backend API

Backend API สำหรับระบบ ESP Tracker ที่ใช้ในการจัดการแผนการผลิต กระบวนการผลิต และการบันทึกข้อมูลการทำงาน

## 🚀 การติดตั้ง

### 1. Clone และติดตั้ง dependencies
```bash
# ติดตั้ง Node.js dependencies
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=esp_tracker
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
API_RATE_LIMIT=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. ตั้งค่าฐานข้อมูล
- สร้างฐานข้อมูล MySQL ชื่อ `esp_tracker`
- Import ไฟล์ `esp_tracker (6).sql` เข้าสู่ฐานข้อมูล

### 4. รัน Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📋 API Endpoints

### Health Check
```http
GET /api/health
```

### Work Plans API

#### 1. ดึงข้อมูล Work Plans ทั้งหมด
```http
GET /api/work-plans
GET /api/work-plans?date=2025-07-16
```

#### 2. ดึงข้อมูล Work Plan ตาม ID
```http
GET /api/work-plans/1
```

#### 3. สร้าง Work Plan ใหม่
```http
POST /api/work-plans
Content-Type: application/json

{
  "production_date": "2025-07-16",
  "job_code": "235001",
  "job_name": "กุ้งทรงเครื่อง",
  "start_time": "09:00:00",
  "end_time": "11:00:00",
  "operators": [
    {
      "id_code": "EMP001"
    },
    {
      "user_id": 1
    }
  ]
}
```

#### 4. อัปเดต Work Plan
```http
PUT /api/work-plans/1
Content-Type: application/json

{
  "production_date": "2025-07-16",
  "job_code": "235001",
  "job_name": "กุ้งทรงเครื่อง",
  "start_time": "09:00:00",
  "end_time": "12:00:00"
}
```

#### 5. ลบ Work Plan
```http
DELETE /api/work-plans/1
```

#### 6. ทำเครื่องหมายเสร็จสิ้น
```http
PATCH /api/work-plans/1/finish
```

#### 7. ยกเลิกการทำเครื่องหมายเสร็จสิ้น
```http
PATCH /api/work-plans/1/unfinish
```

### Logs API

#### 1. ดึงข้อมูล Logs ทั้งหมด
```http
GET /api/logs
GET /api/logs?work_plan_id=1
GET /api/logs?date=2025-07-16
GET /api/logs?status=start
```

#### 2. ดึงข้อมูล Logs ตาม Work Plan ID
```http
GET /api/logs/work-plan/1
```

#### 3. ดึงสถานะกระบวนการ
```http
GET /api/logs/work-plan/1/status
```

#### 4. ดึงสรุปการผลิตตามวันที่
```http
GET /api/logs/summary/2025-07-16
```

#### 5. เริ่มกระบวนการ
```http
POST /api/logs/start
Content-Type: application/json

{
  "workPlanId": 1,
  "processNumber": 1
}
```

#### 6. หยุดกระบวนการ
```http
POST /api/logs/stop
Content-Type: application/json

{
  "workPlanId": 1,
  "processNumber": 1
}
```

#### 7. สร้าง Log ใหม่
```http
POST /api/logs
Content-Type: application/json

{
  "work_plan_id": 1,
  "process_number": 1,
  "status": "start",
  "timestamp": "2025-07-16T09:00:00Z"
}
```

## 🧪 การทดสอบ

### 1. ทดสอบด้วย curl

#### ทดสอบ Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

#### ทดสอบดึงข้อมูล Work Plans
```bash
curl -X GET http://localhost:3000/api/work-plans
```

#### ทดสอบสร้าง Work Plan
```bash
curl -X POST http://localhost:3000/api/work-plans \
  -H "Content-Type: application/json" \
  -d '{
    "production_date": "2025-07-16",
    "job_code": "TEST001",
    "job_name": "Test Job",
    "start_time": "09:00:00",
    "end_time": "11:00:00"
  }'
```

#### ทดสอบเริ่มกระบวนการ
```bash
curl -X POST http://localhost:3000/api/logs/start \
  -H "Content-Type: application/json" \
  -d '{
    "workPlanId": 1,
    "processNumber": 1
  }'
```

### 2. ทดสอบด้วย Postman

1. สร้าง Collection ใหม่ชื่อ "ESP Tracker API"
2. เพิ่ม Environment Variables:
   - `base_url`: `http://localhost:3000/api`
3. สร้าง Request ตาม endpoints ข้างต้น

### 3. ทดสอบด้วย Thunder Client (VS Code Extension)

1. ติดตั้ง Thunder Client extension
2. สร้าง Collection ใหม่
3. ทดสอบ endpoints ตามตัวอย่างข้างต้น

## 📊 ตัวอย่างการใช้งาน

### สร้าง Work Plan และเริ่มกระบวนการ

```bash
# 1. สร้าง Work Plan
curl -X POST http://localhost:3000/api/work-plans \
  -H "Content-Type: application/json" \
  -d '{
    "production_date": "2025-07-16",
    "job_code": "235001",
    "job_name": "กุ้งทรงเครื่อง",
    "start_time": "09:00:00",
    "end_time": "11:00:00",
    "operators": [{"id_code": "EMP001"}]
  }'

# 2. เริ่มกระบวนการที่ 1
curl -X POST http://localhost:3000/api/logs/start \
  -H "Content-Type: application/json" \
  -d '{
    "workPlanId": 1,
    "processNumber": 1
  }'

# 3. หยุดกระบวนการที่ 1
curl -X POST http://localhost:3000/api/logs/stop \
  -H "Content-Type: application/json" \
  -d '{
    "workPlanId": 1,
    "processNumber": 1
  }'

# 4. ดูสถานะกระบวนการ
curl -X GET http://localhost:3000/api/logs/work-plan/1/status

# 5. ทำเครื่องหมายเสร็จสิ้น
curl -X PATCH http://localhost:3000/api/work-plans/1/finish
```

## 🔧 การพัฒนา

### โครงสร้างโฟลเดอร์
```
├── config/
│   └── database.js          # การตั้งค่าฐานข้อมูล
├── controllers/
│   ├── workPlanController.js # Controller สำหรับ Work Plans
│   └── logController.js      # Controller สำหรับ Logs
├── models/
│   ├── WorkPlan.js          # Model สำหรับ Work Plans
│   ├── ProcessStep.js       # Model สำหรับ Process Steps
│   ├── Log.js               # Model สำหรับ Logs
│   └── User.js              # Model สำหรับ Users
├── routes/
│   ├── workPlanRoutes.js    # Routes สำหรับ Work Plans
│   ├── logRoutes.js         # Routes สำหรับ Logs
│   └── index.js             # รวม Routes ทั้งหมด
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── server.js                # ไฟล์หลักของ server
└── package.json
```

### การเพิ่ม Features ใหม่

1. สร้าง Model ใหม่ในโฟลเดอร์ `models/`
2. สร้าง Controller ใหม่ในโฟลเดอร์ `controllers/`
3. สร้าง Routes ใหม่ในโฟลเดอร์ `routes/`
4. เพิ่ม Routes ใหม่ใน `routes/index.js`

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่สามารถเชื่อมต่อฐานข้อมูลได้**
   - ตรวจสอบการตั้งค่าใน `.env`
   - ตรวจสอบว่า MySQL service ทำงานอยู่

2. **Port ถูกใช้แล้ว**
   - เปลี่ยน PORT ใน `.env`
   - หรือหยุด process ที่ใช้ port นั้น

3. **Validation Error**
   - ตรวจสอบ format ของข้อมูลที่ส่งมา
   - ดู error message ใน response

## 📝 License

MIT License 