import React, { useState, useEffect } from 'react';
import { Student, StudentTermReport, SchoolConfig } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Building2,
  ExternalLink,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  computeStudentReport, 
  formatRank, 
  generateWhatsAppReportText,
  TERMS,
  AcademicTerm
} from '../utils/gradeCalculations';
import { 
  printReportCard, 
  openPrintableReportInNewTab, 
  downloadReportCard 
} from '../utils/reportCardPrinter';
import { cleanPhoneNumber } from '../utils/formatters';

interface ReportCardModalProps {
  student: Student;
  allStudents: Student[];
  initialTerm?: AcademicTerm;
  config?: SchoolConfig;
  autoPrint?: boolean;
  onClose: () => void;
  onSelectStudent?: (student: Student) => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  allStudents,
  initialTerm = 'Trimestre 1',
  config,
  autoPrint = false,
  onClose,
  onSelectStudent,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>(initialTerm);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

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

  const handlePrint = () => {
    setPrintNotice('Ouverture du gestionnaire d\'impression...');
    setTimeout(() => setPrintNotice(null), 3500);
    printReportCard(report, student, config);
  };

  const handleOpenNewTab = () => {
    setPrintNotice('Ouverture dans un nouvel onglet...');
    setTimeout(() => setPrintNotice(null), 3000);
    openPrintableReportInNewTab(report, student, config, true);
  };

  const handleDownload = () => {
    downloadReportCard(report, student, config);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppReportText(report, student, config);
    const parentPhone = cleanPhoneNumber(student.parentPhone || student.emergencyContact || '');
    const url = parentPhone
      ? `https://wa.me/${parentPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Trigger auto print if requested on mount
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  // School branding metadata
  const schoolName = config?.schoolName || 'Établissement Scolaire';
  const schoolMotto = config?.schoolMotto || 'Discipline - Travail - Succès';
  const schoolCity = config?.schoolCity || 'Brazzaville';
  const schoolCountry = config?.schoolCountry || 'République du Congo';
  const schoolDepartment = config?.schoolDepartment || "Département de l'Enseignement de Brazzaville";
  const schoolPhone = config?.schoolPhone || '';
  const academicYear = config?.academicYear || '2026-2027';
  const directorName = config?.directorName || 'La Direction';
  const approval = config?.ministerialApproval || "Agrément Ministériel N° MEPSA/CAB/SG/DGEP";
  const schoolAddress = config?.schoolAddress || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-auto max-h-[94vh] print:max-h-none print:border-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Modal Action Header (Hidden during Print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F17] rounded-t-3xl">
          {/* Left: Term Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl">
            {TERMS.map((term) => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTerm === term
                    ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Prev / Next navigation */}
            {classmates.length > 1 && (
              <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-700 pr-2 mr-1">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Élève précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1">
                  {currentIndex + 1}/{classmates.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentIndex >= classmates.length - 1}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Élève suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Direct Print Button (Active & Functional) */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Lancer l'impression directe du bulletin officiel"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>

            {/* New Tab Button */}
            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              title="Ouvrir le bulletin dans un nouvel onglet prêt à imprimer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Plein Écran</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Télécharger le bulletin officiel complet prêt à imprimer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Télécharger</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Transmettre le bilan au parent par WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative notification banners */}
        {printNotice && (
          <div className="print:hidden bg-blue-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
            <Printer className="w-4 h-4 animate-pulse" />
            {printNotice}
          </div>
        )}

        {downloadSuccess && (
          <div className="print:hidden bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Bulletin officiel téléchargé avec succès !
          </div>
        )}

        {/* Printable Bulletin Document Container */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6 md:p-8 bg-slate-100/60 dark:bg-[#0d121c] print:p-0 print:bg-white print:overflow-visible">
          <div 
            id="printable-official-bulletin"
            className="max-w-[780px] mx-auto bg-white dark:bg-[#151D2A] p-6 sm:p-8 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm print:border-none print:shadow-none print:p-0 print:max-w-full text-slate-900 dark:text-slate-100 print:text-black"
          >
            {/* National Tricolor Congolese Ribbon */}
            <div className="flex h-1.5 w-full mb-3 rounded-full overflow-hidden print:h-1">
              <div className="flex-1 bg-[#009543]"></div>
              <div className="flex-1 bg-[#FBDE4A]"></div>
              <div className="flex-1 bg-[#DC241F]"></div>
            </div>

            {/* Official Congolese Academic Header */}
            <div className="border-b-2 border-slate-900 dark:border-slate-600 pb-3 print:border-black">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center md:text-left print:grid-cols-3">
                {/* Left ministry block */}
                <div className="text-[10px] leading-snug text-slate-600 dark:text-slate-300 print:text-black">
                  <p className="font-black uppercase tracking-wider text-slate-900 dark:text-white print:text-black text-xs">
                    {schoolCountry}
                  </p>
                  <p className="italic text-[9px] text-slate-500 dark:text-slate-400 print:text-black">Unité - Travail - Progrès</p>
                  <p className="mt-1 font-medium text-[9.5px]">Ministère de l'Enseignement Primaire, Secondaire et de l'Alphabétisation</p>
                  <p className="font-bold text-[9.5px]">{schoolDepartment}</p>
                  {approval && <p className="text-[8.5px] text-slate-500 print:text-black mt-0.5">{approval}</p>}
                </div>

                {/* Center school emblem & title */}
                <div className="text-center">
                  {config?.schoolLogo ? (
                    <div className="inline-flex items-center justify-center max-h-12 rounded-xl bg-white dark:bg-slate-800 p-1 mb-1 overflow-hidden">
                      <img
                        src={config.schoolLogo}
                        alt={schoolName}
                        className="max-h-11 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0071E3] to-[#0284C7] text-white mb-1 shadow-xs print:bg-none print:text-black">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  <h1 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 dark:text-white print:text-black">
                    {schoolName}
                  </h1>
                  <p className="text-[10px] font-bold text-[#0071E3] dark:text-[#38BDF8] print:text-black italic">
                    {schoolMotto}
                  </p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 print:text-black">
                    {schoolCity} {schoolAddress ? `• ${schoolAddress}` : ''} {schoolPhone ? `• Tél: ${schoolPhone}` : ''}
                  </p>
                </div>

                {/* Right year & term block */}
                <div className="text-center md:text-right print:text-right text-xs">
                  <div className="inline-block p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 print:border-black print:bg-white text-left text-[10px]">
                    <p className="font-bold text-[9px] text-slate-500 dark:text-slate-400 print:text-black">ANNÉE SCOLAIRE :</p>
                    <p className="font-mono font-bold text-xs text-slate-900 dark:text-white print:text-black">{academicYear}</p>
                    <p className="font-bold text-[9px] text-slate-500 dark:text-slate-400 print:text-black mt-1">PÉRIODE :</p>
                    <p className="font-black text-xs text-[#0071E3] dark:text-[#38BDF8] print:text-black uppercase">
                      {selectedTerm}
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Title Ribbon */}
              <div className="mt-2.5 py-1.5 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-center font-black tracking-widest text-xs uppercase shadow-xs print:bg-slate-100 print:text-black print:border print:border-black">
                BULLETIN OFFICIEL DE NOTES & BILAN PÉDAGOGIQUE
              </div>
            </div>

            {/* Student Administrative Identification Card */}
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 print:border-black print:bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 print:text-black block uppercase">
                    Nom & Prénoms :
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 dark:text-white print:text-black">
                    {student.firstName} {student.lastName}
                  </strong>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 print:text-black block uppercase">
                    Matricule :
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    {student.matricule}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 print:text-black block uppercase">
                    Classe & Cycle :
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">
                    {student.classLevel} ({student.cycle})
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 print:text-black block uppercase">
                    Effectif de la classe :
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    {report.totalStudents} élèves
                  </span>
                </div>
              </div>

              {/* Sub-row for Rank & Discipline */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 print:border-black grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-300 dark:border-amber-800/60 print:border-black print:text-black">
                    <Award className="w-3.5 h-3.5" />
                    Rang : {formatRank(report.classRank)} / {report.totalStudents}
                  </div>
                </div>

                <div>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400 print:text-black">Note de conduite :</span>
                  <span className="font-mono font-bold ml-1 text-slate-900 dark:text-white print:text-black">{report.conductScore} / 20</span>
                </div>

                <div>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400 print:text-black">Absences non justifiées :</span>
                  <span className={`font-mono font-bold ml-1 ${report.unexcusedAbsences > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'} print:text-black`}>
                    {report.unexcusedAbsences} j
                  </span>
                </div>

                <div>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400 print:text-black">Retards constatés :</span>
                  <span className="font-mono font-bold ml-1 text-slate-900 dark:text-white print:text-black">{report.tardinessCount}</span>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700 print:border-black">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 print:bg-slate-200 print:text-black print:border-black font-bold text-[10px]">
                    <th className="py-2 px-3">Discipline / Matière</th>
                    <th className="py-2 px-2 hidden sm:table-cell">Professeur</th>
                    <th className="py-2 px-2.5 text-center">Note /20</th>
                    <th className="py-2 px-1.5 text-center">Coeff</th>
                    <th className="py-2 px-2.5 text-center">Points (N×C)</th>
                    <th className="py-2 px-2 text-center hidden sm:table-cell">Moy. Cl.</th>
                    <th className="py-2 px-3 text-left">Appréciation de l'Enseignant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-black">
                  {report.grades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                        Aucune matière configurée pour ce trimestre.
                      </td>
                    </tr>
                  ) : (
                    report.grades.map((g, idx) => {
                      const points = Number((g.score * g.coefficient).toFixed(2));
                      const isPassing = g.score >= 10;
                      const isExcellent = g.score >= 14;

                      return (
                        <tr key={g.subjectId || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-slate-100 print:text-black">
                            {g.subjectName}
                          </td>
                          <td className="py-1.5 px-2 text-[10.5px] text-slate-500 dark:text-slate-400 print:text-black hidden sm:table-cell">
                            {g.teacherName || 'Titulaire'}
                          </td>
                          <td className="py-1.5 px-2.5 text-center font-mono font-extrabold">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                                isExcellent
                                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 print:bg-none print:text-black'
                                  : isPassing
                                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 print:bg-none print:text-black'
                                  : g.score > 0
                                  ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 print:bg-none print:text-black'
                                  : 'text-slate-600 bg-slate-100 dark:bg-slate-800'
                              }`}
                            >
                              {g.score.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center font-mono font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                            {g.coefficient}
                          </td>
                          <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200 print:text-black">
                            {points.toFixed(1)}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[10px] text-slate-500 dark:text-slate-400 print:text-black hidden sm:table-cell">
                            {g.classAverage ? g.classAverage.toFixed(1) : '—'}
                          </td>
                          <td className="py-1.5 px-3 text-[10.5px] text-slate-600 dark:text-slate-300 italic print:text-black">
                            {g.teacherRemark || (
                              g.score >= 16 ? 'Excellent travail, très bonne assimilation.' :
                              g.score >= 14 ? 'Très bon travail, participation active.' :
                              g.score >= 12 ? 'Assez bien, efforts réguliers à poursuivre.' :
                              g.score >= 10 ? 'Passable, travail convenable à consolider.' :
                              g.score > 0 ? 'Résultats insuffisants, travail et rigueur requises.' :
                              'Non noté pour cette période.'
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Total Footer */}
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-900 font-bold border-t-2 border-slate-400 dark:border-slate-700 print:border-black print:bg-slate-100">
                    <td className="py-2 px-3 uppercase text-slate-900 dark:text-white print:text-black">
                      TOTAUX GÉNÉRAUX
                    </td>
                    <td className="hidden sm:table-cell"></td>
                    <td className="text-center text-slate-400 text-[10px] uppercase">
                      —
                    </td>
                    <td className="py-2 px-1.5 text-center font-mono text-xs text-slate-900 dark:text-white print:text-black">
                      {report.totalCoefficients}
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono text-xs font-extrabold text-[#0071E3] dark:text-[#38BDF8] print:text-black">
                      {report.totalPoints.toFixed(1)} pts
                    </td>
                    <td className="hidden sm:table-cell"></td>
                    <td className="text-[9.5px] text-slate-500 dark:text-slate-400 italic">
                      Sur un total possible de {(report.totalCoefficients * 20).toFixed(0)} pts
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Synthetic Academic Summary & Class Benchmarks */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Student General Results */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 space-y-2 print:border-black print:bg-white">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 print:text-black border-b border-slate-200 dark:border-slate-800 pb-1 flex justify-between">
                  <span>Bilan Académique de l'Élève</span>
                  <span className="text-[#0071E3] font-mono">{selectedTerm}</span>
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black">
                    MOYENNE GÉNÉRALE :
                  </span>
                  <span className="text-xl font-black font-mono text-[#0071E3] dark:text-[#38BDF8] print:text-black">
                    {report.generalAverage.toFixed(2)} / 20
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                    Rang de la Classe :
                  </span>
                  <span className="font-extrabold text-xs text-amber-700 dark:text-amber-400 print:text-black">
                    {formatRank(report.classRank)} sur {report.totalStudents} élèves
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 print:text-black">
                    Mention du Conseil :
                  </span>
                  <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 print:text-black">
                    {report.councilMention}
                  </span>
                </div>
              </div>

              {/* Class Benchmark Comparison */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 space-y-2 print:border-black print:bg-white">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 print:text-black border-b border-slate-200 dark:border-slate-800 pb-1 flex justify-between">
                  <span>Statistiques de la Classe</span>
                  <span className="text-slate-500 font-normal">{student.classLevel}</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 print:border-black">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 print:text-black block">Moyenne</span>
                    <strong className="font-mono text-xs text-slate-900 dark:text-white print:text-black">
                      {report.classAverage.toFixed(2)}
                    </strong>
                  </div>

                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 print:border-black">
                    <span className="text-[9px] text-emerald-700 dark:text-emerald-400 print:text-black block">Plus Forte</span>
                    <strong className="font-mono text-xs text-emerald-700 dark:text-emerald-400 print:text-black">
                      {report.highestAverage.toFixed(2)}
                    </strong>
                  </div>

                  <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 print:border-black">
                    <span className="text-[9px] text-rose-700 dark:text-rose-400 print:text-black block">Plus Faible</span>
                    <strong className="font-mono text-xs text-rose-700 dark:text-rose-400 print:text-black">
                      {report.lowestAverage.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 dark:text-slate-300 print:text-black pt-1">
                  <span className="font-bold">Observation de la direction : </span>
                  <span className="italic">{report.academicRemarks}</span>
                </div>
              </div>
            </div>

            {/* Official Signature Boxes & Stamp */}
            <div className="mt-4 pt-3 border-t-2 border-slate-300 dark:border-slate-700 print:border-black">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {/* Box 1 */}
                <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 print:border-black min-h-[84px] flex flex-col justify-between bg-white dark:bg-slate-900/40">
                  <span className="font-bold text-[10px] text-slate-700 dark:text-slate-200 print:text-black">
                    Le Parent ou Tuteur Légal
                  </span>
                  <span className="text-[8.5px] text-slate-400 print:text-slate-600 italic">Mention « Lu et approuvé » & signature</span>
                </div>

                {/* Box 2 */}
                <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 print:border-black min-h-[84px] flex flex-col justify-between bg-white dark:bg-slate-900/40">
                  <span className="font-bold text-[10px] text-slate-700 dark:text-slate-200 print:text-black">
                    Le Professeur Principal
                  </span>
                  <span className="text-[8.5px] text-slate-400 print:text-slate-600 italic">Visa & Remarques</span>
                </div>

                {/* Box 3 */}
                <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 print:border-black min-h-[84px] flex flex-col justify-between bg-white dark:bg-slate-900/40 relative">
                  <div>
                    <span className="font-bold text-[10px] text-slate-700 dark:text-slate-200 print:text-black">
                      Le Chef d'Établissement
                    </span>
                    <p className="text-[9.5px] font-bold text-[#0071E3] dark:text-[#38BDF8] print:text-black mt-0.5">
                      {directorName}
                    </p>
                  </div>
                  
                  {/* Visual stamp circle mockup */}
                  <div className="absolute right-2.5 bottom-1.5 w-12 h-12 rounded-full border border-dashed border-blue-500/50 flex items-center justify-center text-[6.5px] font-black text-blue-600/70 uppercase rotate-[-12deg] pointer-events-none">
                    DIRECTION<br/>SCOLAIRE
                  </div>

                  <span className="text-[8.5px] text-slate-400 print:text-slate-600 italic">Cachet & Signature</span>
                </div>
              </div>

              {/* Regulatory Footer notice */}
              <div className="mt-2.5 text-center text-[9px] text-slate-500 dark:text-slate-400 print:text-black">
                Document officiel certifié conforme • {schoolName} • Fait à {schoolCity} le {new Date().toLocaleDateString('fr-FR')} • Réf : ADL-{student.matricule}-{selectedTerm.replace(/\s+/g, '')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
