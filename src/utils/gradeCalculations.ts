import { Student, SubjectGrade, StudentTermReport, SchoolConfig } from '../types';

export const TERMS = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'] as const;
export type AcademicTerm = (typeof TERMS)[number];

// Compute subject score from Homework (Devoir) and Composition
export function computeSubjectScore(homework?: number, composition?: number, fallback: number = 12): number {
  if (homework !== undefined && composition !== undefined && !isNaN(homework) && !isNaN(composition)) {
    // Formule classique standard : (Devoir + 2 * Composition) / 3
    return Number(((homework + 2 * composition) / 3).toFixed(1));
  }
  if (homework !== undefined && !isNaN(homework)) return Number(homework.toFixed(1));
  if (composition !== undefined && !isNaN(composition)) return Number(composition.toFixed(1));
  return fallback;
}

// Default curriculum per class / cycle or configured via SchoolConfig
export function getDefaultSubjectsForClass(classLevel: string, cycle: string, config?: SchoolConfig): SubjectGrade[] {
  const normClass = classLevel.toLowerCase().trim();
  const normCycle = cycle.toLowerCase().trim();

  // Check if config has custom subjects for this class
  if (config && config.classSubjects) {
    // Try exact match or case-insensitive match
    const foundKey = Object.keys(config.classSubjects).find(
      (k) => k.toLowerCase().trim() === normClass
    );
    if (foundKey && config.classSubjects[foundKey] && config.classSubjects[foundKey].length > 0) {
      return config.classSubjects[foundKey].map((sub) => ({
        subjectId: sub.id,
        subjectName: sub.name,
        coefficient: sub.coefficient,
        score: 13.5,
        homeworkScore: 13,
        compositionScore: 14,
        teacherName: sub.defaultTeacher || 'Enseignant Titulaire',
      }));
    }
  }

  if (normCycle.includes('préscolaire') || normClass.includes('maternelle') || normClass.includes('section')) {
    return [
      { subjectId: 'lang', subjectName: 'Langage & Expression Orale', coefficient: 2, score: 16, homeworkScore: 16, compositionScore: 16, teacherName: 'Mme Brigitte Bouesso' },
      { subjectId: 'graph', subjectName: 'Graphisme & Écriture', coefficient: 2, score: 15.5, homeworkScore: 15, compositionScore: 16, teacherName: 'Mme Brigitte Bouesso' },
      { subjectId: 'eveil', subjectName: 'Éveil Sensoriel & Scientifique', coefficient: 2, score: 16.5, homeworkScore: 16, compositionScore: 17, teacherName: 'Mme Brigitte Bouesso' },
      { subjectId: 'motr', subjectName: 'Motricité & Coordination', coefficient: 1, score: 17, homeworkScore: 17, compositionScore: 17, teacherName: 'M. Paul Mavoungou' },
      { subjectId: 'cond', subjectName: 'Conduite & Socialisation', coefficient: 1, score: 18, homeworkScore: 18, compositionScore: 18, teacherName: 'Mme Brigitte Bouesso' },
    ];
  }

  if (normCycle.includes('primaire') || normClass.includes('cp') || normClass.includes('ce') || normClass.includes('cm')) {
    return [
      { subjectId: 'fran', subjectName: 'Français & Orthographe', coefficient: 3, score: 14, homeworkScore: 13.5, compositionScore: 14.2, teacherName: 'Mme Brigitte Bouesso' },
      { subjectId: 'math', subjectName: 'Mathématiques & Problèmes', coefficient: 3, score: 15, homeworkScore: 14.5, compositionScore: 15.2, teacherName: 'M. Aimé Loubaki' },
      { subjectId: 'scie', subjectName: 'Sciences & Éveil', coefficient: 2, score: 14.5, homeworkScore: 14, compositionScore: 14.8, teacherName: 'Mme Brigitte Bouesso' },
      { subjectId: 'hg', subjectName: 'Histoire & Géographie', coefficient: 1, score: 13.5, homeworkScore: 13, compositionScore: 13.8, teacherName: 'M. Serge Ngoma' },
      { subjectId: 'civ', subjectName: 'Éducation Civique & Morale', coefficient: 1, score: 16, homeworkScore: 16, compositionScore: 16, teacherName: 'Mme Brigitte Bouesso' },
      { subjectId: 'eps', subjectName: 'Éducation Physique (EPS)', coefficient: 1, score: 15, homeworkScore: 15, compositionScore: 15, teacherName: 'M. Paul Mavoungou' },
      { subjectId: 'cond', subjectName: 'Conduite & Tenue', coefficient: 1, score: 17, homeworkScore: 17, compositionScore: 17, teacherName: 'M. Paul Mavoungou' },
    ];
  }

  if (normCycle.includes('lycée') || normClass.includes('seconde') || normClass.includes('première') || normClass.includes('terminale') || normClass.includes('tle')) {
    return [
      { subjectId: 'math', subjectName: 'Mathématiques', coefficient: 5, score: 15.5, homeworkScore: 15, compositionScore: 15.8, teacherName: 'M. Aimé Loubaki' },
      { subjectId: 'pc', subjectName: 'Sciences Physiques & Chimie', coefficient: 5, score: 16, homeworkScore: 15.5, compositionScore: 16.2, teacherName: 'M. Aimé Loubaki' },
      { subjectId: 'svt', subjectName: 'Sciences de la Vie et de la Terre', coefficient: 5, score: 15, homeworkScore: 14.5, compositionScore: 15.2, teacherName: 'M. Aimé Loubaki' },
      { subjectId: 'phil', subjectName: 'Philosophie & Français', coefficient: 2, score: 13.5, homeworkScore: 13, compositionScore: 13.8, teacherName: 'M. Serge Ngoma' },
      { subjectId: 'hg', subjectName: 'Histoire-Géographie', coefficient: 2, score: 14, homeworkScore: 13.5, compositionScore: 14.2, teacherName: 'M. Serge Ngoma' },
      { subjectId: 'ang', subjectName: 'Anglais', coefficient: 2, score: 15, homeworkScore: 14.5, compositionScore: 15.2, teacherName: 'M. Serge Ngoma' },
      { subjectId: 'eps', subjectName: 'Éducation Physique (EPS)', coefficient: 1, score: 16.5, homeworkScore: 16.5, compositionScore: 16.5, teacherName: 'M. Paul Mavoungou' },
      { subjectId: 'cond', subjectName: 'Conduite & Discipline', coefficient: 1, score: 17, homeworkScore: 17, compositionScore: 17, teacherName: 'M. Paul Mavoungou' },
    ];
  }

  // Default: Collège (6ème, 5ème, 4ème, 3ème)
  return [
    { subjectId: 'math', subjectName: 'Mathématiques', coefficient: 4, score: 13, homeworkScore: 12.5, compositionScore: 13.2, teacherName: 'M. Aimé Loubaki' },
    { subjectId: 'fran', subjectName: 'Français / Expression Écrite', coefficient: 4, score: 13.5, homeworkScore: 13, compositionScore: 13.8, teacherName: 'M. Serge Ngoma' },
    { subjectId: 'svt', subjectName: 'Sciences de la Vie et de la Terre', coefficient: 2, score: 14, homeworkScore: 13.5, compositionScore: 14.2, teacherName: 'M. Aimé Loubaki' },
    { subjectId: 'pc', subjectName: 'Sciences Physiques', coefficient: 2, score: 12.5, homeworkScore: 12, compositionScore: 12.8, teacherName: 'M. Aimé Loubaki' },
    { subjectId: 'hg', subjectName: 'Histoire-Géographie', coefficient: 2, score: 13, homeworkScore: 12.5, compositionScore: 13.2, teacherName: 'M. Serge Ngoma' },
    { subjectId: 'ang', subjectName: 'Anglais', coefficient: 2, score: 14.5, homeworkScore: 14, compositionScore: 14.8, teacherName: 'M. Serge Ngoma' },
    { subjectId: 'eps', subjectName: 'Éducation Physique (EPS)', coefficient: 1, score: 15, homeworkScore: 15, compositionScore: 15, teacherName: 'M. Paul Mavoungou' },
    { subjectId: 'cond', subjectName: 'Conduite & Assiduité', coefficient: 1, score: 16, homeworkScore: 16, compositionScore: 16, teacherName: 'M. Paul Mavoungou' },
  ];
}

// Calculate weighted total points and average
export function calculateWeightedAverage(grades: SubjectGrade[]): {
  totalPoints: number;
  totalCoeff: number;
  average: number;
} {
  if (!grades || grades.length === 0) {
    return { totalPoints: 0, totalCoeff: 0, average: 0 };
  }

  let totalPoints = 0;
  let totalCoeff = 0;

  for (const g of grades) {
    const coeff = Math.max(1, g.coefficient || 1);
    const score = Math.min(20, Math.max(0, Number(g.score) || 0));
    totalPoints += score * coeff;
    totalCoeff += coeff;
  }

  const average = totalCoeff > 0 ? Number((totalPoints / totalCoeff).toFixed(2)) : 0;
  return { totalPoints: Number(totalPoints.toFixed(2)), totalCoeff, average };
}

// Get council mention based on average /20
export function getCouncilMention(average: number): {
  mention: string;
  badgeColor: string;
  textColor: string;
} {
  if (average >= 16) {
    return {
      mention: 'Tableau d\'Honneur avec Félicitations',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    };
  }
  if (average >= 14) {
    return {
      mention: 'Tableau d\'Honneur',
      badgeColor: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50',
      textColor: 'text-blue-700 dark:text-blue-300',
    };
  }
  if (average >= 12) {
    return {
      mention: 'Encouragements du Conseil',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50',
      textColor: 'text-indigo-700 dark:text-indigo-300',
    };
  }
  if (average >= 10) {
    return {
      mention: 'Passable - Travail convenable',
      badgeColor: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50',
      textColor: 'text-amber-700 dark:text-amber-300',
    };
  }
  if (average >= 8) {
    return {
      mention: 'Insuffisant - Effort requis',
      badgeColor: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50',
      textColor: 'text-orange-700 dark:text-orange-300',
    };
  }
  return {
    mention: 'Avertissement de Travail',
    badgeColor: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800/50',
    textColor: 'text-rose-700 dark:text-rose-300',
  };
}

// Format ordinal rank (1er, 2ème, 3ème, etc.)
export function formatRank(rank: number): string {
  if (rank === 1) return '1er';
  return `${rank}ème`;
}

// Get student grades for a given term, fallback to default if not yet stored
export function getStudentGradesForTerm(student: Student, term: string, config?: SchoolConfig): SubjectGrade[] {
  if (student.termGrades && student.termGrades[term] && student.termGrades[term].length > 0) {
    return student.termGrades[term];
  }
  // Generate consistent initial grades centered near student.gpa
  const defaults = getDefaultSubjectsForClass(student.classLevel, student.cycle, config);
  const targetGpa = student.gpa || 12;

  return defaults.map((sub, idx) => {
    // slight variation around student.gpa
    const offsets = [0.4, -0.6, 0.8, -0.3, 0.5, 0.1, -0.4, 0.2];
    const offset = offsets[idx % offsets.length];
    let score = Number((targetGpa + offset).toFixed(1));
    if (sub.subjectId === 'cond') score = student.conductScore || 16;
    score = Math.min(20, Math.max(0, score));
    const homework = Number(Math.max(0, Math.min(20, score - 0.5)).toFixed(1));
    const composition = Number(Math.max(0, Math.min(20, score + 0.5)).toFixed(1));
    return { 
      ...sub, 
      score,
      homeworkScore: sub.homeworkScore ?? homework,
      compositionScore: sub.compositionScore ?? composition
    };
  });
}

// Compute full class report card data for an individual student
export function computeStudentReport(
  student: Student,
  allStudents: Student[],
  term: string = 'Trimestre 1',
  config?: SchoolConfig
): StudentTermReport {
  // 1. Filter students of the same class
  const classStudents = allStudents.filter(
    (s) => s.classLevel.toLowerCase().trim() === student.classLevel.toLowerCase().trim()
  );

  const effectiveClassStudents = classStudents.length > 0 ? classStudents : [student];

  // 2. Compute averages for all students in this class
  const classAverages = effectiveClassStudents.map((s) => {
    const grades = getStudentGradesForTerm(s, term, config);
    const { average, totalPoints, totalCoeff } = calculateWeightedAverage(grades);
    return { studentId: s.id, average, totalPoints, totalCoeff, grades };
  });

  // Sort descending to find ranks
  classAverages.sort((a, b) => b.average - a.average);

  // Find target student's stats
  const targetIndex = classAverages.findIndex((entry) => entry.studentId === student.id);
  const classRank = targetIndex >= 0 ? targetIndex + 1 : 1;
  const targetEntry = classAverages[targetIndex] || {
    average: student.gpa,
    totalPoints: student.gpa * 10,
    totalCoeff: 10,
    grades: getStudentGradesForTerm(student, term, config),
  };

  const highestAverage = classAverages[0]?.average ?? targetEntry.average;
  const lowestAverage = classAverages[classAverages.length - 1]?.average ?? targetEntry.average;
  const sumAvg = classAverages.reduce((acc, cur) => acc + cur.average, 0);
  const classAverage = Number((sumAvg / classAverages.length).toFixed(2));

  const council = getCouncilMention(targetEntry.average);

  return {
    studentId: student.id,
    term,
    grades: targetEntry.grades,
    totalPoints: targetEntry.totalPoints,
    totalCoefficients: targetEntry.totalCoeff,
    generalAverage: targetEntry.average,
    classRank,
    totalStudents: effectiveClassStudents.length,
    classAverage,
    highestAverage,
    lowestAverage,
    conductScore: student.conductScore || 16,
    unexcusedAbsences: student.unexcusedAbsences || 0,
    tardinessCount: student.tardinessCount || 0,
    councilMention: council.mention,
    academicRemarks: student.academicRemarks || 'Élève régulier et attentif en classe.',
  };
}

// Generate preformatted WhatsApp text to notify parent about the report card
export function generateWhatsAppReportText(
  report: StudentTermReport, 
  student: Student, 
  config?: SchoolConfig
): string {
  const rankStr = formatRank(report.classRank);
  const schoolName = config?.schoolName || 'Complexe Scolaire Privé ADLON';
  const schoolYear = config?.academicYear || '2026-2027';
  const city = config?.schoolCity || 'Brazzaville';
  return `📢 *${schoolName.toUpperCase()} - BULLETIN OFFICIEL*
━━━━━━━━━━━━━━━━━━━━
🎓 *Élève :* ${student.firstName} ${student.lastName}
🏷️ *Matricule :* ${student.matricule}
🏫 *Classe :* ${student.classLevel} (${student.cycle})
📅 *Période :* ${report.term} • Année ${schoolYear}
━━━━━━━━━━━━━━━━━━━━
📊 *RÉSULTATS ACADÉMIQUES :*
• *Moyenne Générale :* *${report.generalAverage} / 20*
• *Rang Officiel :* *${rankStr}* sur ${report.totalStudents} élèves
• *Moyenne de la classe :* ${report.classAverage} / 20 (Max : ${report.highestAverage} | Min : ${report.lowestAverage})
• *Mention du Conseil :* ${report.councilMention}

🛡️ *VIE SCOLAIRE & ASSIDUITÉ :*
• Conduite : ${report.conductScore} / 20
• Absences non justifiées : ${report.unexcusedAbsences}
• Retards : ${report.tardinessCount}

💬 *Observation de la Direction :*
"${report.academicRemarks}"

_Ce bulletin est certifié conforme par la Direction Pédagogique de ${schoolName} (${city})._`;
}
