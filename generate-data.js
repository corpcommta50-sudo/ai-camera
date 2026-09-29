const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ljomskvgvwjscmqmohtb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb21za3Zndndqc2NtcW1vaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMjYzMzQsImV4cCI6MjEwNTgwMjMzNH0.ImoV6VonRfASc0KHBYZSqA0mf0bTlCBReflQyLYqpZ4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateData() {
  const startDate = new Date('2026-09-25T08:00:00')
  const records = []
  
  for (let i = 0; i < 100; i++) {
    const time = new Date(startDate.getTime() + i * 3600000) // เพิ่มทีละ 1 ชั่วโมง
    const value = Math.floor(Math.random() * 50) + 10 // สุ่มจำนวนคน 10-60 คน
    
    records.push({
      time: time.toISOString(),
      value: value
    })
  }
  
  console.log(`กำลังสร้างข้อมูล ${records.length} records...`)
  
  const { data, error } = await supabase
    .from('aicamera')
    .insert(records)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✓ สร้างข้อมูลสำเร็จ!')
  }
}

generateData()
