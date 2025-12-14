import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { Input, TextArea } from './Input';
import { Save, X } from 'lucide-react';

interface StudentFormProps {
  initialData?: Student | null;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Student>({
    id: '',
    fullName: '',
    grade: '',
    registeredSchool: '',
    turkishSchool: '',
    motherName: '',
    motherPhone: '',
    fatherName: '',
    fatherPhone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      const data = { ...initialData };
      
      // Migration Logic: Parent Name
      if (data.parentName && !data.motherName && !data.fatherName) {
        data.motherName = data.parentName;
        data.motherPhone = data.parentPhone;
      }

      // Migration Logic: School Name
      // If old "schoolName" exists but new fields don't, map it to Turkish School
      // (assuming the app is primarily for the Turkish course context)
      if (data.schoolName && !data.turkishSchool) {
        data.turkishSchool = data.schoolName;
      }

      setFormData(data);
    } else {
      setFormData(prev => ({ ...prev, id: crypto.randomUUID() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-[slideIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
        </h2>
        <button onClick={onCancel} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-24">
        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 mt-2">Öğrenci Bilgileri</h3>
        <Input
          label="Ad Soyad"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Örn: Ali Yılmaz"
          required
        />

        <div className="my-4 space-y-4">
           <Input
            label="Türkçe Dersine Geldiği Okul"
            name="turkishSchool"
            value={formData.turkishSchool || ''}
            onChange={handleChange}
            placeholder="Örn: Merkez İlkokulu"
            required
          />
          <Input
            label="Kayıtlı Olduğu (Esas) Okul"
            name="registeredSchool"
            value={formData.registeredSchool || ''}
            onChange={handleChange}
            placeholder="Örn: Atatürk Anadolu Lisesi"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Sınıf / Şube"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            placeholder="3-A"
          />
        </div>

        <div className="my-6 border-t border-gray-100"></div>
        
        {/* Anne Bilgileri */}
        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">Anne Bilgileri</h3>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Anne Adı Soyadı"
            name="motherName"
            value={formData.motherName || ''}
            onChange={handleChange}
            placeholder="Örn: Ayşe Yılmaz"
          />
          <Input
            label="Anne Telefon"
            name="motherPhone"
            type="tel"
            value={formData.motherPhone || ''}
            onChange={handleChange}
            placeholder="05XX XXX XX XX"
          />
        </div>

        <div className="my-6 border-t border-gray-100"></div>

        {/* Baba Bilgileri */}
        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">Baba Bilgileri</h3>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Baba Adı Soyadı"
            name="fatherName"
            value={formData.fatherName || ''}
            onChange={handleChange}
            placeholder="Örn: Mehmet Yılmaz"
          />
          <Input
            label="Baba Telefon"
            name="fatherPhone"
            type="tel"
            value={formData.fatherPhone || ''}
            onChange={handleChange}
            placeholder="05XX XXX XX XX"
          />
        </div>

        <div className="my-6 border-t border-gray-100"></div>

        {/* İletişim ve Notlar */}
        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">İletişim & Diğer</h3>
        <TextArea
          label="Ev Adresi"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          placeholder="Mahalle, Cadde, Sokak, No..."
        />
        <TextArea
          label="Notlar"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          placeholder="Öğrenci hakkında özel notlar..."
        />
      </form>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg active:scale-[0.98] transition-transform"
        >
          <Save size={20} />
          Kaydet
        </button>
      </div>
    </div>
  );
};