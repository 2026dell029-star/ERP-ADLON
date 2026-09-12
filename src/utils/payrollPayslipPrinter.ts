import { StaffMember, SchoolConfig, TimetableSlot } from '../types';
import { formatFCFA } from './formatters';
import {
  getTeacherWeeklyHours,
  getTeacherMonthlyHours,
  calculateTeacherMonthlySalaryFromTimetable,
  calculateSlotDurationHours,
} from './timetableUtils';

export interface PayslipData {
  staff: StaffMember;
  config?: SchoolConfig;
  slots: TimetableSlot[];
  monthYear?: string; // e.g. "Septembre 2026"
  bonus?: number;
  deductions?: number;
  notes?: string;
}

/**
 * Generates official HTML string for a teacher/staff payslip suitable for printing or saving as PDF
 */
export function generatePayslipHtml(data: PayslipData, autoPrint: boolean = false): string {
  const { staff, config, slots, monthYear = 'Septembre 2026', bonus = 0, deductions = 0, notes = '' } = data;

  const schoolName = config?.schoolName || 'Établissement Scolaire';
  const schoolMotto = config?.schoolMotto || 'Discipline - Travail - Succès';
  const schoolCity = config?.schoolCity || 'Brazzaville';
  const schoolCountry = config?.schoolCountry || 'République du Congo';
  const schoolPhone = config?.schoolPhone || '';
  const schoolAddress = config?.schoolAddress || '';
  const academicYear = config?.academicYear || '2026-2027';
  const directorName = config?.directorName || 'La Direction';
  const ministerialApproval = config?.ministerialApproval || 'Agrément Ministériel N° MEPSA/CAB/SG/DGEP';

  // Teacher specific slots & timetable calculation using dedicated timetableUtils functions
  const teacherSlots = slots.filter((s) => s.teacherId === staff.id);
  const weeklyHours = getTeacherWeeklyHours(staff.id, slots);
  const monthlyHours = getTeacherMonthlyHours(staff.id, slots);
  const isHourly = staff.payType === 'hourly';
  const rate = staff.hourlyRate || 2500;

  // Financials calculated directly from timetable volume
  const baseSalaryCalculated = calculateTeacherMonthlySalaryFromTimetable(staff, slots);

  const grossTotal = baseSalaryCalculated + bonus;
  const netPayable = Math.max(0, grossTotal - deductions);

  // Group slots by Day for clean timetable display
  const daysOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const slotsByDay = daysOrder
    .map((day) => {
      const daySlots = teacherSlots.filter((s) => s.day === day);
      return { day, slots: daySlots };
    })
    .filter((group) => group.slots.length > 0);

  const slotRows = teacherSlots.map((slot, index) => {
    const duration = calculateSlotDurationHours(slot.startTime, slot.endTime);
    const bgRow = index % 2 === 0 ? '#ffffff' : '#f8fafc';
    return `
      <tr style="background-color: ${bgRow};">
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">${slot.day}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; text-align: center;">${slot.startTime} - ${slot.endTime}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0071e3;">${duration}h</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${slot.className}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${slot.subjectName}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">${slot.roomNumber || '—'}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fiche_de_Paie_${staff.name.replace(/\s+/g, '_')}_${monthYear.replace(/\s+/g, '_')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 16px;
      font-size: 11px;
      line-height: 1.4;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-b: 2px solid #0071e3;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .school-info h1 {
      font-size: 18px;
      font-weight: 800;
      color: #0071e3;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: -0.3px;
    }
    .school-info p {
      margin: 1px 0;
      color: #475569;
      font-size: 10px;
    }
    .doc-title {
      text-align: right;
    }
    .doc-title h2 {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-period {
      display: inline-block;
      padding: 4px 10px;
      background: #eff6ff;
      color: #0071e3;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
    }

    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .card-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
    }
    .card-info h3 {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      margin: 0 0 8px 0;
      border-b: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 11px;
    }
    .info-label {
      color: #64748b;
    }
    .info-val {
      font-weight: 700;
      color: #0f172a;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 10.5px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      padding: 8px;
      text-align: left;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
    }
    td {
      padding: 7px 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-header {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin: 16px 0 8px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .net-box {
      background: #ecfdf5;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      margin-bottom: 20px;
    }
    .net-label {
      font-size: 13px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
    }
    .net-amount {
      font-size: 22px;
      font-weight: 900;
      color: #047857;
      font-family: 'Courier New', monospace;
    }

    .footer-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 12px;
      border-t: 1px solid #e2e8f0;
    }
    .sig-box {
      width: 45%;
      text-align: center;
      min-height: 80px;
    }
    .sig-title {
      font-weight: 700;
      font-size: 11px;
      color: #475569;
      margin-bottom: 40px;
    }
    .sig-name {
      font-[#0f172a];
      font-weight: 800;
      font-size: 11px;
    }

    .no-print-bar {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .btn-print {
      background: #0071e3;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-print:hover {
      background: #005bb5;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        background: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimer / Sauvegarder en PDF</button>
  </div>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="school-info">
        <h1>${schoolName}</h1>
        <p style="font-style: italic; font-weight: 600;">${schoolMotto}</p>
        <p>${schoolAddress} — ${schoolCity}, ${schoolCountry}</p>
        <p>Tél : ${schoolPhone || 'N/A'} • ${ministerialApproval}</p>
        <p>Année Scolaire : <strong>${academicYear}</strong></p>
      </div>
      <div class="doc-title">
        <h2>BULLETIN DE PAIE</h2>
        <div class="badge-period">Période : ${monthYear}</div>
        <p style="font-size: 9px; color: #64748b; margin-top: 4px;">Émis le : ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="grid-info">
      <!-- Employee Info -->
      <div class="card-info">
        <h3>Informations du Salarié / Enseignant</h3>
        <div class="info-row">
          <span class="info-label">Nom & Prénom :</span>
          <span class="info-val">${staff.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Matricule / ID :</span>
          <span class="info-val" style="font-family: monospace;">${staff.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fonction / Poste :</span>
          <span class="info-val">${staff.role}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type de Contrat :</span>
          <span class="info-val">${staff.contractType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mode de Rémunération :</span>
          <span class="info-val" style="color: ${isHourly ? '#d97706' : '#0071e3'};">
            ${isHourly ? 'Prestataire au Taux Horaire' : 'Salarié Fixe / Mensuel'}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Téléphone :</span>
          <span class="info-val">${staff.phone || 'Non renseigné'}</span>
        </div>
      </div>

      <!-- Timetable & Cumul Summary -->
      <div class="card-info">
        <h3>Volume Horaire & Calcul Automatique</h3>
        <div class="info-row">
          <span class="info-label">Cours programmés :</span>
          <span class="info-val">${teacherSlots.length} créneau(x)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Volume Hebdomadaire (EDT) :</span>
          <span class="info-val" style="font-size: 13px; color: #0071e3;">${weeklyHours}h / semaine</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cumul Mensuel Estimé :</span>
          <span class="info-val">${weeklyHours}h × 4.33 = <strong>${monthlyHours}h / mois</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Taux Horaire Réglementaire :</span>
          <span class="info-val">${isHourly ? `${formatFCFA(rate)} / heure` : 'Forfait fixe'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Classes Assignées :</span>
          <span class="info-val">${staff.assignedClasses?.join(', ') || 'N/A'}</span>
        </div>
      </div>
    </div>

    <!-- Timetable Details Breakdown -->
    <div class="section-header">
      <span>1. Détail du Planning des Cours (Emploi du Temps Hebdomadaire Fixe)</span>
      <span style="font-size: 10px; font-weight: 600; color: #64748b;">${weeklyHours}h cumulées / semaine</span>
    </div>

    ${teacherSlots.length === 0 ? `
      <div style="padding: 12px; background: #fffbebfb; border: 1px solid #fef3c7; border-radius: 6px; color: #b45309; text-align: center; margin-bottom: 16px;">
        Aucun créneau d'enseignement n'est actuellement consigné dans l'emploi du temps pour cet enseignant.
      </div>
    ` : `
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Jour</th>
            <th style="width: 20%; text-align: center;">Horaires</th>
            <th style="width: 15%; text-align: center;">Durée (h)</th>
            <th style="width: 20%;">Classe</th>
            <th style="width: 20%;">Matière</th>
            <th style="width: 10%; text-align: center;">Salle</th>
          </tr>
        </thead>
        <tbody>
          ${slotRows}
        </tbody>
      </table>
    `}

    <!-- Financial Breakdown Table -->
    <div class="section-header">
      <span>2. Décompte de la Rémunération de la Période</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 45%;">Désignation / Éléments de Paie</th>
          <th style="width: 20%; text-align: center;">Base / Unité</th>
          <th style="width: 15%; text-align: center;">Taux (FCFA)</th>
          <th style="width: 20%; text-align: right;">Montant Brut (FCFA)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700;">
            ${isHourly ? `Heures d'Enseignement Prestataire (${weeklyHours}h/sem)` : 'Salaire de Base Mensuel Fixe'}
          </td>
          <td style="text-align: center; font-family: monospace;">
            ${isHourly ? `${monthlyHours} heures` : '1 mois'}
          </td>
          <td style="text-align: center; font-family: monospace;">
            ${isHourly ? formatFCFA(rate) : '—'}
          </td>
          <td style="text-align: right; font-weight: 800; font-family: monospace; color: #0f172a;">
            ${formatFCFA(baseSalaryCalculated)}
          </td>
        </tr>
        ${bonus > 0 ? `
          <tr>
            <td style="font-weight: 600; color: #047857;">Prime / Indemnité spécifique</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-family: monospace;">${formatFCFA(bonus)}</td>
            <td style="text-align: right; font-weight: 800; font-family: monospace; color: #047857;">+ ${formatFCFA(bonus)}</td>
          </tr>
        ` : ''}
        ${deductions > 0 ? `
          <tr>
            <td style="font-weight: 600; color: #b91c1c;">Retenues / Avance sur salaire</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: center; font-family: monospace;">${formatFCFA(deductions)}</td>
            <td style="text-align: right; font-weight: 800; font-family: monospace; color: #b91c1c;">- ${formatFCFA(deductions)}</td>
          </tr>
        ` : ''}
      </tbody>
    </table>

    ${notes ? `
      <div style="font-size: 10px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 12px; color: #475569;">
        <strong>Remarques / Observations :</strong> ${notes}
      </div>
    ` : ''}

    <!-- Net Box -->
    <div class="net-box">
      <div>
        <div class="net-label">NET À PAYER AU SALARIÉ</div>
        <div style="font-size: 10px; color: #047857;">Règlement par virement / espèces / mobile money</div>
      </div>
      <div class="net-amount">${formatFCFA(netPayable)}</div>
    </div>

    <!-- Footer Signatures -->
    <div class="footer-signatures">
      <div class="sig-box">
        <div class="sig-title">Signature de l'Employé(e)</div>
        <div style="font-size: 9px; color: #94A3B8;">(Précédé de la mention "Lu et approuvé")</div>
        <div class="sig-name" style="margin-top: 30px;">${staff.name}</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">La Direction & Cachet de l'Établissement</div>
        <div class="sig-name" style="margin-top: 38px;">${directorName}</div>
      </div>
    </div>
  </div>

  ${autoPrint ? `<script>window.onload = function() { window.print(); }</script>` : ''}
</body>
</html>`;
}

/**
 * Triggers native browser print / save to PDF in a hidden or popup window
 */
export function printPayslip(data: PayslipData): void {
  const html = generatePayslipHtml(data, true);
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

/**
 * Opens printable payslip in a new browser tab
 */
export function openPayslipInNewTab(data: PayslipData): void {
  const html = generatePayslipHtml(data, false);
  const newTab = window.open('', '_blank');
  if (newTab) {
    newTab.document.open();
    newTab.document.write(html);
    newTab.document.close();
  }
}
