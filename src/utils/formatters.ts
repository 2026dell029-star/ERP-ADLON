import { SchoolConfig, StudentCycle } from '../types';

export const STANDARD_CLASSES_BY_CYCLE: Record<StudentCycle, string[]> = {
  'Préscolaire': ['Petite Section (PS)', 'Moyenne Section (MS)', 'Grande Section (GS)'],
  'Primaire': ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'],
  'Collège': ['6ème', '5ème', '4ème', '3ème'],
  'Lycée': ['2nde A', '2nde C', '1ère A', '1ère C', '1ère D', 'Terminale A', 'Terminale C', 'Terminale D'],
};

export function getClassesForCycle(cycle: string, config?: SchoolConfig): string[] {
  if (cycle === 'all') {
    if (config?.classes && config.classes.length > 0) {
      return Array.from(new Set(config.classes.map((c) => c.name)));
    }
    return Object.values(STANDARD_CLASSES_BY_CYCLE).flat();
  }

  if (config?.classes) {
    const configClasses = config.classes.filter((c) => c.cycle === cycle).map((c) => c.name);
    if (configClasses.length > 0) {
      return Array.from(new Set(configClasses));
    }
  }

  return STANDARD_CLASSES_BY_CYCLE[cycle as StudentCycle] || [];
}

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' FCFA';
}

export function getClassMonthlyTuition(
  className: string,
  config?: SchoolConfig,
  _cycleFallback?: StudentCycle
): number {
  if (config?.classes) {
    const foundClass = config.classes.find((c) => c.name === className);
    if (foundClass && typeof foundClass.monthlyTuition === 'number') {
      return foundClass.monthlyTuition;
    }
  }

  // Zero default for clean unconfigured state
  return 0;
}

export function getClassAnnualTuition(
  className: string,
  config?: SchoolConfig,
  cycleFallback?: StudentCycle
): number {
  const monthly = getClassMonthlyTuition(className, config, cycleFallback);
  const months = config?.schoolDurationMonths || 10;
  return monthly * months;
}

export function getClassRegistrationFee(
  className: string,
  isNewStudent: boolean,
  config?: SchoolConfig
): number {
  if (config?.classes) {
    const foundClass = config.classes.find((c) => c.name === className);
    if (foundClass) {
      if (isNewStudent && typeof foundClass.registrationFee === 'number') {
        return foundClass.registrationFee;
      }
      if (!isNewStudent && typeof foundClass.reRegistrationFee === 'number') {
        return foundClass.reRegistrationFee;
      }
    }
  }

  // Fallback to global config values if not customized at class level
  return isNewStudent ? (config?.registrationFeeNew ?? 0) : (config?.registrationFeeOld ?? 0);
}

export function cleanPhoneNumber(phone: string, countryCode: string = '+242'): string {
  // Remove spaces, dots, dashes
  let cleaned = phone.replace(/[\s.-]/g, '');
  // If it starts with country code with or without +, strip it for normalization
  const codeWithoutPlus = countryCode.replace('+', '');
  if (cleaned.startsWith('+' + codeWithoutPlus)) {
    cleaned = cleaned.substring(codeWithoutPlus.length + 1);
  } else if (cleaned.startsWith(codeWithoutPlus)) {
    cleaned = cleaned.substring(codeWithoutPlus.length);
  }
  // Strip leading zero if present (e.g. 066543210 -> 66543210 or 05... -> 5...)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return codeWithoutPlus + cleaned;
}

export function buildWhatsAppLink(phone: string, countryCode: string, message: string): string {
  const fullNumber = cleanPhoneNumber(phone, countryCode);
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

export function calculateProrataTuition(
  annualTuition: number,
  schoolTotalMonths: number = 10,
  monthsEnrolled: number
): number {
  if (monthsEnrolled <= 0) return 0;
  if (monthsEnrolled >= schoolTotalMonths) return annualTuition;
  return Math.round((annualTuition / schoolTotalMonths) * monthsEnrolled);
}

export function getStatusBadge(status: 'solde' | 'partiel' | 'impaye') {
  switch (status) {
    case 'solde':
      return {
        label: 'Soldé',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'partiel':
      return {
        label: 'Partiel',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'impaye':
      return {
        label: 'Impayé',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
  }
}
