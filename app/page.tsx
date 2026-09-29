'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'

interface PeopleCount {
  value: number
  time: string
}

export default function Dashboard() {
  const [data, setData] = useState<PeopleCount[]>([])
  const [filteredData, setFilteredData] = useState<PeopleCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 20

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterDataByDate()
  }, [data, startDate, endDate])

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

  function filterDataByDate() {
    if (!startDate || !endDate) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(d => {
      if (!d.time) return false
      const itemDate = new Date(d.time)
      return itemDate >= startDate && itemDate <= endDate
    })
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }

  function exportToExcel() {
    const exportData = filteredData.map((d, index) => ({
      'ลำดับ': index + 1,
      'เวลา': d.time ? new Date(d.time).toLocaleString('th-TH') : '-',
      'จำนวนคน': d.value
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Cafe Data')
    
    const fileName = `cafe-data-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const chartData = filteredData.map(d => ({
    time: d.time ? new Date(d.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-',
    value: d.value,
    fullTime: d.time ? new Date(d.time).toLocaleString('th-TH') : '-'
  }))

  const totalPeople = filteredData.reduce((sum, d) => sum + d.value, 0)
  const avgPeople = filteredData.length > 0 ? (totalPeople / filteredData.length).toFixed(1) : '0'
  
  const maxEntry = filteredData.reduce((max, d) => d.value > max.value ? d : max, filteredData[0] || { value: 0, time: '' })
  const maxPeople = maxEntry.value
  const maxTime = maxEntry.time ? new Date(maxEntry.time).toLocaleString('th-TH', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '-'

  const latestEntry = filteredData.length > 0 ? filteredData[filteredData.length - 1] : { value: 0, time: '' }
  const latestCount = latestEntry.value
  const latestTime = latestEntry.time ? new Date(latestEntry.time).toLocaleString('th-TH', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '-'

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredData.slice().reverse().slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredData.length / recordsPerPage)

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

        {/* Date Range Picker */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">เลือกช่วงวันที่</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <label className="block text-sm text-gray-600 mb-2">วันที่เริ่มต้น</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">วันที่สิ้นสุด</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-6">
              <button
                onClick={() => {
                  setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                  setEndDate(new Date())
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                7 วันล่าสุด
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            แสดงข้อมูล {filteredData.length} รายการ
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
            <p className="text-xs text-gray-500 mt-2">คน</p>
            <p className="text-xs text-gray-400 mt-1">ณ เวลา {latestTime}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">จำนวนคนรวมทั้งหมด</h2>
            <p className="text-5xl font-bold text-green-600">{totalPeople}</p>
            <p className="text-xs text-gray-500 mt-2">คน</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">เฉลี่ยต่อชั่วโมง</h2>
            <p className="text-5xl font-bold text-yellow-600">{avgPeople}</p>
            <p className="text-xs text-gray-500 mt-2">คน/ชม.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">จำนวนสูงสุด</h2>
            <p className="text-5xl font-bold text-red-600">{maxPeople}</p>
            <p className="text-xs text-gray-500 mt-2">คน</p>
            <p className="text-xs text-gray-400 mt-1">ณ เวลา {maxTime}</p>
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

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">ตารางข้อมูลล่าสุด</h2>
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition flex items-center gap-2"
            >
              📊 Export to Excel
            </button>
          </div>
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
                {currentRecords.map((d, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-gray-600">{indexOfFirstRecord + index + 1}</td>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ← ก่อนหน้า
              </button>
              <span className="text-gray-600">
                หน้า {currentPage} จาก {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ถัดไป →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
