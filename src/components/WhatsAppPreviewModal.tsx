import React, { useState } from 'react';
import { Student, SchoolConfig } from '../types';
import { formatFCFA, buildWhatsAppLink, cleanPhoneNumber } from '../utils/formatters';
import { MessageCircle, X, Send, Copy, Check } from 'lucide-react';

interface WhatsAppPreviewModalProps {
  student: Student;
  countryCode: string;
  defaultType?: 'relance' | 'convocation' | 'felicitations';
  onClose: () => void;
  onLoggedAction?: (msg: string) => void;
  config?: SchoolConfig;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  student,
  countryCode,
  defaultType = 'relance',
  onClose,
  onLoggedAction,
  config,
}) => {
  const [templateType, setTemplateType] = useState<'relance' | 'convocation' | 'felicitations'>(defaultType);
  const [copied, setCopied] = useState(false);

  const schoolName = config?.schoolName || 'Complexe Scolaire Privé ADLON';
  const academicYear = config?.academicYear || '2026-2027';

  // Generate message based on template
  const getInitialMessage = (type: 'relance' | 'convocation' | 'felicitations') => {
    switch (type) {
      case 'relance':
        return `Bonjour ${student.parentName},\n\nNous vous contactons depuis l'administration de ${schoolName} concernant la scolarité de votre enfant ${student.firstName} ${student.lastName} (Classe de ${student.classLevel}).\n\nÀ ce jour, le montant restant dû au titre de l'année scolaire ${academicYear} s'élève à ${formatFCFA(student.balanceRemaining)}.\n\nNous vous prions de bien vouloir procéder à la régularisation auprès de notre service comptabilité ou par transfert Mobile Money (Airtel Money / MTN Mobile Money) avant le 30 de ce mois afin de garantir la continuité de son suivi pédagogique.\n\nMerci de votre collaboration,\nLa Direction - ${schoolName}`;
      
      case 'convocation':
        return `Bonjour ${student.parentName},\n\nL'équipe de direction de ${schoolName} souhaite échanger avec vous concernant l'assiduité et le cadre éducatif de ${student.firstName} (Classe de ${student.classLevel}).\n\nNos registres indiquent une absence remarquée aux ${student.parentMeetingAbsences} dernières rencontres parents-enseignants. La réussite scolaire reposant sur une étroite collaboration famille-école, nous vous prions de bien vouloir convenir d'un rendez-vous avec le Directeur ou le professeur principal.\n\nCordialement,\nService Vie Scolaire & Direction - ${schoolName}`;

      case 'felicitations':
        return `Excellente nouvelle pour la famille de ${student.firstName} ${student.lastName} !\n\nNous avons l'honneur de vous féliciter au nom de ${schoolName} pour les remarquables résultats académiques de votre enfant au conseil de classe (Moyenne : ${student.gpa}/20 - Classé(e) ${student.classRank}e sur ${student.totalStudentsInClass} élèves en ${student.classLevel}).\n\nL'établissement salue son engagement ainsi que votre accompagnement exemplaire !\n\nBien cordialement,\nLa Direction Pédagogique - ${schoolName}`;
    }
  };

  const [customMessage, setCustomMessage] = useState(getInitialMessage(templateType));

  const handleTemplateChange = (type: 'relance' | 'convocation' | 'felicitations') => {
    setTemplateType(type);
    setCustomMessage(getInitialMessage(type));
  };

  const fullNormalizedNumber = cleanPhoneNumber(student.parentPhone, countryCode);
  const waLink = buildWhatsAppLink(student.parentPhone, countryCode, customMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    if (onLoggedAction) {
      onLoggedAction(`Message WhatsApp envoyé à ${student.parentName} (${student.parentPhone})`);
    }
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl max-w-xl w-full my-2 sm:my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] shadow-2xl border border-slate-200/80 dark:border-[#222F46] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-[#222F46] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">
              Communication WhatsApp Directe
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Destinataire : <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{student.parentName}</strong> (+{fullNormalizedNumber})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto overscroll-contain flex-1">
          {/* Segmented Control */}
          <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-2xl font-medium text-[#64748B] dark:text-[#94A3B8] overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTemplateChange('relance')}
              className={`flex-1 py-1.5 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
                templateType === 'relance'
                  ? 'bg-white dark:bg-[#1E293B] text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                  : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Relance Impayé
            </button>
            <button
              onClick={() => handleTemplateChange('convocation')}
              className={`flex-1 py-1.5 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
                templateType === 'convocation'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold shadow-xs'
                  : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Convocation
            </button>
            <button
              onClick={() => handleTemplateChange('felicitations')}
              className={`flex-1 py-1.5 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
                templateType === 'felicitations'
                  ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Félicitations
            </button>
          </div>

          {/* Text Editor */}
          <div className="space-y-1.5">
            <label className="block font-medium text-[#64748B] dark:text-[#94A3B8]">
              Corps du message pré-rempli (modifiable) :
            </label>
            <textarea
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] text-xs leading-relaxed focus:bg-white dark:focus:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>

          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Lien universel : <span className="font-mono text-[#0071E3] dark:text-[#38BDF8] font-semibold break-all">wa.me/{fullNormalizedNumber}?text=...</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#0F172A] border-t border-slate-200/80 dark:border-[#222F46] flex flex-col sm:flex-row justify-end gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="py-2.5 px-4 rounded-2xl border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>
          <button
            onClick={handleSend}
            className="py-2.5 px-5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer sur WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
