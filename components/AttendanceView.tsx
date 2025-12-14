import React, { useState, useEffect } from 'react';
import { Student, AttendanceData, AttendanceStatus } from '../types';
import { ChevronLeft, ChevronRight, Check, X, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

interface AttendanceViewProps {
  students: Student[];
  attendanceData: AttendanceData;
  onSave: (data: AttendanceData) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ students, attendanceData, onSave }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  // Helper to format date key
  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, but we want Monday as start
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // French Month Names
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const handleDateClick = (day: number) => {
    // Safer string construction for local time
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
  };

  // Filter Logic
  const uniqueSchools = Array.from(new Set(students.map(s => s.turkishSchool || s.schoolName).filter(Boolean))).sort();
  
  const filteredStudents = selectedSchool 
    ? students.filter(s => (s.turkishSchool === selectedSchool) || (!s.turkishSchool && s.schoolName === selectedSchool)) 
    : students;

  // Attendance Logic
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const updatedData = { ...attendanceData };
    if (!updatedData[selectedDateStr]) {
      updatedData[selectedDateStr] = {};
    }
    
    // Toggle off if clicking same status
    if (updatedData[selectedDateStr][studentId] === status) {
        delete updatedData[selectedDateStr][studentId];
    } else {
        updatedData[selectedDateStr][studentId] = status;
    }
    
    onSave(updatedData);
  };

  const markAllPresent = () => {
    const updatedData = { ...attendanceData };
    if (!updatedData[selectedDateStr]) {
      updatedData[selectedDateStr] = {};
    }
    filteredStudents.forEach(s => {
      updatedData[selectedDateStr][s.id] = 'present';
    });
    onSave(updatedData);
  };

  const getStats = () => {
    const dayData = attendanceData[selectedDateStr] || {};
    const stats = { present: 0, absent: 0, late: 0, excused: 0, none: 0 };
    
    filteredStudents.forEach(s => {
        const status = dayData[s.id];
        if (status) stats[status]++;
        else stats.none++;
    });
    return stats;
  };

  const stats = getStats();

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Calendar Header */}
      <div className="bg-white shadow-sm p-4 rounded-b-3xl z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">{monthNames[month]} {year}</h2>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(d => (
            <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDateStr;
            const hasData = attendanceData[dateStr] && Object.keys(attendanceData[dateStr]).length > 0;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center relative text-sm font-medium transition-all
                  ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-gray-700 hover:bg-gray-100'}
                  ${isToday && !isSelected ? 'border-2 border-indigo-600 text-indigo-700' : ''}
                `}
              >
                {day}
                {hasData && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* School Filter Chips */}
      {uniqueSchools.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar bg-[#f8fafc]">
          <button
            onClick={() => setSelectedSchool(null)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
              selectedSchool === null
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Tous
          </button>
          {uniqueSchools.map(school => (
            <button
              key={school as string}
              onClick={() => setSelectedSchool(school as string)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                selectedSchool === school
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {school as string}
          </button>
          ))}
        </div>
      )}

      {/* Selected Date Stats & Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-t border-gray-100 bg-white">
         <div className="flex gap-3 text-xs font-semibold text-gray-600">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>{stats.present}</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>{stats.absent}</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>{stats.late}</div>
         </div>
         <button 
           onClick={markAllPresent}
           className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
         >
           Tous présents
         </button>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {filteredStudents.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">
                {students.length === 0 ? "Votre liste d'élèves est vide." : "Aucun élève trouvé dans cette école."}
            </div>
        ) : (
            filteredStudents.map(student => {
                const status = attendanceData[selectedDateStr]?.[student.id];

                return (
                    <div key={student.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{student.fullName}</h4>
                            <p className="text-xs text-gray-500">{student.turkishSchool || student.schoolName}</p>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${status === 'present' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${status === 'absent' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                                <X size={18} />
                            </button>
                            <button
                                onClick={() => handleStatusChange(student.id, 'late')}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${status === 'late' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                                <Clock size={18} />
                            </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};