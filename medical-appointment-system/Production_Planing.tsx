"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, Clock, Search, User, Plus, Eye, Edit, Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Type definitions
interface WorkPlan {
  id: string
  job_name: string
  job_code: string
  start_time: string
  end_time: string
  operators: string
  is_finished: boolean
  production_date?: string
}

interface User {
  id: string
  id_code: string
  name: string
}

interface Job {
  job_code: string
  job_name: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export default function MedicalAppointmentDashboard() {
  // Get API URL from environment or use default
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.161:3007'

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  
  // State for job search
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // State for time
  const [startTime, setStartTime] = useState<string>("08:00")
  const [endTime, setEndTime] = useState<string>("17:00")
  
  // State for users
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState<boolean>(false)
  
  // State for operators
  const [selectedOperators, setSelectedOperators] = useState<string[]>(['none', 'none', 'none', 'none'])
  
  // State for room and machine
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [selectedMachine, setSelectedMachine] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  // Function to fetch users
  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/users`)
      const data: ApiResponse<User[]> = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
    setUsersLoading(false)
  }

  // Function to format time
  const formatTime = (timeString: string): string => {
    if (!timeString) return '-'
    
    try {
      if (timeString.includes('T') || timeString.includes(' ')) {
        const date = new Date(timeString)
        if (isNaN(date.getTime())) return timeString
        
        return date.toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }
    } catch (error) {
      console.error('Error formatting time:', error)
      return timeString
    }
    
    return timeString
  }

  // Function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-'
    
    try {
      if (dateString.includes('T') || dateString.includes(' ')) {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
    
    return dateString
  }

  // Function to validate time format
  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  // Function to handle time change
  const handleTimeChange = (value: string, setTimeFunction: (value: string) => void) => {
    setTimeFunction(value)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Function to search jobs
  const searchJobs = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setSearchLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/process-steps/search?query=${encodeURIComponent(query)}`)
      const data: ApiResponse<Job[]> = await res.json()
      if (data.success) {
        setSearchResults(data.data)
        setShowSearchResults(true)
      }
    } catch (err) {
      console.error('Error searching jobs:', err)
    }
    setSearchLoading(false)
  }

  // Function to select job
  const selectJob = (job: Job) => {
    setSelectedJob(job)
    setSearchTerm(job.job_name)
    setShowSearchResults(false)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setSelectedJob(null)
    
    if (value.length >= 2) {
      searchJobs(value)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  // Function to handle operator change
  const handleOperatorChange = (position: number, value: string) => {
    const newOperators = [...selectedOperators]
    newOperators[position - 1] = value
    setSelectedOperators(newOperators)
  }

  // Fetch work plans
  useEffect(() => {
    const fetchWorkPlans = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${API_URL}/api/work-plans?date=${selectedDate}`)
        const data: ApiResponse<WorkPlan[]> = await res.json()
        if (data.success) {
          setWorkPlans(data.data)
        } else {
          setError("ไม่สามารถดึงข้อมูลแผนการผลิตได้")
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
      }
      setLoading(false)
    }
    fetchWorkPlans()
  }, [selectedDate, API_URL])

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Function to save data
  const handleSubmit = async () => {
    if (!selectedJob) {
      alert('กรุณาเลือกงานที่ต้องการผลิต')
      return
    }

    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      alert('กรุณาใส่รูปแบบเวลาที่ถูกต้อง')
      return
    }

    try {
      const operators = selectedOperators
        .filter(operator => operator !== 'none')
        .map(operator => ({ id_code: operator }))

      const workPlanData = {
        production_date: selectedDate,
        job_code: selectedJob.job_code,
        job_name: selectedJob.job_name,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        operators: operators,
        room: selectedRoom,
        machine: selectedMachine,
        notes: notes
      }

      const response = await fetch(`${API_URL}/api/work-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workPlanData)
      })

      const data: ApiResponse<WorkPlan> = await response.json()

      if (data.success) {
        alert('บันทึกข้อมูลสำเร็จ')
        // Reset form
        setSelectedJob(null)
        setSearchTerm('')
        setStartTime('08:00')
        setEndTime('17:00')
        setSelectedOperators(['none', 'none', 'none', 'none'])
        setSelectedRoom('')
        setSelectedMachine('')
        setNotes('')
        
        // Refresh data
        const res = await fetch(`${API_URL}/api/work-plans?date=${selectedDate}`)
        const refreshData: ApiResponse<WorkPlan[]> = await res.json()
        if (refreshData.success) {
          setWorkPlans(refreshData.data)
        }
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message)
      }
    } catch (error) {
      console.error('Error saving work plan:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    }
  }

  // Function to delete work plan
  const handleDelete = async (workPlanId: string) => {
    if (!confirm('คุณต้องการลบงานนี้หรือไม่?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/work-plans/${workPlanId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data: ApiResponse<null> = await response.json()

      if (data.success) {
        alert('ลบงานสำเร็จ')
        // Refresh data
        const res = await fetch(`${API_URL}/api/work-plans?date=${selectedDate}`)
        const refreshData: ApiResponse<WorkPlan[]> = await res.json()
        if (refreshData.success) {
          setWorkPlans(refreshData.data)
        }
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting work plan:', error)
      alert('เกิดข้อผิดพลาดในการลบงาน')
    }
  }

  return (
    <div className="min-h-screen bg-green-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">ระบบจัดการแผนการผลิตครัวกลาง</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm text-gray-600 hover:bg-gray-100">
                    ระบบจัดการข้อมูล
                    <ChevronDown className="w-3 h-3 ml-1 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => window.open('http://192.168.0.93/tracker/index.html', '_blank')}
                    className="cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    กระบวนการ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">ผู้ใช้: Admin</span>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Panel - Schedule Form */}
          <Card className="shadow-sm bg-white/80 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="w-5 h-5 text-green-600" />
                <span>เพิ่มงานที่ต้องการผลิต</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="production-date" className="text-sm font-medium text-gray-700">วันที่ผลิต</Label>
                <div className="relative">
                  <Input
                    id="production-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* Job Search */}
              <div className="space-y-2">
                <Label htmlFor="job-search" className="text-sm font-medium text-gray-700">เพิ่มงานผลิต</Label>
                <div className="relative" ref={searchRef}>
                  <Input
                    id="job-search"
                    placeholder="ค้นหาชื่องานผลิต หรือรหัสงาน..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {searchLoading ? (
                        <div className="p-3 text-center text-gray-500">กำลังค้นหา...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((job) => (
                          <div
                            key={job.job_code}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => selectJob(job)}
                          >
                            <div className="font-medium text-gray-900">{job.job_name}</div>
                            <div className="text-sm text-gray-500">รหัส: {job.job_code}</div>
                          </div>
                        ))
                      ) : searchTerm.length >= 2 ? (
                        <div className="p-3 text-center text-gray-500">ไม่พบงานที่ค้นหา</div>
                      ) : null}
                    </div>
                  )}
                </div>
                
                {/* Selected Job Display */}
                {selectedJob && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-sm font-medium text-green-800">งานที่เลือก: {selectedJob.job_name}</div>
                    <div className="text-xs text-green-600">รหัส: {selectedJob.job_code}</div>
                  </div>
                )}
              </div>

              {/* Staff Positions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">ผู้ปฏิบัติงาน (1-4 คน)</Label>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-green-600 p-0 h-auto"
                    onClick={() => setSelectedOperators(['none', 'none', 'none', 'none'])}
                  >
                    ล้างข้อมูลทั้งหมด
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((position) => (
                    <div key={position} className="space-y-2">
                      <Label htmlFor={`operator-${position}`} className="text-xs text-gray-600">
                        ผู้ปฏิบัติงาน {position}
                      </Label>
                      <Select 
                        value={selectedOperators[position - 1]} 
                        onValueChange={(value) => handleOperatorChange(position, value)}
                      >
                        <SelectTrigger id={`operator-${position}`} className="h-9">
                          <SelectValue placeholder="เลือกผู้ปฏิบัติงาน" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">ไม่เลือก</SelectItem>
                          {usersLoading ? (
                            <SelectItem value="loading" disabled>กำลังโหลด...</SelectItem>
                          ) : users.length > 0 ? (
                            users.map((user) => (
                              <SelectItem key={user.id} value={user.id_code}>
                                {user.name} ({user.id_code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>ไม่พบข้อมูลผู้ใช้</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Machine Selection */}
              <div className="space-y-4">
                <Label htmlFor="machine" className="text-sm font-medium text-gray-700">เครื่องบันทึกข้อมูลการผลิต</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger id="machine">
                    <SelectValue placeholder="เลือกเครื่องที่ใช้..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nec01">NEC-01</SelectItem>
                    <SelectItem value="ipad01">iPad-01</SelectItem>
                    <SelectItem value="fuji01">FUJI-01</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-sm font-medium text-gray-700">เวลาเริ่ม</Label>
                  <div className="relative">
                    <Input 
                      id="start-time"
                      type="text" 
                      value={startTime}
                      onChange={(e) => handleTimeChange(e.target.value, setStartTime)}
                      placeholder="เช่น 9:00, 10:30"
                      className="pl-10" 
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-gray-500">รูปแบบ: ชั่วโมง:นาที (เช่น 9:00, 10:30, 14:45)</p>
                  {startTime && !validateTimeFormat(startTime) && (
                    <p className="text-xs text-red-500">รูปแบบเวลาไม่ถูกต้อง</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-sm font-medium text-gray-700">เวลาสิ้นสุด</Label>
                  <div className="relative">
                    <Input 
                      id="end-time"
                      type="text" 
                      value={endTime}
                      onChange={(e) => handleTimeChange(e.target.value, setEndTime)}
                      placeholder="เช่น 17:00, 18:30"
                      className="pl-10" 
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-gray-500">รูปแบบ: ชั่วโมง:นาที (เช่น 17:00, 18:30, 20:15)</p>
                  {endTime && !validateTimeFormat(endTime) && (
                    <p className="text-xs text-red-500">รูปแบบเวลาไม่ถูกต้อง</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="room" className="text-sm font-medium text-gray-700">ห้องผลิต</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="เลือกห้องผลิต..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room1">ห้อง 1</SelectItem>
                    <SelectItem value="room2">ห้อง 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">หมายเหตุ</Label>
                <Textarea 
                  id="notes"
                  placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับการผลิต..." 
                  className="min-h-[80px] resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-green-700 hover:bg-green-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  บันทึกข้อมูล
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Schedule View */}
          <Card className="shadow-sm bg-white/80 backdrop-blur-sm lg:col-span-3">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>รายการแผนผลิต</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    ใหม่
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Schedule Header */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>รายวัน</span>
                  <span>รายสัปดาห์</span>
                </div>

                <Separator />

                {loading ? (
                  <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : workPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">ไม่มีการนัดหมายเพิ่มเติมในวันนี้</p>
                  </div>
                ) : (
                  workPlans.map((plan) => (
                    <div key={plan.id} className="border-l-4 border-l-green-400 bg-green-50 p-4 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900">{plan.job_name}</h3>
                            <Badge className="text-xs">
                              รหัส: {plan.job_code}
                            </Badge>
                            {plan.is_finished ? (
                              <Badge className="text-xs bg-green-200 text-green-800">เสร็จสิ้น</Badge>
                            ) : (
                              <Badge className="text-xs bg-yellow-100 text-yellow-800">รอดำเนินการ</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <span>ผู้ปฏิบัติงาน: {plan.operators || '-'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{formatTime(plan.start_time)} - {formatTime(plan.end_time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-green-600">
                            <span className="text-xs">บันทึกแบบร่าง</span>
                          </Button>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(plan.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}