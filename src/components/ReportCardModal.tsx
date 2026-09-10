import React, { useState } from 'react';
import { Student, StudentTermReport, SchoolConfig } from '../types';
import { 
  X, 
  Printer, 
  Share2, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { 
  computeStudentReport, 
  formatRank, 
  generateWhatsAppReportText,
  TERMS,
  AcademicTerm
} from '../utils/gradeCalculations';
import { cleanPhoneNumber } from '../utils/formatters';

interface ReportCardModalProps {
  student: Student;
  allStudents: Student[];
  initialTerm?: AcademicTerm;
  config?: SchoolConfig;
  onClose: () => void;
  onSelectStudent?: (student: Student) => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  allStudents,
  initialTerm = 'Trimestre 1',
  config,
  onClose,
  onSelectStudent,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>(initialTerm);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Compute live report card data for this student and term
  const report: StudentTermReport = computeStudentReport(student, allStudents, selectedTerm, config);

  // Find classmates for prev/next navigation
  const classmates = allStudents.filter(
    (s) => s.classLevel.toLowerCase().trim() === student.classLevel.toLowerCase().trim()
  );
  const currentIndex = classmates.findIndex((s) => s.id === student.id);

  const handlePrev = () => {
    if (currentIndex > 0 && onSelectStudent) {
      onSelectStudent(classmates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < classmates.length - 1 && onSelectStudent) {
      onSelectStudent(classmates[currentIndex + 1]);
    }
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    const text = generateWhatsAppReportText(report, student, config);
    const cleaned = cleanPhoneNumber(student.parentPhone, config?.countryCode || '+242');
    const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const schoolName = config?.schoolName || 'Complexe Scolaire Privé ADLON';
  const schoolMotto = config?.schoolMotto || '« Rigueur - Discipline - Excellence »';
  const schoolCity = config?.schoolCity || 'Brazzaville';
  const schoolCountry = config?.schoolCountry || 'République du Congo';
  const schoolDepartment = config?.schoolDepartment || 'Direction Départementale de Brazzaville';
  const schoolPhone = config?.schoolPhone || '+242 06 611 22 33 / 05 544 33 22';
  const academicYear = config?.academicYear || '2026-2027';
  const directorName = config?.directorName || 'M. Gaston Bantsimba';
  const approval = config?.ministerialApproval || 'Agrément Ministériel N° 2024/MEP-DGEP/CAB';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container */}
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-2xl overflow-hidden my-2 sm:my-4 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] print:max-h-none print:border-none print:shadow-none print:rounded-none print:m-0 print:max-w-none print:w-full print:bg-white print:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Sticky & always visible, hidden when printing) */}
        <div className="print:hidden sticky top-0 z-30 shrink-0 px-4 sm:px-6 py-3 bg-slate-50/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#222F46] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Bulletin Trimestriel Officiel
              </h3>
              <p className="text-[10px] sm:text-xs text-[#64748B] dark:text-[#94A3B8]">
                {student.firstName} {student.lastName} ({student.classLevel}) • {schoolName}
              </p>
            </div>
          </div>

          {/* Term Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#151D2E] p-1 rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-xs">
            {TERMS.map((term) => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-colors ${
                  selectedTerm === term
                    ? 'bg-[#0071E3] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onSelectStudent && classmates.length > 1 && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="p-1.5 rounded-xl border border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] disabled:opacity-30 transition-colors"
                  title="Élève précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] px-1">
                  {currentIndex + 1}/{classmates.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentIndex >= classmates.length - 1}
                  className="p-1.5 rounded-xl border border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] disabled:opacity-30 transition-colors"
                  title="Élève suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer / PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-xs transition-colors"
              title="Transmettre au parent par WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#222F46] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bulletin Document */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-7 md:p-8 space-y-6 text-[#0F172A] dark:text-[#F8FAFC] print:text-black print:p-4 print:space-y-4 print:overflow-visible">
          {/* Official Congolese Header */}
          <div className="border-b-2 border-slate-900/80 dark:border-slate-400 pb-4 print:border-black">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center md:text-left print:grid-cols-3">
              {/* Left ministry block */}
              <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 print:text-black">
                <p className="font-bold uppercase tracking-wider text-slate-900 dark:text-white print:text-black">
                  {schoolCountry}
                </p>
                <p className="italic text-[10px]">Unité - Travail - Progrès</p>
                <p className="mt-0.5 text-[10px]">Ministère de l'Enseignement Primaire, Secondaire et de l'Alphabétisation</p>
                <p className="text-[10px] font-medium">{schoolDepartment}</p>
                {approval && <p className="text-[9px] text-slate-500 print:text-black">{approval}</p>}
              </div>

              {/* Center school emblem & title */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#0284C7] text-white mb-1 shadow-sm print:bg-none print:text-black">
                  <Building2 className="w-6 h-6" />
                </div>
                <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white print:text-black">
                  {schoolName}
                </h1>
                <p className="text-[10px] font-semibold text-[#0071E3] dark:text-[#38BDF8] print:text-black italic">
                  {schoolMotto}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 print:text-black">
                  {schoolCity} • Tél: {schoolPhone}
                </p>
              </div>

              {/* Right year & term block */}
              <div className="text-center md:text-right print:text-right text-[11px]">
                <div className="inline-block p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#222F46] print:border-black print:bg-white text-left">
                  <p className="font-semibold text-[10px] text-slate-500 dark:text-slate-400 print:text-black">ANNÉE SCOLAIRE :</p>
                  <p className="font-mono font-bold text-xs">{academicYear}</p>
                  <p className="font-semibold text-[10px] text-slate-500 dark:text-slate-400 print:text-black mt-1">PÉRIODE :</p>
                  <p className="font-bold text-xs text-[#0071E3] dark:text-[#38BDF8] print:text-black uppercase">
                    {selectedTerm}
                  </p>
                </div>
              </div>
            </div>

            {/* Official Title Ribbon */}
            <div className="mt-4 py-2 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-center font-bold tracking-wider text-xs sm:text-sm uppercase shadow-xs print:bg-slate-100 print:text-black print:border print:border-black">
              BULLETIN OFFICIEL DE NOTES & BILAN PÉDAGOGIQUE
            </div>
          </div>

          {/* Student Information Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] print:border print:border-black print:bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] print:text-black block uppercase">
                  Nom & Prénoms :
                </span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white print:text-black">
                  {student.firstName} {student.lastName}
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] print:text-black block uppercase">
                  Matricule :
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                  {student.matricule}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] print:text-black block uppercase">
                  Classe & Cycle :
                </span>
                <span className="font-bold text-slate-900 dark:text-white print:text-black">
                  {student.classLevel} ({student.cycle})
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] print:text-black block uppercase">
                  Effectif de la classe :
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                  {report.totalStudents} élèves
                </span>
              </div>
            </div>

            {/* Sub-row for Rank & Discipline */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-[#222F46] print:border-black grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800/40 print:border-black print:text-black">
                  Rang : {formatRank(report.classRank)} / {report.totalStudents}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] print:text-black">Note de conduite :</span>
                <span className="font-mono font-bold ml-1">{report.conductScore} / 20</span>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] print:text-black">Absences non justifiées :</span>
                <span className="font-mono font-bold ml-1 text-rose-600 dark:text-rose-400 print:text-black">
                  {report.unexcusedAbsences} j
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] print:text-black">Retards constatés :</span>
                <span className="font-mono font-bold ml-1">{report.tardinessCount}</span>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-[#222F46] print:border print:border-black">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] print:bg-slate-200 print:text-black print:border-black font-bold">
                  <th className="py-2.5 px-3">Discipline / Matière</th>
                  <th className="py-2.5 px-2 hidden sm:table-cell">Professeur</th>
                  <th className="py-2.5 px-3 text-center">Note /20</th>
                  <th className="py-2.5 px-2 text-center">Coeff</th>
                  <th className="py-2.5 px-3 text-center">Points (N×C)</th>
                  <th className="py-2.5 px-3 text-left">Appréciation de l'Enseignant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-[#222F46] print:divide-black">
                {report.grades.map((g, idx) => {
                  const points = Number((g.score * g.coefficient).toFixed(2));
                  const isPassing = g.score >= 10;
                  const isExcellent = g.score >= 15;

                  return (
                    <tr key={g.subjectId || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 print:text-black">
                        {g.subjectName}
                      </td>
                      <td className="py-2 px-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] print:text-black hidden sm:table-cell">
                        {g.teacherName || 'Titulaire'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-lg ${
                            isExcellent
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 print:bg-none print:text-black'
                              : isPassing
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 print:bg-none print:text-black'
                              : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 print:bg-none print:text-black'
                          }`}
                        >
                          {g.score}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                        {g.coefficient}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200 print:text-black">
                        {points}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-300 italic print:text-black">
                        {g.teacherRemark || (
                          g.score >= 16 ? 'Excellent travail, très bonne maîtrise.' :
                          g.score >= 14 ? 'Bon travail, participation active.' :
                          g.score >= 12 ? 'Assez bien, efforts réguliers.' :
                          g.score >= 10 ? 'Passable, travail convenable.' :
                          'Résultats insuffisants, révisions requises.'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Total Footer */}
              <tfoot>
                <tr className="bg-slate-50 dark:bg-[#0F172A] font-bold border-t-2 border-slate-300 dark:border-[#222F46] print:border-black print:bg-slate-100">
                  <td className="py-2.5 px-3 uppercase text-slate-900 dark:text-white print:text-black">
                    TOTAUX GÉNÉRAUX
                  </td>
                  <td className="hidden sm:table-cell"></td>
                  <td className="text-center text-[#64748B] dark:text-[#94A3B8] print:text-black text-[10px] uppercase">
                    —
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs">
                    {report.totalCoefficients}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-sm text-[#0071E3] dark:text-[#38BDF8] print:text-black">
                    {report.totalPoints} pts
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Synthetic Academic Summary & Class Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student General Results */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] shadow-xs space-y-3 print:border-black">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] print:text-black border-b border-slate-200 dark:border-[#222F46] pb-1.5">
                Bilan Académique de l'Élève
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                  MOYENNE GÉNÉRALE :
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-[#0071E3] dark:text-[#38BDF8] print:text-black">
                  {report.generalAverage} / 20
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                  Rang Trimestriel :
                </span>
                <span className="font-bold text-base text-amber-600 dark:text-amber-400 print:text-black">
                  {formatRank(report.classRank)} sur {report.totalStudents}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                  Décision & Mention du Conseil :
                </span>
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 print:text-black">
                  {report.councilMention}
                </span>
              </div>
            </div>

            {/* Class Benchmark Comparison */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] shadow-xs space-y-3 print:border-black">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] print:text-black border-b border-slate-200 dark:border-[#222F46] pb-1.5">
                Statistiques Pédagogiques de la Classe ({student.classLevel})
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] print:border-black">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] print:text-black block">Moyenne Classe</span>
                  <strong className="font-mono text-sm text-slate-900 dark:text-white print:text-black">
                    {report.classAverage}
                  </strong>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 print:border-black">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 print:text-black block">Plus Forte</span>
                  <strong className="font-mono text-sm text-emerald-700 dark:text-emerald-300 print:text-black">
                    {report.highestAverage}
                  </strong>
                </div>

                <div className="p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40 print:border-black">
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 print:text-black block">Plus Faible</span>
                  <strong className="font-mono text-sm text-rose-700 dark:text-rose-300 print:text-black">
                    {report.lowestAverage}
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-300 print:text-black pt-1">
                <span className="font-semibold">Observation de la direction : </span>
                <span className="italic">{report.academicRemarks}</span>
              </div>
            </div>
          </div>

          {/* Official Signature Boxes */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-700 print:border-black">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              {/* Box 1 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-[#222F46] print:border-black min-h-[90px] flex flex-col justify-between">
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 print:text-black">
                  Le Parent / Tuteur
                </span>
                <span className="text-[9px] text-slate-400 print:text-slate-600 italic">Signature & Date</span>
              </div>

              {/* Box 2 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-[#222F46] print:border-black min-h-[90px] flex flex-col justify-between">
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 print:text-black">
                  Le Professeur Principal
                </span>
                <span className="text-[9px] text-slate-400 print:text-slate-600 italic">Visa & Remarques</span>
              </div>

              {/* Box 3 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-[#222F46] print:border-black min-h-[90px] flex flex-col justify-between">
                <div>
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 print:text-black">
                    Le Chef d'Établissement
                  </span>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 print:text-black mt-0.5">
                    {directorName}
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 print:text-slate-600 italic">Cachet & Signature</span>
              </div>
            </div>

            {/* Footer stamp notice */}
            <div className="mt-3 text-center text-[10px] text-slate-500 dark:text-slate-400 print:text-black">
              {schoolName} • Document officiel certifié conforme • Fait à {schoolCity} le {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
