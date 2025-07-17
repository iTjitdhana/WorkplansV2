# คู่มือการ Deploy ESP Tracker System

## 1. การเตรียม Server

### 1.1 ระบบปฏิบัติการที่แนะนำ
- Ubuntu 20.04 LTS หรือใหม่กว่า
- CentOS 8 หรือใหม่กว่า
- Debian 11 หรือใหม่กว่า

### 1.2 ความต้องการระบบ
- RAM: อย่างน้อย 2GB
- Storage: อย่างน้อย 10GB
- CPU: 1 core ขึ้นไป

## 2. การติดตั้งระบบ

### 2.1 รัน Script ติดตั้งอัตโนมัติ
```bash
# ให้สิทธิ์การรัน script
chmod +x deploy.sh

# รัน script ติดตั้ง
./deploy.sh
```

### 2.2 ติดตั้งด้วยตนเอง

#### ติดตั้ง Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### ติดตั้ง MySQL
```bash
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### ติดตั้ง PM2
```bash
sudo npm install -g pm2
```

#### ติดตั้ง Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 3. การตั้งค่าฐานข้อมูล

### 3.1 สร้างฐานข้อมูล
```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS esp_tracker;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'esp_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON esp_tracker.* TO 'esp_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 3.2 Import Schema
```bash
mysql -u esp_user -p esp_tracker < backend/esp_tracker\ \(6\).sql
```

## 4. การตั้งค่า Environment Variables

### 4.1 Backend (.env)
```bash
cd backend
cp .env.example .env
nano .env
```

แก้ไขไฟล์ `.env`:
```env
DB_HOST=localhost
DB_USER=esp_user
DB_PASSWORD=your_secure_password
DB_NAME=esp_tracker
DB_PORT=3306
PORT=3007
NODE_ENV=production
FRONTEND_URL=http://your-domain.com
API_RATE_LIMIT=100
```

### 4.2 Frontend (.env.local)
```bash
cd medical-appointment-system
nano .env.local
```

แก้ไขไฟล์ `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://your-domain.com
```

## 5. การ Build และ Deploy

### 5.1 Backend
```bash
cd backend
npm install
npm run build  # ถ้ามี script build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 5.2 Frontend
```bash
cd medical-appointment-system
npm install
npm run build
pm2 start npm --name "esp-frontend" -- start
pm2 save
```

## 6. การตั้งค่า Nginx

### 6.1 คัดลอกไฟล์ config
```bash
sudo cp nginx.conf /etc/nginx/sites-available/esp-tracker
sudo ln -s /etc/nginx/sites-available/esp-tracker /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### 6.2 แก้ไข domain
```bash
sudo nano /etc/nginx/sites-available/esp-tracker
```
เปลี่ยน `your-domain.com` เป็น domain ของคุณ

### 6.3 รีสตาร์ท Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 7. การตั้งค่า SSL (แนะนำ)

### 7.1 ติดตั้ง Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 7.2 ขอ SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## 8. การตรวจสอบระบบ

### 8.1 ตรวจสอบสถานะ services
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql
```

### 8.2 ตรวจสอบ logs
```bash
pm2 logs esp-tracker-backend
pm2 logs esp-frontend
sudo tail -f /var/log/nginx/error.log
```

## 9. การ Backup

### 9.1 Backup ฐานข้อมูล
```bash
mysqldump -u esp_user -p esp_tracker > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 9.2 Backup ไฟล์
```bash
tar -czf esp-tracker-backup-$(date +%Y%m%d_%H%M%S).tar.gz backend/ medical-appointment-system/
```

## 10. การ Troubleshooting

### 10.1 ตรวจสอบ ports
```bash
sudo netstat -tlnp | grep :3007
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

### 10.2 ตรวจสอบ firewall
```bash
sudo ufw status
```

### 10.3 รีสตาร์ท services
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mysql
```

## 11. การอัปเดตระบบ

### 11.1 อัปเดต Backend
```bash
cd backend
git pull
npm install
pm2 restart esp-tracker-backend
```

### 11.2 อัปเดต Frontend
```bash
cd medical-appointment-system
git pull
npm install
npm run build
pm2 restart esp-frontend
```

## 12. การ Monitor

### 12.1 PM2 Monitor
```bash
pm2 monit
```

### 12.2 ระบบ Monitor
```bash
htop
df -h
free -h
```

---

**หมายเหตุ**: อย่าลืมเปลี่ยน `your-domain.com` และ `your_secure_password` เป็นค่าที่เหมาะสมกับระบบของคุณ 