# ESP Tracker Deployment Guide

## การตั้งค่าโปรเจกต์สำหรับ Host 192.168.0.94

### 📋 ข้อมูลการตั้งค่า
- **Backend Host**: 192.168.0.94
- **Backend Port**: 3007
- **Frontend Host**: 192.168.0.94  
- **Frontend Port**: 5000

### 🚀 วิธีการรันโปรเจกต์

#### วิธีที่ 1: ใช้ Script (แนะนำ)
```bash
# ให้สิทธิ์การรันไฟล์ script
chmod +x start-servers.sh

# รันทั้ง backend และ frontend
./start-servers.sh
```

#### วิธีที่ 2: รันแยกกัน

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd medical-appointment-system
npm install
npm run dev
```

### 🌐 การเข้าถึงแอปพลิเคชัน

- **Frontend**: http://192.168.0.94:5000
- **Backend API**: http://192.168.0.94:3007/api

### ⚙️ การตั้งค่าที่เปลี่ยนแปลง

#### Backend (server.js)
- Port เปลี่ยนจาก 3000 เป็น 3007
- CORS เพิ่ม origin สำหรับ 192.168.0.94:5000
- Console log แสดง URL ใหม่

#### Frontend (package.json)
- Host เปลี่ยนจาก 0.0.0.0 เป็น 192.168.0.94
- Port ยังคงเป็น 5000

#### Next.js Config
- API URL เปลี่ยนเป็น http://192.168.0.94:3007
- Allowed origins เพิ่ม 192.168.0.94:5000

### 🔧 การตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน backend folder:
```env
PORT=3007
NODE_ENV=development
FRONTEND_URL=http://192.168.0.94:5000
```

สร้างไฟล์ `.env.local` ใน medical-appointment-system folder:
```env
NEXT_PUBLIC_API_URL=http://192.168.0.94:3007
```

### 📝 หมายเหตุ
- ตรวจสอบให้แน่ใจว่า Firewall อนุญาต port 3007 และ 5000
- ตรวจสอบการเชื่อมต่อเครือข่ายไปยัง 192.168.0.94
- หากมีปัญหา CORS ให้ตรวจสอบการตั้งค่าใน server.js 