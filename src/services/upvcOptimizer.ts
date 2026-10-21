import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  UPVCCutItem,
  OptimizedBar,
  WastageSummary,
  UPVCWastageProject,
  StockBarCut,
} from '../types/upvcWastage';

export class UPVCOptimizerService {
  /**
   * Run 1D Cutting Stock Optimization using Best-Fit Decreasing (BFD)
   * with kerf allowance between cuts.
   */
  public static optimizeCutting(
    cuts: UPVCCutItem[],
    options: {
      stockLengthMm?: number;
      kerfMm?: number;
      reusableThresholdMm?: number;
      profileWeightKgPerM?: number;
      costPerKgInr?: number;
    } = {}
  ): { bars: OptimizedBar[]; summary: WastageSummary } {
    const stockLengthMm = options.stockLengthMm || 6000;
    const kerfMm = options.kerfMm !== undefined ? options.kerfMm : 4;
    const reusableThresholdMm = options.reusableThresholdMm || 800;
    const profileWeightKgPerM = options.profileWeightKgPerM || 1.25;
    const costPerKgInr = options.costPerKgInr || 190;

    // Expand all items by their quantity
    const individualPieces: StockBarCut[] = [];
    for (const item of cuts) {
      if (item.lengthMm <= 0 || item.quantity <= 0) continue;
      // Cap piece length to stock length
      const lengthMm = Math.min(item.lengthMm, stockLengthMm);
      for (let i = 0; i < item.quantity; i++) {
        individualPieces.push({
          cutId: `${item.id}-${i + 1}`,
          profileName: item.profileName || 'uPVC Profile',
          lengthMm,
          tag: item.tag,
          angle: item.angle || '45/45',
        });
      }
    }

    if (individualPieces.length === 0) {
      return {
        bars: [],
        summary: this.getEmptySummary(stockLengthMm),
      };
    }

    // Sort pieces by length descending (Best-Fit Decreasing)
    individualPieces.sort((a, b) => b.lengthMm - a.lengthMm);

    // Bars container
    const bars: {
      stockLengthMm: number;
      cuts: StockBarCut[];
      usedCutMm: number;
      kerfMm: number;
      remainingMm: number;
    }[] = [];

    for (const piece of individualPieces) {
      let bestBarIndex = -1;
      let minRemainingAfterCut = Infinity;

      // Find the bar that has enough room and leaves the least remaining space (Best Fit)
      for (let b = 0; b < bars.length; b++) {
        const bar = bars[b];
        const additionalKerf = bar.cuts.length > 0 ? kerfMm : 0;
        const requiredSpace = piece.lengthMm + additionalKerf;

        if (bar.remainingMm >= requiredSpace) {
          const spaceAfter = bar.remainingMm - requiredSpace;
          if (spaceAfter < minRemainingAfterCut) {
            minRemainingAfterCut = spaceAfter;
            bestBarIndex = b;
          }
        }
      }

      if (bestBarIndex !== -1) {
        // Place in existing bar
        const bar = bars[bestBarIndex];
        const additionalKerf = bar.cuts.length > 0 ? kerfMm : 0;
        bar.cuts.push(piece);
        bar.usedCutMm += piece.lengthMm;
        bar.kerfMm += additionalKerf;
        bar.remainingMm -= piece.lengthMm + additionalKerf;
      } else {
        // Start a new 6000mm stock bar
        bars.push({
          stockLengthMm,
          cuts: [piece],
          usedCutMm: piece.lengthMm,
          kerfMm: 0,
          remainingMm: stockLengthMm - piece.lengthMm,
        });
      }
    }

    // Convert to OptimizedBar structure
    const optimizedBars: OptimizedBar[] = bars.map((bar, index) => {
      const remnantMm = Math.max(0, bar.remainingMm);
      const usedTotalMm = bar.usedCutMm + bar.kerfMm;
      const wastagePct = stockLengthMm > 0 ? (remnantMm / stockLengthMm) * 100 : 0;
      return {
        barIndex: index + 1,
        stockLengthMm,
        cuts: bar.cuts,
        usedMm: bar.usedCutMm,
        kerfLossMm: bar.kerfMm,
        remnantMm,
        wastagePercentage: Number(wastagePct.toFixed(1)),
        isReusableRemnant: remnantMm >= reusableThresholdMm,
      };
    });

    // Compute Summary
    const totalBarsRequired = optimizedBars.length;
    const totalStockLengthMeters = (totalBarsRequired * stockLengthMm) / 1000;
    const totalCutLengthMeters =
      optimizedBars.reduce((sum, b) => sum + b.usedMm, 0) / 1000;
    const totalKerfLossMeters =
      optimizedBars.reduce((sum, b) => sum + b.kerfLossMm, 0) / 1000;
    const totalWastageMeters = totalStockLengthMeters - totalCutLengthMeters;
    const wastagePercentage =
      totalStockLengthMeters > 0
        ? Number(((totalWastageMeters / totalStockLengthMeters) * 100).toFixed(2))
        : 0;

    let reusableRemnantsCount = 0;
    let reusableRemnantsMeters = 0;
    let pureScrapMeters = 0;

    for (const b of optimizedBars) {
      if (b.isReusableRemnant) {
        reusableRemnantsCount++;
        reusableRemnantsMeters += b.remnantMm / 1000;
      } else {
        pureScrapMeters += (b.remnantMm + b.kerfLossMm) / 1000;
      }
    }

    const estimatedWeightKg = Number((totalStockLengthMeters * profileWeightKgPerM).toFixed(1));
    const estimatedWastageKg = Number((totalWastageMeters * profileWeightKgPerM).toFixed(2));
    const estimatedCostLossInr = Math.round(estimatedWastageKg * costPerKgInr);

    const summary: WastageSummary = {
      totalBarsRequired,
      stockBarLengthMm: stockLengthMm,
      totalStockLengthMeters: Number(totalStockLengthMeters.toFixed(2)),
      totalCutLengthMeters: Number(totalCutLengthMeters.toFixed(2)),
      totalWastageMeters: Number(totalWastageMeters.toFixed(2)),
      totalKerfLossMeters: Number(totalKerfLossMeters.toFixed(2)),
      wastagePercentage,
      totalPiecesCut: individualPieces.length,
      reusableRemnantsCount,
      reusableRemnantsMeters: Number(reusableRemnantsMeters.toFixed(2)),
      pureScrapMeters: Number(pureScrapMeters.toFixed(2)),
      estimatedWeightKg,
      estimatedWastageKg,
      estimatedCostLossInr,
    };

    return { bars: optimizedBars, summary };
  }

  private static getEmptySummary(stockBarLengthMm: number): WastageSummary {
    return {
      totalBarsRequired: 0,
      stockBarLengthMm,
      totalStockLengthMeters: 0,
      totalCutLengthMeters: 0,
      totalWastageMeters: 0,
      totalKerfLossMeters: 0,
      wastagePercentage: 0,
      totalPiecesCut: 0,
      reusableRemnantsCount: 0,
      reusableRemnantsMeters: 0,
      pureScrapMeters: 0,
      estimatedWeightKg: 0,
      estimatedWastageKg: 0,
      estimatedCostLossInr: 0,
    };
  }

  /**
   * Parse an uploaded Excel or CSV cutting list
   */
  public static async parseCuttingListFile(file: File): Promise<UPVCCutItem[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          });

          if (!rawRows || rawRows.length === 0) {
            resolve([]);
            return;
          }

          // Detect header row
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
            const rowStr = (rawRows[i] || []).join(' ').toLowerCase();
            if (
              rowStr.includes('length') ||
              rowStr.includes('cut') ||
              rowStr.includes('size') ||
              rowStr.includes('mm') ||
              rowStr.includes('qty') ||
              rowStr.includes('profile')
            ) {
              headerRowIndex = i;
              break;
            }
          }

          const headers = (rawRows[headerRowIndex] || []).map((h: any) =>
            String(h || '').trim().toLowerCase()
          );

          // Find column indices
          const profileIdx = headers.findIndex(
            (h: string) =>
              h.includes('profile') ||
              h.includes('section') ||
              h.includes('item') ||
              h.includes('name') ||
              h.includes('series')
          );
          const lengthIdx = headers.findIndex(
            (h: string) =>
              h.includes('length') ||
              h.includes('size') ||
              h.includes('cut') ||
              h.includes('mm') ||
              h.includes('dimension')
          );
          const qtyIdx = headers.findIndex(
            (h: string) =>
              h.includes('qty') ||
              h.includes('quantity') ||
              h.includes('count') ||
              h.includes('nos') ||
              h.includes('pieces')
          );
          const tagIdx = headers.findIndex(
            (h: string) =>
              h.includes('tag') ||
              h.includes('window') ||
              h.includes('remark') ||
              h.includes('description') ||
              h.includes('location')
          );
          const angleIdx = headers.findIndex((h: string) => h.includes('angle') || h.includes('miter'));

          const parsedItems: UPVCCutItem[] = [];

          for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!row || row.length === 0) continue;

            // Extract length
            let lengthVal = 0;
            if (lengthIdx !== -1 && row[lengthIdx] !== undefined) {
              const numStr = String(row[lengthIdx]).replace(/[^0-9.]/g, '');
              lengthVal = parseFloat(numStr) || 0;
            } else {
              // Try finding first numeric column > 50
              for (const col of row) {
                const n = parseFloat(String(col).replace(/[^0-9.]/g, ''));
                if (n >= 100 && n <= 6000) {
                  lengthVal = n;
                  break;
                }
              }
            }

            if (lengthVal <= 0) continue;

            // Extract quantity
            let qtyVal = 1;
            if (qtyIdx !== -1 && row[qtyIdx] !== undefined) {
              const q = parseInt(String(row[qtyIdx]).replace(/[^0-9]/g, ''), 10);
              if (q > 0) qtyVal = q;
            }

            const profileName =
              profileIdx !== -1 && row[profileIdx]
                ? String(row[profileIdx]).trim()
                : 'SCRAFT 60mm Casement Profile';

            const tag =
              tagIdx !== -1 && row[tagIdx]
                ? String(row[tagIdx]).trim()
                : `Cut ${parsedItems.length + 1}`;

            let angle: '45/45' | '90/90' | '45/90' = '45/45';
            if (angleIdx !== -1 && row[angleIdx]) {
              const aStr = String(row[angleIdx]).toLowerCase();
              if (aStr.includes('90')) angle = '90/90';
            }

            parsedItems.push({
              id: `cut-${Date.now()}-${parsedItems.length + 1}`,
              profileName,
              lengthMm: Math.round(lengthVal),
              quantity: qtyVal,
              angle,
              tag,
            });
          }

          resolve(parsedItems);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Export Cutting & Wastage plan to Excel (.xlsx)
   */
  public static exportToExcel(
    project: UPVCWastageProject,
    companyName: string = 'Raviraja Industries Private Limited'
  ): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Bar-by-Bar Cutting Layout
    const barRows: any[] = [
      [companyName],
      ['SCRAFT uPVC Profiles - Cutting Stock & Wastage Optimization Report'],
      [`Project: ${project.projectName}`, `Date: ${new Date().toLocaleDateString('en-IN')}`],
      [`Stock Bar Length: ${project.stockLengthMm} mm`, `Saw Blade Kerf: ${project.kerfMm} mm`],
      [''],
      ['Bar #', 'Profile', 'Cut Length (mm)', 'Tag / Window Code', 'Angle', 'Used mm', 'Leftover Remnant (mm)', 'Waste %', 'Reusable?'],
    ];

    project.optimizedBars.forEach((bar) => {
      bar.cuts.forEach((cut, cutIdx) => {
        barRows.push([
          `Bar ${bar.barIndex}${cutIdx === 0 ? '' : ' (cont)'}`,
          cut.profileName,
          cut.lengthMm,
          cut.tag || '-',
          cut.angle,
          cutIdx === 0 ? bar.usedMm : '',
          cutIdx === 0 ? bar.remnantMm : '',
          cutIdx === 0 ? `${bar.wastagePercentage}%` : '',
          cutIdx === 0 ? (bar.isReusableRemnant ? 'YES (Reusable)' : 'NO (Scrap)') : '',
        ]);
      });
      // Separator
      barRows.push(['', '', '', '', '', '', '', '', '']);
    });

    const wsBars = XLSX.utils.aoa_to_sheet(barRows);
    wsBars['!cols'] = [
      { wch: 12 },
      { wch: 28 },
      { wch: 16 },
      { wch: 22 },
      { wch: 10 },
      { wch: 12 },
      { wch: 22 },
      { wch: 12 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, wsBars, 'Cutting_Layout');

    // Sheet 2: Wastage & Cost Summary
    const summaryRows: any[] = [
      ['SCRAFT uPVC Profiles - Wastage & Cost Summary'],
      ['Metric', 'Value', 'Unit'],
      ['Total Stock Bars Required', project.summary.totalBarsRequired, 'Bars (6.0m)'],
      ['Stock Bar Length', project.summary.stockBarLengthMm, 'mm'],
      ['Total Stock Material Length', project.summary.totalStockLengthMeters, 'Meters'],
      ['Total Finished Cut Length', project.summary.totalCutLengthMeters, 'Meters'],
      ['Total Saw Kerf Loss', project.summary.totalKerfLossMeters, 'Meters'],
      ['Total Material Wastage', project.summary.totalWastageMeters, 'Meters'],
      ['Wastage Percentage', `${project.summary.wastagePercentage}%`, '%'],
      ['Total Pieces to Cut', project.summary.totalPiecesCut, 'Pieces'],
      ['Reusable Offcuts Count', project.summary.reusableRemnantsCount, 'Pieces (>=800mm)'],
      ['Reusable Offcuts Length', project.summary.reusableRemnantsMeters, 'Meters'],
      ['Pure Scrap Length', project.summary.pureScrapMeters, 'Meters'],
      ['Estimated Profile Weight', project.summary.estimatedWeightKg, 'kg'],
      ['Estimated Wastage Weight', project.summary.estimatedWastageKg, 'kg'],
      ['Estimated Financial Scrap Loss', `INR ${project.summary.estimatedCostLossInr}`, '₹ (INR)'],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Wastage_Summary');

    // Sheet 3: Raw Cut List
    const cutRows: any[] = [
      ['Input Cut List'],
      ['#', 'Profile Name', 'Length (mm)', 'Quantity', 'Total Length (mm)', 'Angle', 'Tag'],
    ];

    project.cuts.forEach((c, i) => {
      cutRows.push([
        i + 1,
        c.profileName,
        c.lengthMm,
        c.quantity,
        c.lengthMm * c.quantity,
        c.angle,
        c.tag || '-',
      ]);
    });

    const wsCuts = XLSX.utils.aoa_to_sheet(cutRows);
    wsCuts['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 },
      { wch: 10 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsCuts, 'Input_Cut_List');

    const fileName = `SCRAFT_uPVC_Cutting_Wastage_${project.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Export Printable Workshop PDF Cutting & Wastage Sheet
   */
  public static exportToPdf(
    project: UPVCWastageProject,
    companyName: string = 'Raviraja Industries Private Limited'
  ): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Header Branding
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SCRAFT uPVC PROFILES - WORKSHOP CUTTING & WASTAGE SHEET', 14, 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`${companyName} • Optimized Cutting Plan & Minimization`, 14, 17);

    doc.setTextColor(56, 189, 248); // sky-400
    doc.setFont('helvetica', 'bold');
    doc.text(`Project: ${project.projectName}`, 200, 10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 200, 17);

    // Summary Metric Banner
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(14, 28, 269, 20, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('TOTAL BARS NEEDED', 20, 34);
    doc.text('TOTAL CUT LENGTH', 75, 34);
    doc.text('TOTAL WASTAGE', 130, 34);
    doc.text('WASTAGE PERCENTAGE', 185, 34);
    doc.text('ESTIMATED LOSS', 240, 34);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${project.summary.totalBarsRequired} Bars (6.0m)`, 20, 42);
    doc.text(`${project.summary.totalCutLengthMeters} m`, 75, 42);

    doc.setTextColor(244, 63, 94); // rose-500
    doc.text(`${project.summary.totalWastageMeters} m`, 130, 42);

    const isGood = project.summary.wastagePercentage <= 6;
    doc.setTextColor(isGood ? 34 : 244, isGood ? 197 : 63, isGood ? 94 : 94);
    doc.text(`${project.summary.wastagePercentage}%`, 185, 42);

    doc.setTextColor(251, 191, 36); // amber-400
    doc.text(`INR ${project.summary.estimatedCostLossInr}`, 240, 42);

    // Table of Bar by Bar Cuts
    const tableData: any[] = [];
    project.optimizedBars.forEach((b) => {
      const cutDetails = b.cuts
        .map((c) => `${c.lengthMm}mm [${c.angle}] ${c.tag ? `(${c.tag})` : ''}`)
        .join('  +  ');

      tableData.push([
        `Bar #${b.barIndex}`,
        `${b.cuts.length} pcs`,
        cutDetails,
        `${b.usedMm} mm`,
        `${b.remnantMm} mm`,
        b.isReusableRemnant ? `YES (${b.remnantMm}mm)` : `SCRAP (${b.remnantMm}mm)`,
        `${b.wastagePercentage}%`,
      ]);
    });

    autoTable(doc, {
      startY: 52,
      head: [
        [
          'Bar #',
          'Cuts',
          'Cut Pieces (mm & Tag)',
          'Used mm',
          'Remnant mm',
          'Reusable Remnant?',
          'Waste %',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [14, 116, 144], // cyan-700
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 18 },
        2: { cellWidth: 120 },
        3: { cellWidth: 24 },
        4: { cellWidth: 24 },
        5: { cellWidth: 35 },
        6: { cellWidth: 22 },
      },
    });

    const fileName = `SCRAFT_uPVC_Cutting_Sheet_${project.projectName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(fileName);
  }
}
