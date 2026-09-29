'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface PeopleCount {
  id: number
  value: number
  time: string
  created_at: string
}

export default function Dashboard() {
  const [data, setData] = useState<PeopleCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      setError(null)
      
      const { data: result, error: fetchError } = await supabase
        .from('aicamera')
        .select('time, value')
        .order('time', { ascending: true })

      if (fetchError) {
        throw new Error(`Supabase error: ${fetchError.message}`)
      }

      setData(result || [])
      setLastUpdate(new Date().toLocaleTimeString('th-TH'))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMsg)
      console.error('Full error:', err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = data.map(d => ({
    time: d.time ? new Date(d.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-',
    value: d.value,
    fullTime: d.time ? new Date(d.time).toLocaleString('th-TH') : '-'
  }))

  const totalPeople = data.reduce((sum, d) => sum + d.value, 0)
  const avgPeople = data.length > 0 ? (totalPeople / data.length).toFixed(1) : '0'
  const maxPeople = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0
  const latestCount = data.length > 0 ? data[data.length - 1].value : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">☕ Cafe People Counter Dashboard</h1>
          <div className="text-sm text-gray-600">
            อัพเดทล่าสุด: {lastUpdate}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">จำนวนคนปัจจุบัน</h2>
            <p className="text-5xl font-bold text-blue-600">{latestCount}</p>
            <p className="text-sm text-gray-500 mt-2">คน</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">จำนวนคนรวมทั้งหมด</h2>
            <p className="text-5xl font-bold text-green-600">{totalPeople}</p>
            <p className="text-sm text-gray-500 mt-2">คน</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">เฉลี่ยต่อชั่วโมง</h2>
            <p className="text-5xl font-bold text-yellow-600">{avgPeople}</p>
            <p className="text-sm text-gray-500 mt-2">คน/ชม.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">จำนวนสูงสุด</h2>
            <p className="text-5xl font-bold text-red-600">{maxPeople}</p>
            <p className="text-sm text-gray-500 mt-2">คน</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">กราฟจำนวนคนตามเวลา</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#1f2937' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="จำนวนคน"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">กราฟแท่งแสดงจำนวนคน</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#1f2937' }}
              />
              <Bar dataKey="value" fill="#10b981" name="จำนวนคน" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">ตารางข้อมูลล่าสุด</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b-2 border-gray-300">
                  <th className="pb-3 text-gray-700">ลำดับ</th>
                  <th className="pb-3 text-gray-700">เวลา</th>
                  <th className="pb-3 text-gray-700">จำนวนคน</th>
                </tr>
              </thead>
              <tbody>
                {data.slice().reverse().slice(0, 20).map((d, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-gray-600">{index + 1}</td>
                    <td className="py-3 text-gray-600">{d.time ? new Date(d.time).toLocaleString('th-TH') : '-'}</td>
                    <td className="py-3">
                      <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                        {d.value} คน
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
