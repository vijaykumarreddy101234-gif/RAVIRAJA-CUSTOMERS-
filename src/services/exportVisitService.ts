import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CustomerVisit, CustomerType, LeadStatus, PISentStatus } from '../types/customerVisit';

export class ExportVisitService {
  /**
   * Export SCRAFT uPVC customer visits to Microsoft Excel (.xlsx) matching company format
   */
  public static exportToExcel(
    visits: CustomerVisit[],
    filenamePrefix: string = 'SCRAFT_uPVC_Customer_Visits_Raviraja'
  ) {
    const wb = XLSX.utils.book_new();

    // Prepare rows matching the CSV column schema
    const formattedRows = visits.map((v) => ({
      'Sales Executive Name': v.salesExecutiveName,
      'Customer Visit Date': v.customerVisitDate,
      'Customer Name': v.customerName,
      'Mobile Number': v.mobileNumber,
      'Company Name': v.companyName,
      'Customer Type': v.customerType,
      'State': v.state,
      'District': v.district,
      'City / Town': v.city,
      'Customer Address': v.customerAddress,
      'Interested uPVC Series': v.interestedBrand,
      'Profile Color / Finish': v.profileColor || 'White',
      'Current Brand In Use': v.currentBrand,
      'Quantity / Month': v.quantityPerMonth,
      'PI Sent?': v.piSent,
      'Lead Status': v.leadStatus,
      'Follow-up Date': v.followUpDate,
      'Visit Remarks': v.visitRemarks,
    }));

    const wsVisits = XLSX.utils.json_to_sheet(formattedRows);

    // Auto-fit column widths
    wsVisits['!cols'] = [
      { wch: 22 }, // Sales Executive Name
      { wch: 18 }, // Customer Visit Date
      { wch: 22 }, // Customer Name
      { wch: 18 }, // Mobile Number
      { wch: 26 }, // Company Name
      { wch: 16 }, // Customer Type
      { wch: 16 }, // State
      { wch: 16 }, // District
      { wch: 16 }, // City / Town
      { wch: 32 }, // Customer Address
      { wch: 28 }, // Interested uPVC Series
      { wch: 22 }, // Profile Color
      { wch: 18 }, // Current Brand
      { wch: 20 }, // Quantity / Month
      { wch: 12 }, // PI Sent?
      { wch: 14 }, // Lead Status
      { wch: 16 }, // Follow-up Date
      { wch: 40 }, // Visit Remarks
    ];

    XLSX.utils.book_append_sheet(wb, wsVisits, 'uPVC_Customer_Visits');

    // Sheet 2: Executive Summary & State Sales Overview
    const stateCounts: { [state: string]: number } = {};
    const statusCounts: { [status: string]: number } = {};
    const typeCounts: { [type: string]: number } = {};

    visits.forEach((v) => {
      stateCounts[v.state] = (stateCounts[v.state] || 0) + 1;
      statusCounts[v.leadStatus] = (statusCounts[v.leadStatus] || 0) + 1;
      typeCounts[v.customerType] = (typeCounts[v.customerType] || 0) + 1;
    });

    const fabricatorCount = visits.filter((v) => v.customerType === 'Fabricator').length;

    const summaryRows = [
      { Metric: 'Total Customer Visits', Value: visits.length },
      { Metric: 'Window & Door Fabricators', Value: fabricatorCount },
      { Metric: 'Hot Fabricator Leads', Value: statusCounts['Hot'] || 0 },
      { Metric: 'Warm Leads', Value: statusCounts['Warm'] || 0 },
      { Metric: 'Converted / Won Deals', Value: statusCounts['Won / Closed'] || 0 },
      { Metric: 'Proforma Invoices (PI) Sent', Value: visits.filter((v) => v.piSent === 'Yes').length },
      { Metric: 'Generated Date', Value: new Date().toLocaleString() },
      { Metric: 'Organization', Value: 'Raviraja Industries Private Limited' },
      { Metric: 'Product Division', Value: 'SCRAFT uPVC Profiles (All-India Sales)' },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Sales_Summary');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`);
  }

  /**
   * Export SCRAFT customer visits to official PDF report
   */
  public static exportToPdf(
    visits: CustomerVisit[],
    filterLabel: string = 'All India Sales Report'
  ) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 28, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('RAVIRAJA INDUSTRIES PRIVATE LIMITED', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('SCRAFT uPVC PROFILES | All-India Field Sales & Fabricator Visit Report', 14, 19);

    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(`Generated: ${generatedDate}`, 235, 12);
    doc.text(`Total Records: ${visits.length} (${visits.filter(v => v.customerType === 'Fabricator').length} Fabricators)`, 215, 19);

    // KPI Summary boxes
    const hotCount = visits.filter((v) => v.leadStatus === 'Hot').length;
    const piSentCount = visits.filter((v) => v.piSent === 'Yes').length;
    const wonCount = visits.filter((v) => v.leadStatus === 'Won / Closed').length;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    // Box 1
    doc.roundedRect(14, 33, 62, 16, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL CUSTOMER VISITS', 18, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${visits.length} Visits`, 18, 45);

    // Box 2: Hot Leads
    doc.roundedRect(82, 33, 62, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('HOT FABRICATOR LEADS', 86, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`${hotCount} Leads`, 86, 45);

    // Box 3: PI Sent
    doc.roundedRect(150, 33, 62, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PROFORMA INVOICES SENT', 154, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`${piSentCount} Sent`, 154, 45);

    // Box 4: Closed / Won
    doc.roundedRect(218, 33, 65, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CONVERTED / CLOSED', 222, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`${wonCount} Closed`, 222, 45);

    // Table Data
    const tableRows = visits.map((v) => [
      v.customerVisitDate,
      `${v.customerName}\n${v.companyName || ''}`,
      v.mobileNumber,
      v.customerType,
      `${v.city}, ${v.state}`,
      v.interestedBrand,
      v.quantityPerMonth,
      v.piSent,
      v.leadStatus,
      v.followUpDate || '-',
      v.visitRemarks || '-',
    ]);

    autoTable(doc, {
      startY: 53,
      head: [
        [
          'Visit Date',
          'Customer / Company',
          'Mobile',
          'Type',
          'Location',
          'Brand',
          'Qty/Mo',
          'PI Sent',
          'Status',
          'Follow-up',
          'Remarks',
        ],
      ],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: 51,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 38 },
        2: { cellWidth: 24 },
        3: { cellWidth: 20 },
        4: { cellWidth: 28 },
        5: { cellWidth: 24 },
        6: { cellWidth: 22 },
        7: { cellWidth: 16, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
        9: { cellWidth: 20 },
        10: { cellWidth: 38 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `SCRAFT Sales Report | Raviraja Industries Pvt Ltd - Page ${data.pageNumber} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 8
        );
      },
    });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`SCRAFT_Customer_Visits_Report_${dateStr}.pdf`);
  }

  /**
   * Parse uploaded Excel or CSV file into CustomerVisit objects
   */
  public static parseFile(file: File): Promise<CustomerVisit[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const bstr = e.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          // Check if it's the 2-row header template or flat data
          const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const parsedVisits: CustomerVisit[] = [];

          rawRows.forEach((row, index) => {
            const customerName =
              row['Customer Name'] ||
              row['customerName'] ||
              row['Customer'] ||
              row['Name'] ||
              row['Client Name'] ||
              '';

            const mobile =
              row['Mobile Number'] ||
              row['Mobile'] ||
              row['Phone'] ||
              row['Contact Number'] ||
              '';

            const company =
              row['Company Name'] ||
              row['Company'] ||
              row['Firm Name'] ||
              row['Organization'] ||
              '';

            // Only consider rows that look like customer records
            if (customerName || company || mobile) {
              const executive =
                row['Sales Executive Name'] ||
                row['Sales Executive'] ||
                row['Executive'] ||
                'Raviraja Sales Team';

              const date =
                row['Customer Visit Date'] ||
                row['Visit Date'] ||
                row['Date'] ||
                new Date().toISOString().split('T')[0];

              const state = row['State'] || 'Gujarat';
              const district = row['District'] || '';
              const city = row['City / Town'] || row['City'] || row['Town'] || district || state;

              parsedVisits.push({
                id: `imported-${Date.now()}-${index}`,
                salesExecutiveName: String(executive).trim(),
                customerVisitDate: String(date).slice(0, 10),
                customerName: String(customerName).trim() || 'Prospective Client',
                mobileNumber: String(mobile).trim(),
                companyName: String(company).trim(),
                customerType: (row['Customer Type'] as CustomerType) || 'Distributor',
                state: String(state).trim(),
                district: String(district).trim(),
                city: String(city).trim(),
                customerAddress: String(row['Customer Address'] || row['Address'] || '').trim(),
                interestedBrand: String(row['Interested Brand'] || row['Brand'] || 'SCRAFT Premium').trim(),
                currentBrand: String(row['Current Brand'] || 'Competitor').trim(),
                quantityPerMonth: String(row['Quantity / Month'] || row['Quantity'] || '500 Units').trim(),
                piSent: (row['PI Sent?'] || row['PI Sent'] || 'No') as PISentStatus,
                leadStatus: (row['Lead Status'] || row['Status'] || 'Warm') as LeadStatus,
                followUpDate: String(row['Follow-up Date'] || row['Followup Date'] || '').slice(0, 10),
                visitRemarks: String(row['Visit Remarks'] || row['Remarks'] || row['Notes'] || '').trim(),
                createdAt: Date.now() - index * 1000,
              });
            }
          });

          resolve(parsedVisits);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  }
}
