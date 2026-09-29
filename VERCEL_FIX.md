# Update Vercel Environment Variables

## ปัญหา
Environment variables บน Vercel มีค่าผิด

## วิธีแก้
1. ไปที่ https://vercel.com/mta-50/ai-camera-temp/settings/environment-variables

2. ลบ environment variables เก่าทั้งหมด:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

3. เพิ่ม environment variables ใหม่:
   
   **Name:** NEXT_PUBLIC_SUPABASE_URL
   **Value:** https://ljomskvgvwjscmqmohtb.supabase.co
   **Environment:** Production
   
   **Name:** NEXT_PUBLIC_SUPABASE_ANON_KEY
   **Value:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb21za3Zndndqc2NtcW1vaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjYzMzQsImV4cCI6MjEwNTgwMjMzNH0.ImoV6VonRfASc0KHBYZSqA0mf0bTlCBReflQyLYqpZ4
   **Environment:** Production

4. กด Save

5. Redeploy โปรเจกต์:
   - ไปที่ https://vercel.com/mta-50/ai-camera-temp
   - กด "Redeploy" บน deployment ล่าสุด

## หรือใช้คำสั่งนี้
```bash
cd C:\ai-camera-temp
vercel --prod --yes
```
