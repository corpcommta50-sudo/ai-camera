'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

interface Detection {
  id: number
  camera_id: string
  object_type: string
  confidence: number
  timestamp: string
  image_url?: string
}

interface Camera {
  id: string
  name: string
  location: string
  status: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Dashboard() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      
      const { data: detectionData, error: detectionError } = await supabase
        .from('detections')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (detectionError && detectionError.code !== '42P01') {
        throw detectionError
      }

      const { data: cameraData, error: cameraError } = await supabase
        .from('cameras')
        .select('*')

      if (cameraError && cameraError.code !== '42P01') {
        throw cameraError
      }

      setDetections(detectionData || [])
      setCameras(cameraData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const objectCounts = detections.reduce((acc, d) => {
    acc[d.object_type] = (acc[d.object_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(objectCounts).map(([name, value]) => ({
    name,
    value
  }))

  const timelineData = detections
    .slice(0, 20)
    .reverse()
    .map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString(),
      confidence: d.confidence * 100,
      object: d.object_type
    }))

  const cameraDetections = cameras.map(cam => ({
    name: cam.name || cam.id,
    count: detections.filter(d => d.camera_id === cam.id).length
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">AI Camera Dashboard</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Total Detections</h2>
            <p className="text-4xl font-bold text-blue-400">{detections.length}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Active Cameras</h2>
            <p className="text-4xl font-bold text-green-400">{cameras.filter(c => c.status === 'active').length}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Object Types</h2>
            <p className="text-4xl font-bold text-yellow-400">{pieData.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Detections by Object Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Object Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Confidence Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="confidence" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {cameraDetections.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Detections by Camera</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cameraDetections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Detections</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Camera</th>
                  <th className="pb-3">Object</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {detections.slice(0, 10).map((d) => (
                  <tr key={d.id} className="border-b border-slate-700">
                    <td className="py-3">{d.id}</td>
                    <td className="py-3">{d.camera_id}</td>
                    <td className="py-3">{d.object_type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded ${
                        d.confidence > 0.8 ? 'bg-green-500' : 
                        d.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {(d.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3">{new Date(d.timestamp).toLocaleString()}</td>
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
