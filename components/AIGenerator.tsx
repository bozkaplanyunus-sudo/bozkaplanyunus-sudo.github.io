import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { generateParentMessage } from '../services/geminiService';
import { Sparkles, X, Copy, Check, MessageCircle, User } from 'lucide-react';

interface AIGeneratorProps {
  student: Student;
  onClose: () => void;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ student, onClose }) => {
  const [topic, setTopic] = useState('');
  const [selectedParent, setSelectedParent] = useState<'mother' | 'father' | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine available parents and set default
  const hasMother = !!student.motherName;
  const hasFather = !!student.fatherName;

  useEffect(() => {
    if (hasMother) setSelectedParent('mother');
    else if (hasFather) setSelectedParent('father');
  }, [hasMother, hasFather]);

  const handleGenerate = async () => {
    if (!topic.trim() || !selectedParent) return;
    
    const parentName = selectedParent === 'mother' ? student.motherName : student.fatherName;
    
    if (!parentName) return;

    setLoading(true);
    setGeneratedMessage('');
    try {
      const msg = await generateParentMessage({
        studentName: student.fullName,
        parentName: parentName,
        topic: topic
      });
      setGeneratedMessage(msg);
    } catch (error) {
      setGeneratedMessage("Erreur : Impossible de créer le message. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTargetPhone = () => {
    return selectedParent === 'mother' ? student.motherPhone : student.fatherPhone;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={20} className="animate-pulse" />
            <h3 className="font-bold text-lg">Assistant Message IA</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          
          {/* Parent Selection */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Destinataire</label>
            <div className="flex gap-2">
              {hasMother && (
                <button
                  onClick={() => setSelectedParent('mother')}
                  className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    selectedParent === 'mother' 
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User size={16} />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold">Mère</span>
                    <span className="text-xs truncate max-w-[80px]">{student.motherName}</span>
                  </div>
                </button>
              )}
              {hasFather && (
                <button
                  onClick={() => setSelectedParent('father')}
                  className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    selectedParent === 'father' 
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User size={16} />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold">Père</span>
                    <span className="text-xs truncate max-w-[80px]">{student.fatherName}</span>
                  </div>
                </button>
              )}
              {!hasMother && !hasFather && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded w-full">
                  Aucune information parentale trouvée.
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sujet du message</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="Ex: Devoirs non faits, En retard en classe..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {!generatedMessage && (
            <button
              onClick={handleGenerate}
              disabled={loading || !topic || !selectedParent}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2
                ${loading || !topic || !selectedParent
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Réflexion en cours...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Générer le message
                </>
              )}
            </button>
          )}

          {generatedMessage && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Brouillon généré</label>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed relative">
                {generatedMessage}
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
                {getTargetPhone() && (
                  <a
                    href={`https://wa.me/${getTargetPhone()?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(generatedMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                )}
              </div>
              
               <button 
                  onClick={() => { setGeneratedMessage(''); setTopic(''); }}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-gray-800 underline"
                >
                  Générer un nouveau message
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};