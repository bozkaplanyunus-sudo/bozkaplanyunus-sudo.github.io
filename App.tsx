import React, { useState, useEffect } from 'react';
import { Student, ModalType, AttendanceData } from './types';
import { getStoredStudents, saveStoredStudents, getStoredAttendance, saveStoredAttendance } from './services/storageService';
import { StudentForm } from './components/StudentForm';
import { AIGenerator } from './components/AIGenerator';
import { AttendanceView } from './components/AttendanceView';
import { Plus, Search, Phone, Edit2, Trash2, Bot, School, GraduationCap, MapPin, User, Users, Calendar, BookOpen, Building2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'attendance'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData>({});
  
  // Student List State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  
  // Modals
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Load data on mount
  useEffect(() => {
    // Migration logic on load: if old data exists, ensure fields are populated for UI
    const loadedStudents = getStoredStudents().map(s => {
      let modified = { ...s };
      
      // Ensure ID exists (crucial for deletion)
      if (!modified.id) {
        modified.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      }

      if (modified.schoolName && !modified.turkishSchool) {
        modified.turkishSchool = modified.schoolName;
      }
      return modified;
    });
    setStudents(loadedStudents);
    setAttendance(getStoredAttendance());
  }, []);

  // Save student data on change
  useEffect(() => {
    saveStoredStudents(students);
  }, [students]);

  // Save attendance data is handled by callback but we can sync here too if needed
  const handleSaveAttendance = (data: AttendanceData) => {
    setAttendance(data);
    saveStoredAttendance(data);
  };

  const handleSaveStudent = (student: Student) => {
    setStudents(prev => {
      const exists = prev.find(s => s.id === student.id);
      if (exists) {
        return prev.map(s => s.id === student.id ? student : s);
      }
      return [...prev, student];
    });
    setModalType(ModalType.NONE);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    if (!id) return;
    
    if (window.confirm('Bu öğrenciyi ve tüm kayıtlarını silmek istediğinize emin misiniz?')) {
      // 1. Delete Student
      setStudents(prev => prev.filter(s => s.id !== id));
      
      // 2. Cleanup Attendance Data
      setAttendance(prev => {
        const newData = { ...prev };
        let changed = false;
        
        Object.keys(newData).forEach(date => {
          if (newData[date] && newData[date][id]) {
             const dayRecord = { ...newData[date] };
             delete dayRecord[id];
             newData[date] = dayRecord;
             
             changed = true;
             // Remove date key if empty
             if (Object.keys(newData[date]).length === 0) {
               delete newData[date];
             }
          }
        });
        
        if (changed) {
          saveStoredAttendance(newData);
        }
        return newData;
      });

      // 3. Close Modal if open
      if (selectedStudent?.id === id) {
        setModalType(ModalType.NONE);
        setSelectedStudent(null);
      }
    }
  };

  const openAddModal = () => {
    setSelectedStudent(null);
    setModalType(ModalType.ADD_EDIT);
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setModalType(ModalType.ADD_EDIT);
  };

  const openAIModal = (student: Student) => {
    setSelectedStudent(student);
    setModalType(ModalType.AI_MESSAGE);
  };

  // Get unique schools based on Turkish School (primary grouping)
  const uniqueSchools = Array.from(new Set(students.map(s => s.turkishSchool).filter(Boolean))).sort();

  const filteredStudents = students.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchLower) ||
      (s.turkishSchool && s.turkishSchool.toLowerCase().includes(searchLower)) ||
      (s.registeredSchool && s.registeredSchool.toLowerCase().includes(searchLower));

    const matchesSchool = selectedSchool ? s.turkishSchool === selectedSchool : true;
    return matchesSearch && matchesSchool;
  });

  return (
    <div className="h-[100dvh] max-w-lg mx-auto bg-[#f8fafc] shadow-2xl overflow-hidden relative flex flex-col">
      
      {/* Dynamic Content based on Active Tab */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'students' ? (
          <>
            {/* Students View Header */}
            <header className="bg-indigo-600 text-white p-6 rounded-b-[2rem] shadow-lg relative z-10 flex-shrink-0 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Merhaba, Öğretmenim</h1>
                  <p className="text-indigo-200 text-sm">
                    Öğrenci Listesi ({filteredStudents.length}/{students.length})
                  </p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <GraduationCap size={24} />
                </div>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                <input
                  type="text"
                  placeholder="İsim veya okul ara..."
                  className="w-full bg-indigo-800/50 placeholder-indigo-300 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {uniqueSchools.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                      selectedSchool === null
                        ? 'bg-white text-indigo-600 shadow-lg scale-105'
                        : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-700/50 border border-indigo-500/30'
                    }`}
                  >
                    Tümü
                  </button>
                  {uniqueSchools.map(school => (
                    <button
                      key={school}
                      onClick={() => setSelectedSchool(school as string)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                        selectedSchool === school
                          ? 'bg-white text-indigo-600 shadow-lg scale-105'
                          : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-700/50 border border-indigo-500/30'
                      }`}
                    >
                      {school}
                    </button>
                  ))}
                </div>
              )}
            </header>

            {/* Students List */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <School size={32} />
                  </div>
                  <p>{students.length === 0 ? "Kayıtlı öğrenci bulunamadı." : "Aranan kriterlere uygun öğrenci bulunamadı."}</p>
                  {students.length === 0 && <p className="text-sm">Yeni bir öğrenci eklemek için + butonuna basın.</p>}
                </div>
              ) : (
                filteredStudents.map(student => (
                  <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{student.fullName}</h3>
                        
                        <div className="flex flex-col gap-1 mt-2">
                           {/* Turkish School (Primary Grouping) */}
                           <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                              <BookOpen size={14} className="flex-shrink-0" />
                              <span>{student.turkishSchool || 'Türkçe okulu girilmemiş'}</span>
                              {student.grade && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] border border-indigo-100">{student.grade}</span>}
                           </div>
                           
                           {/* Registered School */}
                           {student.registeredSchool && (
                             <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Building2 size={12} className="flex-shrink-0" />
                                <span>Kayıtlı: {student.registeredSchool}</span>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <button onClick={() => openAIModal(student)} className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors" title="AI Mesaj Oluştur">
                          <Bot size={18} />
                        </button>
                        <button onClick={() => openEditModal(student)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteStudent(student.id); 
                          }} 
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10"
                          title="Öğrenciyi Sil"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 space-y-3 mt-2">
                      {(!student.motherName && !student.fatherName && student.parentName) && (
                         <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <User size={16} className="text-gray-400" />
                             <span className="text-gray-600 text-sm">Veli: <span className="font-semibold text-gray-800">{student.parentName}</span></span>
                          </div>
                          {student.parentPhone && (
                            <a href={`tel:${student.parentPhone}`} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                              <Phone size={14} />
                            </a>
                          )}
                         </div>
                      )}
                      {student.motherName && (
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-10 text-xs font-bold text-pink-600 uppercase">Anne</span>
                            <span className="text-gray-800 font-medium text-sm">{student.motherName}</span>
                          </div>
                          {student.motherPhone && (
                            <a href={`tel:${student.motherPhone}`} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                              <Phone size={14} />
                            </a>
                          )}
                        </div>
                      )}
                      {student.fatherName && (
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-10 text-xs font-bold text-blue-600 uppercase">Baba</span>
                            <span className="text-gray-800 font-medium text-sm">{student.fatherName}</span>
                          </div>
                          {student.fatherPhone && (
                            <a href={`tel:${student.fatherPhone}`} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                              <Phone size={14} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    {student.address && (
                       <div className="mt-3 flex items-start gap-2 text-gray-500 text-xs px-1">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{student.address}</span>
                       </div>
                    )}
                  </div>
                ))
              )}
            </main>
            
            <button
              onClick={openAddModal}
              className="absolute bottom-20 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-300 hover:bg-indigo-700 active:scale-90 transition-transform z-20"
            >
              <Plus size={28} />
            </button>
          </>
        ) : (
          <AttendanceView 
            students={students} 
            attendanceData={attendance} 
            onSave={handleSaveAttendance} 
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 flex justify-around items-center p-2 z-30 pb- safe-area-bottom">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl flex-1 transition-all ${
            activeTab === 'students' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          <Users size={24} className={activeTab === 'students' ? 'fill-indigo-600' : ''} />
          <span className="text-xs font-semibold">Öğrenciler</span>
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl flex-1 transition-all ${
            activeTab === 'attendance' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          <Calendar size={24} className={activeTab === 'attendance' ? 'fill-indigo-600' : ''} />
          <span className="text-xs font-semibold">Yoklama</span>
        </button>
      </div>

      {/* Modals */}
      {modalType === ModalType.ADD_EDIT && (
        <StudentForm
          initialData={selectedStudent}
          onSave={handleSaveStudent}
          onCancel={() => setModalType(ModalType.NONE)}
        />
      )}

      {modalType === ModalType.AI_MESSAGE && selectedStudent && (
        <AIGenerator
          student={selectedStudent}
          onClose={() => setModalType(ModalType.NONE)}
        />
      )}
    </div>
  );
};

export default App;