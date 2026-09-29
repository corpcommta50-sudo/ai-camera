'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface PeopleCount {
  value: number
  time: string
}

export default function Analytics() {
  const [data, setData] = useState<PeopleCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMsg)
      console.error('Full error:', err)
    } finally {
      setLoading(false)
    }
  }

  // คำนวณ KPIs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const todayData = data.filter(d => {
    if (!d.time) return false
    const itemDate = new Date(d.time)
    return itemDate >= today
  })
  
  const yesterdayData = data.filter(d => {
    if (!d.time) return false
    const itemDate = new Date(d.time)
    return itemDate >= yesterday && itemDate < today
  })

  const totalToday = todayData.reduce((sum, d) => sum + d.value, 0)
  const totalYesterday = yesterdayData.reduce((sum, d) => sum + d.value, 0)
  const percentChange = totalYesterday > 0 ? ((totalToday - totalYesterday) / totalYesterday * 100).toFixed(1) : '0'
  
  const avgToday = todayData.length > 0 ? (totalToday / todayData.length).toFixed(1) : '0'
  const avgYesterday = yesterdayData.length > 0 ? (totalYesterday / yesterdayData.length).toFixed(1) : '0'
  const avgChange = parseFloat(avgYesterday) > 0 ? ((parseFloat(avgToday) - parseFloat(avgYesterday)) / parseFloat(avgYesterday) * 100).toFixed(1) : '0'

  const peakToday = todayData.length > 0 ? Math.max(...todayData.map(d => d.value)) : 0
  const peakYesterday = yesterdayData.length > 0 ? Math.max(...yesterdayData.map(d => d.value)) : 0
  const peakChange = peakYesterday > 0 ? ((peakToday - peakYesterday) / peakYesterday * 100).toFixed(1) : '0'

  // Heatmap data - แยกตามชั่วโมงและวัน
  const heatmapData = Array(7).fill(0).map(() => Array(24).fill(0))
  const heatmapCounts = Array(7).fill(0).map(() => Array(24).fill(0))
  
  data.forEach(d => {
    if (!d.time) return
    const date = new Date(d.time)
    const dayOfWeek = date.getDay()
    const hour = date.getHours()
    heatmapData[dayOfWeek][hour] += d.value
    heatmapCounts[dayOfWeek][hour]++
  })

  // คำนวณค่าเฉลี่ย
  const heatmapAvg = heatmapData.map((day, i) => 
    day.map((val, j) => heatmapCounts[i][j] > 0 ? Math.round(val / heatmapCounts[i][j]) : 0)
  )

  const maxHeatValue = Math.max(...heatmapAvg.flat())
  const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

  // Top hours
  const hourlyAvg = Array(24).fill(0).map(() => ({ sum: 0, count: 0 }))
  data.forEach(d => {
    if (!d.time) return
    const hour = new Date(d.time).getHours()
    hourlyAvg[hour].sum += d.value
    hourlyAvg[hour].count++
  })

  const hourlyData = hourlyAvg.map((h, i) => ({
    hour: i,
    avg: h.count > 0 ? h.sum / h.count : 0
  })).sort((a, b) => b.avg - a.avg)

  const topHours = hourlyData.slice(0, 5)

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
          <h1 className="text-4xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            ← กลับหน้าหลัก
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-sm text-gray-600 mb-2">People Detected Today</h3>
            <p className="text-4xl font-bold text-blue-600 mb-2">{totalToday.toLocaleString()}</p>
            <p className={`text-sm font-semibold ${parseFloat(percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(percentChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(percentChange))}% vs Yesterday
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-sm text-gray-600 mb-2">Average per Hour Today</h3>
            <p className="text-4xl font-bold text-green-600 mb-2">{avgToday}</p>
            <p className={`text-sm font-semibold ${parseFloat(avgChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(avgChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(avgChange))}% vs Yesterday
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-sm text-gray-600 mb-2">Peak Today</h3>
            <p className="text-4xl font-bold text-purple-600 mb-2">{peakToday}</p>
            <p className={`text-sm font-semibold ${parseFloat(peakChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(peakChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(peakChange))}% vs Yesterday
            </p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">📅 Weekly Heatmap - ช่วงเวลาที่มีคนมากที่สุด</h2>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex">
                <div className="w-12"></div>
                <div className="flex-1 grid grid-cols-24 gap-1">
                  {Array(24).fill(0).map((_, i) => (
                    <div key={i} className="text-xs text-center text-gray-600">
                      {i}
                    </div>
                  ))}
                </div>
              </div>
              {heatmapAvg.map((day, dayIndex) => (
                <div key={dayIndex} className="flex items-center mb-1">
                  <div className="w-12 text-sm text-gray-600 font-medium">{days[dayIndex]}</div>
                  <div className="flex-1 grid grid-cols-24 gap-1">
                    {day.map((value, hourIndex) => {
                      const intensity = maxHeatValue > 0 ? value / maxHeatValue : 0
                      const bgColor = intensity === 0 ? 'bg-gray-100' :
                                     intensity < 0.25 ? 'bg-blue-200' :
                                     intensity < 0.5 ? 'bg-blue-400' :
                                     intensity < 0.75 ? 'bg-blue-600' : 'bg-blue-800'
                      return (
                        <div
                          key={hourIndex}
                          className={`h-8 ${bgColor} rounded flex items-center justify-center text-xs text-white font-semibold cursor-pointer hover:opacity-80 transition`}
                          title={`${days[dayIndex]} ${hourIndex}:00 - เฉลี่ย ${value} คน`}
                        >
                          {value > 0 ? value : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <span>น้อย</span>
            <div className="flex gap-1">
              <div className="w-8 h-4 bg-gray-100 rounded"></div>
              <div className="w-8 h-4 bg-blue-200 rounded"></div>
              <div className="w-8 h-4 bg-blue-400 rounded"></div>
              <div className="w-8 h-4 bg-blue-600 rounded"></div>
              <div className="w-8 h-4 bg-blue-800 rounded"></div>
            </div>
            <span>มาก</span>
          </div>
        </div>

        {/* Top Hours */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">⭐ Top 5 Peak Hours</h2>
          <div className="space-y-3">
            {topHours.map((h, index) => (
              <div key={h.hour} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-700">
                      {h.hour.toString().padStart(2, '0')}:00 - {(h.hour + 1).toString().padStart(2, '0')}:00
                    </span>
                    <span className="text-blue-600 font-bold">{h.avg.toFixed(1)} คน/ชม.</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(h.avg / topHours[0].avg) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📈 Daily Comparison</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Today</span>
                  <span className="font-bold text-blue-600">{totalToday} คน</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Yesterday</span>
                  <span className="font-bold text-gray-600">{totalYesterday} คน</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gray-400 h-4 rounded-full" 
                    style={{ width: `${totalToday > 0 ? (totalYesterday / totalToday * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📊 Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="text-gray-700">Total Records</span>
                <span className="font-bold text-blue-600">{data.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-gray-700">Today's Records</span>
                <span className="font-bold text-green-600">{todayData.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="text-gray-700">Yesterday's Records</span>
                <span className="font-bold text-purple-600">{yesterdayData.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
