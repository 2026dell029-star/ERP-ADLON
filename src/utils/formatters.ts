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
  if (!phone) return '';

  // Remove spaces, dots, dashes, parentheses
  let cleaned = phone.trim().replace(/[\s.()\-]/g, '');
  const codeWithoutPlus = countryCode.replace('+', '').trim() || '242';

  // Strip leading + or country code if already present
  if (cleaned.startsWith('+' + codeWithoutPlus)) {
    cleaned = cleaned.substring(codeWithoutPlus.length + 1);
  } else if (cleaned.startsWith(codeWithoutPlus)) {
    cleaned = cleaned.substring(codeWithoutPlus.length);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle Congo (+242) specific logic
  if (codeWithoutPlus === '242') {
    // Congo national phone numbers have 9 digits and start with '0' (e.g. 055438655, 067696157).
    // If the user typed an 8-digit number without '0' (e.g. 55438655), prepend '0'.
    if (cleaned.length === 8 && !cleaned.startsWith('0')) {
      cleaned = '0' + cleaned;
    }
    // Do NOT strip the leading '0'! Keep it so cleaned has 9 digits starting with '0'.
  } else {
    // For other countries where leading zero is a trunk code that must be stripped:
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
  }

  return codeWithoutPlus + cleaned;
}

export function formatDisplayPhoneNumber(phone: string, countryCode: string = '+242'): string {
  if (!phone) return '';
  const fullDigits = cleanPhoneNumber(phone, countryCode);
  if (fullDigits.startsWith('242') && fullDigits.length === 12) {
    const local = fullDigits.substring(3); // e.g. '055438655'
    return `+242 ${local.substring(0, 2)} ${local.substring(2, 5)} ${local.substring(5, 7)} ${local.substring(7)}`;
  }
  return '+' + fullDigits;
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
