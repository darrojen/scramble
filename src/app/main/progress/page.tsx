'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabaseClient'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js'
import { Line, Bar, Pie, Radar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
)

export default function ProgressPage() {
  const { theme } = useTheme()
  const [scores, setScores] = useState<{ points: number; taken_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('line')
  const [filter, setFilter] = useState('weekly')

  useEffect(() => {
    async function fetchScores() {
      setLoading(true)
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('points, taken_at')
        .order('taken_at', { ascending: true })

      if (error) {
        console.error(error)
      } else {
        setScores(data || [])
      }
      setLoading(false)
    }
    fetchScores()
  }, [filter])

  const labels = scores.map((s) => new Date(s.taken_at).toLocaleDateString())
  const dataValues = scores.map((s) => s.points)

  // Chart dataset colors per mode
  const chartColors: Record<string, { border: string; background: string | string[] }> = {
    line: { border: '#00f2ff', background: '#00f2ff33' },
    curve: { border: '#ff00d4', background: '#ff00d433' },
    area: { border: '#00d2ff', background: '#00d2ff55' },
    bar: { border: '#00ff9d', background: '#00ff9d99' },
    pie: {
      border: '#ffe600',
      background: ['#00f2ff', '#ff00d4', '#ffe600', '#00ff9d', '#ff005e'],
    },
    radar: { border: '#ff005e', background: '#ff005e55' },
    radial: {
      border: '#00d2ff',
      background: ['#00f2ff', '#ff00d4', '#ffe600', '#00ff9d', '#ff005e', '#00b3ff'],
    },
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Points',
        data: dataValues,
        borderColor: chartColors[chartType]?.border,
        backgroundColor: chartColors[chartType]?.background,
        fill: chartType === 'area' || chartType === 'curve',
        tension: chartType === 'curve' ? 0.5 : 0,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: theme === 'light' ? '#000' : '#fff' } },
      tooltip: {
        backgroundColor: theme === 'light' ? '#fff' : '#0f172a',
        borderColor: chartColors[chartType]?.border,
        borderWidth: 1,
        titleColor: chartColors[chartType]?.border,
        bodyColor: theme === 'light' ? '#000' : '#fff',
      },
    },
    scales:
      chartType !== 'pie' && chartType !== 'radial' && chartType !== 'radar'
        ? {
            x: { ticks: { color: theme === 'light' ? '#000' : '#fff' }, grid: { color: '#1e293b' } },
            y: { ticks: { color: theme === 'light' ? '#000' : '#fff' }, grid: { color: '#1e293b' } },
          }
        : {},
  }

  const renderChart = () => {
    if (chartType === 'line') return <Line data={chartData} options={options} />
    if (chartType === 'curve') return <Line data={chartData} options={options} />
    if (chartType === 'area') return <Line data={chartData} options={options} />
    if (chartType === 'bar') return <Bar data={chartData} options={options} />
    if (chartType === 'pie') return <Pie data={chartData} options={options} />
    if (chartType === 'radar') return <Radar data={chartData} options={options} />
    if (chartType === 'radial') return <Doughnut data={chartData} options={options} />
    return null
  }

  return (
    <div className="min-h-screen p-8 transition-all duration-500">
      <Card className="bg-black/40 dark:bg-black/40 border border-cyan-500/30 shadow-xl shadow-cyan-500/20 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
            Progress Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Chart Type Selector */}
            <Select onValueChange={(v) => setChartType(v)} defaultValue="line">
              <SelectTrigger className="w-40 bg-black/50 border-cyan-500/30 text-cyan-400">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 text-cyan-300">
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="curve">Curve</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
                <SelectItem value="radar">Radar</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Selector */}
            <Select onValueChange={(v) => setFilter(v)} defaultValue="weekly">
              <SelectTrigger className="w-40 bg-black/50 border-fuchsia-500/30 text-fuchsia-400">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 text-fuchsia-300">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <Skeleton className="w-full h-[400px] rounded-xl bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-cyan-500/10 animate-pulse" />
            </div>
          ) : (
            <div className="w-full h-[400px] transition-all duration-500 ease-in-out">
              {renderChart()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
