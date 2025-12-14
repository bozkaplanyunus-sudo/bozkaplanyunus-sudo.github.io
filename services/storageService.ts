import { Student, AttendanceData } from '../types';

const STORAGE_KEY = 'student_app_data_v1';
const ATTENDANCE_KEY = 'student_app_attendance_v1';

export const getStoredStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load data", error);
    return [];
  }
};

export const saveStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Failed to save data", error);
  }
};

export const getStoredAttendance = (): AttendanceData => {
  try {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load attendance", error);
    return {};
  }
};

export const saveStoredAttendance = (data: AttendanceData): void => {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save attendance", error);
  }
};