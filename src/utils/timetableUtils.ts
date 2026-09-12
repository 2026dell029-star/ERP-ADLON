import { TimetableSlot, WeekDay, StaffMember } from '../types';

export const WEEK_DAYS: WeekDay[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const STANDARD_TIME_SLOTS = [
  { start: '07:00', end: '08:00', label: '07h00 - 08h00' },
  { start: '08:00', end: '09:00', label: '08h00 - 09h00' },
  { start: '09:00', end: '10:00', label: '09h00 - 10h00' },
  { start: '10:00', end: '11:00', label: '10h00 - 11h00' },
  { start: '11:00', end: '12:00', label: '11h00 - 12h00' },
  { start: '12:00', end: '13:00', label: '12h00 - 13h00' },
  { start: '13:00', end: '14:00', label: '13h00 - 14h00' },
  { start: '14:00', end: '15:00', label: '14h00 - 15h00' },
  { start: '15:00', end: '16:00', label: '15h00 - 16h00' },
  { start: '16:00', end: '17:00', label: '16h00 - 17h00' },
];

/**
 * Converts a time string "HH:MM" into total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.replace('h', ':').trim();
  const parts = clean.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  return h * 60 + m;
}

/**
 * Calculates slot duration in hours (e.g. "12:00" to "14:00" = 2.0 hours)
 */
export function calculateSlotDurationHours(startTime: string, endTime: string): number {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  if (endMin <= startMin) return 0;
  return (endMin - startMin) / 60;
}

/**
 * Checks if two time intervals on the same day overlap
 */
export function doSlotsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  return minStartA < minEndB && minEndA > minStartB;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?: 'class' | 'teacher';
  message?: string;
  conflictingSlot?: TimetableSlot;
}

/**
 * Checks if adding or updating `newSlot` creates a conflict with existing slots.
 * - Anti-Double Booking Class: same className, same day, overlapping time
 * - Anti-Double Booking Teacher: same teacherId, same day, overlapping time
 */
export function checkTimetableConflict(
  newSlot: Omit<TimetableSlot, 'id'> & { id?: string },
  existingSlots: TimetableSlot[]
): ConflictCheckResult {
  for (const slot of existingSlots) {
    // Skip if checking against itself during edit
    if (newSlot.id && slot.id === newSlot.id) continue;

    // Must be on the same day to conflict
    if (slot.day !== newSlot.day) continue;

    // Check time overlap
    if (doSlotsOverlap(newSlot.startTime, newSlot.endTime, slot.startTime, slot.endTime)) {
      // 1. Class conflict (deux enseignants d'une même classe ne doivent pas avoir cours en même temps)
      if (slot.className.trim().toLowerCase() === newSlot.className.trim().toLowerCase()) {
        return {
          hasConflict: true,
          conflictType: 'class',
          message: `La classe "${slot.className}" est DÉJÀ OCCUPÉE le ${slot.day} de ${slot.startTime} à ${slot.endTime} par le cours de ${slot.subjectName} (${slot.teacherName}).`,
          conflictingSlot: slot,
        };
      }

      // 2. Teacher conflict (un même enseignant ne peut pas être dans deux classes au même moment)
      if (slot.teacherId && newSlot.teacherId && slot.teacherId === newSlot.teacherId) {
        return {
          hasConflict: true,
          conflictType: 'teacher',
          message: `L'enseignant(e) "${slot.teacherName}" est DÉJÀ EN COURS le ${slot.day} de ${slot.startTime} à ${slot.endTime} dans la classe "${slot.className}" (${slot.subjectName}).`,
          conflictingSlot: slot,
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Finds all conflicts existing within a list of slots
 */
export function findAllTimetableConflicts(slots: TimetableSlot[]): ConflictCheckResult[] {
  const conflicts: ConflictCheckResult[] = [];
  const checkedPairs = new Set<string>();

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slotA = slots[i];
      const slotB = slots[j];

      if (slotA.day !== slotB.day) continue;

      if (doSlotsOverlap(slotA.startTime, slotA.endTime, slotB.startTime, slotB.endTime)) {
        const pairKey = [slotA.id, slotB.id].sort().join('-');
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);

        // Same Class Conflict (2 teachers assigned to same class at same time)
        if (slotA.className.trim().toLowerCase() === slotB.className.trim().toLowerCase()) {
          conflicts.push({
            hasConflict: true,
            conflictType: 'class',
            message: `Double assignation pour la classe "${slotA.className}" le ${slotA.day} (${slotA.startTime} - ${slotA.endTime}) : ${slotA.teacherName} (${slotA.subjectName}) vs ${slotB.teacherName} (${slotB.subjectName}).`,
            conflictingSlot: slotB,
          });
        }
        // Same Teacher Conflict
        else if (slotA.teacherId && slotB.teacherId && slotA.teacherId === slotB.teacherId) {
          conflicts.push({
            hasConflict: true,
            conflictType: 'teacher',
            message: `Chevauchement pour l'enseignant ${slotA.teacherName} le ${slotA.day} (${slotA.startTime} - ${slotA.endTime}) : Classe ${slotA.className} (${slotA.subjectName}) vs Classe ${slotB.className} (${slotB.subjectName}).`,
            conflictingSlot: slotB,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Calculates total weekly hours for a given teacher based on all their timetable slots
 */
export function getTeacherWeeklyHours(teacherId: string, slots: TimetableSlot[]): number {
  if (!teacherId || !slots || !Array.isArray(slots)) return 0;
  return slots
    .filter((s) => s.teacherId === teacherId)
    .reduce((sum, s) => sum + calculateSlotDurationHours(s.startTime, s.endTime), 0);
}

/**
 * Calculates total monthly teaching hours for a teacher by traversing their weekly timetable slots.
 * Standard monthly coefficient: 4.3333 weeks/month (52 weeks / 12 months)
 */
export function getTeacherMonthlyHours(
  teacherId: string,
  slots: TimetableSlot[],
  weeksPerMonth: number = 4.3333
): number {
  if (!teacherId || !slots || !Array.isArray(slots)) return 0;
  const weeklyHours = getTeacherWeeklyHours(teacherId, slots);
  return Number((weeklyHours * weeksPerMonth).toFixed(1));
}

/**
 * Calculates monthly salary for a teacher based on payType, hourlyRate, and accumulated weekly hours.
 * Standard formula for hourly staff: (Weekly Hours * 4.3333) * Hourly Rate
 */
export function calculateTeacherMonthlySalary(
  teacher: Partial<StaffMember>,
  weeklyHours: number,
  weeksPerMonth: number = 4.3333
): number {
  if (teacher.payType === 'hourly') {
    const rate = Number(teacher.hourlyRate) || 0;
    return Math.round(weeklyHours * rate * weeksPerMonth);
  }
  return Number(teacher.monthlySalary) || 0;
}

/**
 * Calculates monthly salary directly from timetable slots for a teacher.
 */
export function calculateTeacherMonthlySalaryFromTimetable(
  teacher: Partial<StaffMember>,
  slots: TimetableSlot[],
  weeksPerMonth: number = 4.3333
): number {
  const weeklyHours = teacher.id ? getTeacherWeeklyHours(teacher.id, slots) : 0;
  return calculateTeacherMonthlySalary(teacher, weeklyHours, weeksPerMonth);
}

export interface TeacherMonthlyVolumeSummary {
  teacherId: string;
  teacherName: string;
  weeklyHours: number;
  monthlyHours: number;
  slotCount: number;
  payType: 'fixed' | 'hourly';
  hourlyRate: number;
  calculatedMonthlySalary: number;
}

/**
 * Iterates through the weekly timetable slots for all staff members (or teachers)
 * to automatically compute total monthly teaching hours and monthly salary summary.
 */
export function calculateAllTeachersMonthlyVolume(
  staffList: StaffMember[],
  slots: TimetableSlot[],
  weeksPerMonth: number = 4.3333
): Record<string, TeacherMonthlyVolumeSummary> {
  const result: Record<string, TeacherMonthlyVolumeSummary> = {};

  if (!Array.isArray(staffList)) return result;

  for (const staff of staffList) {
    if (staff.role !== 'Enseignant') continue;

    const teacherSlots = slots ? slots.filter((s) => s.teacherId === staff.id) : [];
    const weeklyHours = teacherSlots.reduce(
      (sum, s) => sum + calculateSlotDurationHours(s.startTime, s.endTime),
      0
    );
    const monthlyHours = Number((weeklyHours * weeksPerMonth).toFixed(1));
    const hourlyRate = staff.hourlyRate || 2500;
    const calculatedMonthlySalary = calculateTeacherMonthlySalary(staff, weeklyHours, weeksPerMonth);

    result[staff.id] = {
      teacherId: staff.id,
      teacherName: staff.name,
      weeklyHours,
      monthlyHours,
      slotCount: teacherSlots.length,
      payType: staff.payType || 'fixed',
      hourlyRate,
      calculatedMonthlySalary,
    };
  }

  return result;
}
