'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
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
        .select('*')
        .order('time', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setData(result || [])
      setLastUpdate(new Date().toLocaleTimeString('th-TH'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = data.map(d => ({
    time: new Date(d.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    value: d.value,
    fullTime: new Date(d.time).toLocaleString('th-TH')
  }))

  const totalPeople = data.reduce((sum, d) => sum + d.value, 0)
  const avgPeople = data.length > 0 ? (totalPeople / data.length).toFixed(1) : '0'
  const maxPeople = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0
  const latestCount = data.length > 0 ? data[data.length - 1].value : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">☕ Cafe People Counter Dashboard</h1>
          <div className="text-sm text-gray-400">
            อัพเดทล่าสุด: {lastUpdate}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">จำนวนคนปัจจุบัน</h2>
            <p className="text-5xl font-bold text-blue-400">{latestCount}</p>
            <p className="text-sm text-gray-400 mt-2">คน</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">จำนวนคนรวมทั้งหมด</h2>
            <p className="text-5xl font-bold text-green-400">{totalPeople}</p>
            <p className="text-sm text-gray-400 mt-2">คน</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">เฉลี่ยต่อชั่วโมง</h2>
            <p className="text-5xl font-bold text-yellow-400">{avgPeople}</p>
            <p className="text-sm text-gray-400 mt-2">คน/ชม.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">จำนวนสูงสุด</h2>
            <p className="text-5xl font-bold text-red-400">{maxPeople}</p>
            <p className="text-sm text-gray-400 mt-2">คน</p>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">กราฟจำนวนคนตามเวลา</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                labelStyle={{ color: '#e2e8f0' }}
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

        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">กราฟแท่งแสดงจำนวนคน</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" fill="#10b981" name="จำนวนคน" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">ตารางข้อมูลล่าสุด</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-3">ลำดับ</th>
                  <th className="pb-3">จำนวนคน</th>
                  <th className="pb-3">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {data.slice().reverse().slice(0, 20).map((d, index) => (
                  <tr key={d.id} className="border-b border-slate-700">
                    <td className="py-3">{index + 1}</td>
                    <td className="py-3">
                      <span className="px-3 py-1 rounded bg-blue-500 font-bold">
                        {d.value} คน
                      </span>
                    </td>
                    <td className="py-3">{new Date(d.time).toLocaleString('th-TH')}</td>
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
