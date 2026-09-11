import { Student, StudentTermReport, SchoolConfig } from '../types';
import { formatRank } from './gradeCalculations';

export function generatePrintableReportHtml(
  report: StudentTermReport,
  student: Student,
  config?: SchoolConfig,
  autoPrint: boolean = false
): string {
  const schoolName = config?.schoolName || 'Établissement Scolaire';
  const schoolMotto = config?.schoolMotto || '';
  const schoolCity = config?.schoolCity || '';
  const schoolCountry = config?.schoolCountry || '';
  const schoolDepartment = config?.schoolDepartment || '';
  const schoolPhone = config?.schoolPhone || '';
  const academicYear = config?.academicYear || '2026-2027';
  const directorName = config?.directorName || 'La Direction';
  const approval = config?.ministerialApproval || '';

  const rows = report.grades
    .map((g, index) => {
      const points = Number((g.score * g.coefficient).toFixed(2));
      const isPassing = g.score >= 10;
      const isGood = g.score >= 14;
      const isWeak = g.score < 10;

      const scoreColor = isGood ? '#047857' : isWeak ? '#b91c1c' : '#1d4ed8';
      const scoreBg = isGood ? '#ecfdf5' : isWeak ? '#fef2f2' : '#eff6ff';

      const remark =
        g.teacherRemark ||
        (g.score >= 16
          ? 'Excellent travail, assimilation remarquable des notions.'
          : g.score >= 14
          ? 'Très bon travail, élève appliqué et participatif.'
          : g.score >= 12
          ? 'Travail satisfaisant, poursuivez ainsi vos efforts.'
          : g.score >= 10
          ? 'Résultats convenables mais des progrès sont possibles.'
          : g.score >= 8
          ? 'Ensemble insuffisant, travail et révisions à intensifier.'
          : 'Très insuffisant. Réaction et encadrement impératifs.');

      const bgRow = index % 2 === 0 ? '#ffffff' : '#f8fafc';

      return `
        <tr style="background-color: ${bgRow};">
          <td style="padding: 6px 10px; border: 1px solid #1e293b; font-weight: 700; color: #0f172a; font-size: 11.5px;">
            ${g.subjectName}
          </td>
          <td style="padding: 6px 8px; border: 1px solid #1e293b; font-size: 10.5px; color: #475569;">
            ${g.teacherName || 'Enseignant Titulaire'}
          </td>
          <td style="padding: 6px 8px; border: 1px solid #1e293b; text-align: center;">
            <span style="display: inline-block; padding: 2px 7px; background-color: ${scoreBg}; color: ${scoreColor}; font-weight: 800; font-family: 'Courier New', monospace; font-size: 12.5px; border-radius: 4px; border: 1px solid ${scoreColor}33;">
              ${g.score.toFixed(1)}
            </span>
          </td>
          <td style="padding: 6px 8px; border: 1px solid #1e293b; text-align: center; font-family: monospace; font-size: 11.5px; font-weight: 600;">
            ${g.coefficient}
          </td>
          <td style="padding: 6px 8px; border: 1px solid #1e293b; text-align: center; font-weight: 800; font-family: monospace; font-size: 12px; color: #0f172a;">
            ${points.toFixed(1)}
          </td>
          <td style="padding: 6px 8px; border: 1px solid #1e293b; text-align: center; font-family: monospace; font-size: 11px; color: #64748b;">
            ${g.classAverage ? g.classAverage.toFixed(1) : '—'}
          </td>
          <td style="padding: 6px 10px; border: 1px solid #1e293b; font-size: 10.5px; font-style: italic; color: #334155; line-height: 1.3;">
            ${remark}
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin_${student.lastName}_${student.firstName}_${student.classLevel}_${report.term}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 8mm 8mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #e2e8f0;
      margin: 0;
      padding: 16px;
      font-size: 11.5px;
      line-height: 1.35;
    }
    .print-actions-bar {
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-actions-bar span {
      font-weight: 600;
      font-size: 13px;
    }
    .btn-group {
      display: flex;
      gap: 10px;
    }
    .btn-print {
      background: #0071e3;
      color: #ffffff;
      border: none;
      padding: 7px 16px;
      font-size: 12.5px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-print:hover {
      background: #005bb5;
    }
    .btn-secondary {
      background: #334155;
      color: #f8fafc;
      border: 1px solid #475569;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-secondary:hover {
      background: #475569;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .print-actions-bar {
        display: none !important;
      }
      .bulletin-sheet {
        box-shadow: none !important;
        border: 2px solid #000000 !important;
        margin: 0 !important;
        max-width: 100% !important;
        padding: 5mm !important;
      }
    }
    .bulletin-sheet {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #0f172a;
      border-radius: 4px;
      padding: 22px 26px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      position: relative;
    }
    /* Congolese Flag Ribbon */
    .congo-tricolor {
      display: flex;
      height: 4px;
      width: 100%;
      margin-bottom: 12px;
    }
    .congo-green { flex: 1; background-color: #009543; }
    .congo-yellow { flex: 1; background-color: #fbde4a; }
    .congo-red { flex: 1; background-color: #dc241f; }

    .header-layout {
      display: table;
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 8px;
    }
    .header-cell {
      display: table-cell;
      vertical-align: middle;
    }
    .header-left {
      width: 32%;
      font-size: 9.5px;
      line-height: 1.25;
      color: #334155;
    }
    .header-center {
      width: 36%;
      text-align: center;
    }
    .header-right {
      width: 32%;
      text-align: right;
    }
    .cadre-session {
      display: inline-block;
      border: 1.5px solid #0f172a;
      background: #f8fafc;
      padding: 6px 12px;
      text-align: left;
      border-radius: 6px;
      font-size: 10.5px;
      line-height: 1.4;
    }
    .school-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 2px 0 1px 0;
    }
    .school-motto {
      font-size: 10px;
      font-style: italic;
      color: #0284c7;
      font-weight: 700;
    }
    .school-meta {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .title-banner {
      background: #0f172a;
      color: #ffffff;
      text-align: center;
      padding: 6px 10px;
      font-size: 12.5px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 4px;
      margin: 10px 0;
    }
    .student-panel {
      border: 1.5px solid #1e293b;
      background: #f8fafc;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }
    .student-grid {
      display: grid;
      grid-template-columns: 2.2fr 1fr 1.4fr 1.4fr;
      gap: 10px;
      margin-bottom: 8px;
    }
    .sub-meta-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 10px;
      padding-top: 8px;
      border-top: 1px dashed #94a3b8;
      align-items: center;
      font-size: 10.5px;
    }
    .rank-pill {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      border: 1.5px solid #d97706;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
    }
    .grades-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .grades-table th {
      background: #1e293b;
      color: #ffffff;
      border: 1px solid #1e293b;
      padding: 6px 8px;
      font-weight: 800;
      font-size: 10.5px;
      text-transform: uppercase;
    }
    .summary-section {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .summary-card {
      border: 1.5px solid #1e293b;
      border-radius: 6px;
      padding: 10px 14px;
      background: #ffffff;
    }
    .summary-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    .signatures-panel {
      display: grid;
      grid-template-columns: 1fr 1fr 1.15fr;
      gap: 12px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1.5px solid #0f172a;
    }
    .sig-box {
      border: 1.5px solid #1e293b;
      border-radius: 6px;
      padding: 8px 10px;
      height: 98px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      background: #ffffff;
      position: relative;
    }
    .stamp-mockup {
      position: absolute;
      right: 12px;
      bottom: 10px;
      width: 60px;
      height: 60px;
      border: 1.5px dashed #0284c7;
      border-radius: 50%;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5px;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
      opacity: 0.65;
      transform: rotate(-10deg);
      pointer-events: none;
    }
    .footer-note {
      text-align: center;
      font-size: 9px;
      color: #64748b;
      margin-top: 10px;
      border-top: 1px dotted #cbd5e1;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="print-actions-bar">
    <span>📑 Bulletin Scolaire Officiel • ${student.firstName} ${student.lastName} (${student.classLevel})</span>
    <div class="btn-group">
      <button class="btn-print" onclick="window.print()">
        🖨️ Imprimer / Enregistrer en PDF
      </button>
      <button class="btn-secondary" onclick="window.close()">
        Fermer
      </button>
    </div>
  </div>

  <div class="bulletin-sheet" id="printable-official-bulletin">
    <!-- Congolese Flag Ribbon -->
    <div class="congo-tricolor">
      <div class="congo-green"></div>
      <div class="congo-yellow"></div>
      <div class="congo-red"></div>
    </div>

    <!-- Institutional Header -->
    <div class="header-layout">
      <div class="header-cell header-left">
        <strong style="font-size: 11px; text-transform: uppercase; color: #0f172a; display: block;">${schoolCountry.toUpperCase()}</strong>
        <em style="font-size: 9px; color: #475569; display: block; margin-bottom: 2px;">Unité - Travail - Progrès</em>
        <span>Ministère de l'Enseignement Primaire, Secondaire et de l'Alphabétisation</span><br>
        <strong>${schoolDepartment}</strong><br>
        <span style="font-size: 8.5px; color: #64748b;">${approval}</span>
      </div>

      <div class="header-cell header-center">
        <div style="font-size: 18px; margin-bottom: 1px;">🎓</div>
        <div class="school-title">${schoolName}</div>
        <div class="school-motto">${schoolMotto}</div>
        <div class="school-meta">${schoolCity} • Tél: ${schoolPhone}</div>
      </div>

      <div class="header-cell header-right">
        <div class="cadre-session">
          <div><span style="color: #64748b; font-size: 9.5px; font-weight: 700;">ANNÉE SCOLAIRE :</span> <strong>${academicYear}</strong></div>
          <div><span style="color: #64748b; font-size: 9.5px; font-weight: 700;">PÉRIODE :</span> <strong style="color: #0071e3; text-transform: uppercase;">${report.term}</strong></div>
          <div style="font-size: 9px; color: #64748b; margin-top: 1px;">Édité le ${new Date().toLocaleDateString('fr-FR')}</div>
        </div>
      </div>
    </div>

    <!-- Official Title Banner -->
    <div class="title-banner">
      BULLETIN OFFICIEL DE NOTES & BILAN PÉDAGOGIQUE
    </div>

    <!-- Student Administrative Card -->
    <div class="student-panel">
      <div class="student-grid">
        <div>
          <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block;">Nom & Prénoms :</span>
          <strong style="font-size: 13.5px; color: #0f172a;">${student.firstName} ${student.lastName}</strong>
        </div>
        <div>
          <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block;">Matricule :</span>
          <strong style="font-family: monospace; font-size: 12px; color: #0f172a;">${student.matricule}</strong>
        </div>
        <div>
          <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block;">Classe & Cycle :</span>
          <strong style="color: #0f172a;">${student.classLevel} (${student.cycle})</strong>
        </div>
        <div>
          <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block;">Effectif Classe :</span>
          <strong style="color: #0f172a; font-family: monospace;">${report.totalStudents} élèves</strong>
        </div>
      </div>

      <div class="sub-meta-grid">
        <div>
          <span class="rank-pill">
            🏆 Rang : ${formatRank(report.classRank)} sur ${report.totalStudents} élèves
          </span>
        </div>
        <div>
          <span style="color: #64748b;">Note de Conduite :</span>
          <strong style="font-family: monospace; margin-left: 3px;">${report.conductScore} / 20</strong>
        </div>
        <div>
          <span style="color: #64748b;">Absences injustifiées :</span>
          <strong style="color: ${report.unexcusedAbsences > 0 ? '#b91c1c' : '#0f172a'}; font-family: monospace; margin-left: 3px;">
            ${report.unexcusedAbsences} j
          </strong>
        </div>
        <div>
          <span style="color: #64748b;">Retards constatés :</span>
          <strong style="font-family: monospace; margin-left: 3px;">${report.tardinessCount}</strong>
        </div>
      </div>
    </div>

    <!-- Grades Table -->
    <table class="grades-table">
      <thead>
        <tr>
          <th style="text-align: left;">Discipline / Matière</th>
          <th style="text-align: left; width: 140px;">Enseignant Titulaire</th>
          <th style="text-align: center; width: 75px;">Note /20</th>
          <th style="text-align: center; width: 50px;">Coeff</th>
          <th style="text-align: center; width: 75px;">Points</th>
          <th style="text-align: center; width: 75px;">Moy. Cl.</th>
          <th style="text-align: left;">Appréciation de l'Enseignant</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background: #1e293b; color: #ffffff; font-weight: 800; border-top: 2px solid #0f172a;">
          <td colspan="3" style="padding: 7px 10px; border: 1px solid #1e293b; text-transform: uppercase; font-size: 11px;">
            TOTAUX GÉNÉRAUX DU TRIMESTRE
          </td>
          <td style="padding: 7px 8px; border: 1px solid #1e293b; text-align: center; font-family: monospace; font-size: 12px;">
            ${report.totalCoefficients}
          </td>
          <td style="padding: 7px 8px; border: 1px solid #1e293b; text-align: center; font-family: monospace; font-size: 13px; color: #38bdf8;">
            ${report.totalPoints.toFixed(1)} pts
          </td>
          <td style="padding: 7px 8px; border: 1px solid #1e293b; text-align: center; font-size: 10.5px; color: #94a3b8;">
            —
          </td>
          <td style="padding: 7px 10px; border: 1px solid #1e293b; font-size: 10px; color: #cbd5e1;">
            Points max possibles : ${(report.totalCoefficients * 20).toFixed(0)} pts
          </td>
        </tr>
      </tfoot>
    </table>

    <!-- Academic Synthesis -->
    <div class="summary-section">
      <!-- Student Summary -->
      <div class="summary-card">
        <div class="summary-title">
          <span>Bilan Académique de l'Élève</span>
          <span style="color: #0071e3; font-weight: 800;">${report.term}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-weight: 700; color: #334155;">MOYENNE GÉNÉRALE :</span>
          <span style="font-size: 20px; font-weight: 900; font-family: 'Courier New', monospace; color: #0071e3;">
            ${report.generalAverage.toFixed(2)} / 20
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11px;">
          <span style="color: #475569;">Rang Officiel de la Classe :</span>
          <strong style="color: #b45309; font-size: 12px;">${formatRank(report.classRank)} sur ${report.totalStudents} élèves</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
          <span style="color: #475569;">Mention du Conseil de Classe :</span>
          <strong style="color: #047857;">${report.councilMention}</strong>
        </div>
      </div>

      <!-- Class Benchmarks -->
      <div class="summary-card">
        <div class="summary-title">
          <span>Repères Pédagogiques de la Classe</span>
          <span style="color: #64748b;">${student.classLevel}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; margin-bottom: 8px;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 2px; border-radius: 4px;">
            <span style="font-size: 9px; color: #64748b; display: block;">Moyenne Classe</span>
            <strong style="font-size: 13px; font-family: monospace;">${report.classAverage.toFixed(2)}</strong>
          </div>
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 2px; border-radius: 4px;">
            <span style="font-size: 9px; color: #047857; display: block;">Plus Forte</span>
            <strong style="font-size: 13px; font-family: monospace; color: #047857;">${report.highestAverage.toFixed(2)}</strong>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 4px 2px; border-radius: 4px;">
            <span style="font-size: 9px; color: #b91c1c; display: block;">Plus Faible</span>
            <strong style="font-size: 13px; font-family: monospace; color: #b91c1c;">${report.lowestAverage.toFixed(2)}</strong>
          </div>
        </div>
        <div style="font-size: 10px; color: #334155; line-height: 1.35; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
          <strong>Observation de la Direction :</strong> <em>${report.academicRemarks}</em>
        </div>
      </div>
    </div>

    <!-- Official Signatures & Stamp -->
    <div class="signatures-panel">
      <div class="sig-box">
        <strong style="font-size: 10.5px; color: #0f172a;">Le Parent ou Tuteur Légal</strong>
        <span style="font-size: 8.5px; color: #64748b; font-style: italic;">Date, mention « Lu et approuvé » & signature</span>
      </div>
      <div class="sig-box">
        <strong style="font-size: 10.5px; color: #0f172a;">Le Professeur Principal</strong>
        <span style="font-size: 8.5px; color: #64748b; font-style: italic;">Visa & Observations complémentaires</span>
      </div>
      <div class="sig-box">
        <div>
          <strong style="font-size: 10.5px; color: #0f172a;">Le Chef d'Établissement</strong><br>
          <span style="font-size: 9.5px; font-weight: 700; color: #0071e3;">${directorName}</span>
        </div>
        <div class="stamp-mockup">
          DIRECTION<br>ADLON<br>BRAZZA
        </div>
        <span style="font-size: 8.5px; color: #64748b; font-style: italic;">Cachet Officiel & Signature</span>
      </div>
    </div>

    <!-- Regulatory Footer -->
    <div class="footer-note">
      Document officiel délivré par le ${schoolName} • Conforme aux dispositions pédagogiques du Ministère • Fait à ${schoolCity} le ${new Date().toLocaleDateString('fr-FR')} • Réf : ADL-${student.matricule}-${report.term.replace(/\s+/g, '')}
    </div>
  </div>

  ${
    autoPrint
      ? `<script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 350);
          });
        </script>`
      : ''
  }
</body>
</html>`;
}

/**
 * Direct print trigger from the application.
 * If the on-screen printable element exists in DOM, it launches native window.print().
 * If not, or if blocked by iframe security, it opens a dedicated tab with auto-print.
 */
export function printReportCard(
  report: StudentTermReport,
  student: Student,
  config?: SchoolConfig
): void {
  try {
    // Check if the current document contains the bulletin element
    const el = document.getElementById('printable-official-bulletin');
    if (el) {
      window.print();
      return;
    }
  } catch (err) {
    console.warn('Native in-app print encountered an error, falling back to new tab', err);
  }

  // Fallback: open dedicated printable tab
  openPrintableReportInNewTab(report, student, config, true);
}

/**
 * Open the official printable report card in a dedicated browser tab using a Blob URL.
 * Works even inside strict iframe environments and avoids popup blockers.
 */
export function openPrintableReportInNewTab(
  report: StudentTermReport,
  student: Student,
  config?: SchoolConfig,
  autoPrint: boolean = true
): void {
  const html = generatePrintableReportHtml(report, student, config, autoPrint);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // Try window.open first
  const newWin = window.open(url, '_blank');
  if (!newWin) {
    // Fallback: create temporary anchor and click
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Clean up object URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/**
 * Download the complete official report card as an offline .html file.
 */
export function downloadReportCard(
  report: StudentTermReport,
  student: Student,
  config?: SchoolConfig
): void {
  const html = generatePrintableReportHtml(report, student, config, false);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = `${student.lastName}_${student.firstName}_${student.classLevel}_${report.term}`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '');
  a.href = url;
  a.download = `Bulletin_${safeName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
