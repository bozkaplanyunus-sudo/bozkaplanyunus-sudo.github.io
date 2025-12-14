export interface Student {
  id: string;
  fullName: string;
  grade: string;
  
  // New School Fields
  registeredSchool?: string; // Kayıtlı olduğu normal okul (Alman okulu vb.)
  turkishSchool?: string;    // Türkçe dersine geldiği okul
  
  // Deprecated (kept for backward compatibility)
  schoolName?: string; 

  // Parent Info
  motherName?: string;
  motherPhone?: string;
  fatherName?: string;
  fatherPhone?: string;
  address?: string;
  
  // Deprecated Parent Info
  parentName?: string;
  parentPhone?: string;
  notes?: string;
}

export enum ModalType {
  NONE,
  ADD_EDIT,
  AI_MESSAGE
}

export interface AIRequestData {
  studentName: string;
  parentName: string;
  topic: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Map: "YYYY-MM-DD" -> { "studentId": "status" }
export interface AttendanceData {
  [date: string]: {
    [studentId: string]: AttendanceStatus;
  };
}