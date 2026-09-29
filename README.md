# AI Camera Dashboard

Dashboard แสดงผลข้อมูลจาก AI Camera ที่เก็บใน Supabase

## Features

- แสดงข้อมูล Detection ต่างๆ จาก AI Camera
- Dashboard พร้อมกราฟและตาราง
- Real-time statistics

## Tech Stack

- **Frontend**: Next.js 16 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase
- **Deployment**: Vercel

## Deployment

### Deploy บน Vercel

1. Push code ไปยัง GitHub repository
2. ไปที่ [vercel.com](https://vercel.com)
3. Import repository นี้
4. ตั้งค่า Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Environment Variables

สร้างไฟล์ `.env.local` และเพิ่มค่า:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

โปรเจกต์นี้คาดหวังให้มี tables เหล่านี้ใน Supabase:

### detections table
```sql
CREATE TABLE detections (
  id SERIAL PRIMARY KEY,
  camera_id TEXT NOT NULL,
  object_type TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  image_url TEXT
);
```

### cameras table
```sql
CREATE TABLE cameras (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT,
  status TEXT
);
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
