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

    // Prepare rows with Brand, Series, GST No., and GPS Location Link
    const formattedRows = visits.map((v) => {
      const brand =
        v.brand ||
        (v.interestedBrand.includes('SMART')
          ? 'SMART'
          : v.interestedBrand.includes('SCRAFT') || v.interestedBrand.includes('S CRAFT')
          ? 'S CRAFT'
          : 'OTHERS');

      const series = v.interestedSeries || v.interestedBrand;
      const gpsLink =
        v.gpsLocationLink ||
        (v.latitude && v.longitude ? `https://www.google.com/maps?q=${v.latitude},${v.longitude}` : '');

      return {
        'Sales Executive Name': v.salesExecutiveName,
        'Customer Visit Date': v.customerVisitDate,
        'Customer Name': v.customerName,
        'Mobile Number': v.mobileNumber,
        'Company Name': v.companyName,
        'GST No.': v.gstNumber || '',
        'Customer Type': v.customerType,
        'State': v.state,
        'District': v.district,
        'City / Town': v.city,
        'Customer Address': v.customerAddress,
        'GPS Location Link': gpsLink,
        'Brand': brand,
        'uPVC Series': series,
        'Current Brand In Use': v.currentBrand,
        'Quantity / Month': v.quantityPerMonth,
        'PI Sent?': v.piSent,
        'Lead Status': v.leadStatus,
        'Follow-up Date': v.followUpDate,
        'Visit Remarks': v.visitRemarks,
      };
    });

    const wsVisits = XLSX.utils.json_to_sheet(formattedRows);

    // Auto-fit column widths
    wsVisits['!cols'] = [
      { wch: 22 }, // Sales Executive Name
      { wch: 18 }, // Customer Visit Date
      { wch: 22 }, // Customer Name
      { wch: 18 }, // Mobile Number
      { wch: 26 }, // Company Name
      { wch: 20 }, // GST No.
      { wch: 16 }, // Customer Type
      { wch: 16 }, // State
      { wch: 16 }, // District
      { wch: 16 }, // City / Town
      { wch: 32 }, // Customer Address
      { wch: 42 }, // GPS Location Link
      { wch: 14 }, // Brand (S CRAFT, SMART, OTHERS)
      { wch: 36 }, // uPVC Series
      { wch: 20 }, // Current Brand In Use
      { wch: 20 }, // Quantity / Month
      { wch: 12 }, // PI Sent?
      { wch: 14 }, // Lead Status
      { wch: 16 }, // Follow-up Date
      { wch: 40 }, // Visit Remarks
    ];

    // Add active hyperlinks to GPS Location Link column (Column L, index 11)
    const range = XLSX.utils.decode_range(wsVisits['!ref'] || 'A1:T1');
    for (let R = 1; R <= range.e.r; ++R) {
      const cellRef = XLSX.utils.encode_cell({ c: 11, r: R }); // Column L: GPS Location Link
      const cell = wsVisits[cellRef];
      if (cell && cell.v && String(cell.v).startsWith('http')) {
        cell.l = { Target: String(cell.v), Tooltip: 'Click to open customer location in Google Maps' };
      }
    }

    XLSX.utils.book_append_sheet(wb, wsVisits, 'uPVC_Customer_Visits');

    // Sheet 2: Executive Summary & State Sales Overview
    const stateCounts: { [state: string]: number } = {};
    const statusCounts: { [status: string]: number } = {};
    const typeCounts: { [type: string]: number } = {};
    const brandCounts: { [brand: string]: number } = {};

    visits.forEach((v) => {
      stateCounts[v.state] = (stateCounts[v.state] || 0) + 1;
      statusCounts[v.leadStatus] = (statusCounts[v.leadStatus] || 0) + 1;
      typeCounts[v.customerType] = (typeCounts[v.customerType] || 0) + 1;
      const b =
        v.brand ||
        (v.interestedBrand.includes('SMART')
          ? 'SMART'
          : v.interestedBrand.includes('SCRAFT') || v.interestedBrand.includes('S CRAFT')
          ? 'S CRAFT'
          : 'OTHERS');
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    });

    const fabricatorCount = visits.filter((v) => v.customerType === 'Fabricator').length;
    const gpsTaggedCount = visits.filter(
      (v) => v.gpsLocationLink || (v.latitude && v.longitude)
    ).length;

    const summaryRows = [
      { Metric: 'Total Customer Visits', Value: visits.length },
      { Metric: 'GPS-Tagged Field Visits', Value: gpsTaggedCount },
      { Metric: 'Window & Door Fabricators', Value: fabricatorCount },
      { Metric: 'S CRAFT Brand Visits', Value: brandCounts['S CRAFT'] || 0 },
      { Metric: 'SMART Brand Visits', Value: brandCounts['SMART'] || 0 },
      { Metric: 'Other Brand Visits', Value: brandCounts['OTHERS'] || 0 },
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
    filterSummary?: string
  ) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, doc.internal.pageSize.width, 24, 'F');

    // Title & Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RAVIRAJA INDUSTRIES PRIVATE LIMITED', 14, 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('SCRAFT uPVC Profiles Division • Customer Visits, Fabricator Logs & GPS Tags', 14, 16);

    // Generation timestamp & metadata
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    const nowStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Generated: ${nowStr} | Total Records: ${visits.length}`, doc.internal.pageSize.width - 14, 16, {
      align: 'right',
    });

    // Summary Statistics Cards
    const totalVisits = visits.length;
    const hotLeads = visits.filter((v) => v.leadStatus === 'Hot').length;
    const wonDeals = visits.filter((v) => v.leadStatus === 'Won / Closed').length;
    const piCount = visits.filter((v) => v.piSent === 'Yes').length;
    const gpsCount = visits.filter((v) => v.gpsLocationLink || (v.latitude && v.longitude)).length;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 28, doc.internal.pageSize.width - 28, 18, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('ALL-INDIA FIELD SALES SUMMARY METRICS:', 18, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    const statText = [
      `Total Visits: ${totalVisits}`,
      `GPS Tagged: ${gpsCount}`,
      `Hot Fabricator Leads: ${hotLeads}`,
      `Deals Won: ${wonDeals}`,
      `PI Sent: ${piCount}`,
    ].join('    |    ');

    doc.text(statText, 18, 41);

    if (filterSummary) {
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Filter Applied: ${filterSummary}`, 14, 50);
    }

    // Prepare table data
    const tableRows = visits.map((v) => {
      const customerBlock = `${v.customerName}\n${v.companyName || ''}${
        v.gstNumber ? '\nGST: ' + v.gstNumber : ''
      }`.trim();

      const brand =
        v.brand ||
        (v.interestedBrand.includes('SMART')
          ? 'SMART'
          : v.interestedBrand.includes('SCRAFT') || v.interestedBrand.includes('S CRAFT')
          ? 'S CRAFT'
          : 'OTHERS');

      const series = v.interestedSeries || v.interestedBrand;
      const brandSeriesBlock = `Brand: ${brand}\n${series}`;

      const gpsLink =
        v.gpsLocationLink ||
        (v.latitude && v.longitude ? `https://www.google.com/maps?q=${v.latitude},${v.longitude}` : '');

      const locationBlock = `${v.city}, ${v.state}${gpsLink ? '\nGPS Tag:\n' + gpsLink : ''}`;

      return [
        v.customerVisitDate,
        customerBlock,
        v.mobileNumber,
        v.customerType,
        locationBlock,
        brandSeriesBlock,
        v.quantityPerMonth,
        v.piSent,
        v.leadStatus,
        v.followUpDate || '-',
        v.visitRemarks || '-',
      ];
    });

    autoTable(doc, {
      startY: 53,
      head: [
        [
          'Visit Date',
          'Customer / Firm / GST',
          'Mobile',
          'Type',
          'Location & GPS Tag Link',
          'Brand & uPVC Series',
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
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 51,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 36 },
        2: { cellWidth: 22 },
        3: { cellWidth: 16 },
        4: { cellWidth: 46 }, // Location & GPS Tag Link
        5: { cellWidth: 34 }, // Brand & Series
        6: { cellWidth: 18 },
        7: { cellWidth: 14, halign: 'center' },
        8: { cellWidth: 18, halign: 'center' },
        9: { cellWidth: 16 },
        10: { cellWidth: 32 },
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

            const gst =
              row['GST No.'] ||
              row['GST No'] ||
              row['GSTIN'] ||
              row['GST Number'] ||
              row['GST'] ||
              '';

            const gpsLink =
              row['GPS Location Link'] ||
              row['GPS Tag Link'] ||
              row['GPS Link'] ||
              row['Location Link'] ||
              row['Google Maps Link'] ||
              row['GPS'] ||
              '';

            let brand = row['Brand'] || '';
            const series =
              row['uPVC Series'] ||
              row['Series'] ||
              row['Interested uPVC Series'] ||
              row['Interested Brands'] ||
              '60mm Casement Series (Windows & Doors)';

            if (!brand) {
              if (String(series).includes('SMART')) {
                brand = 'SMART';
              } else if (String(series).includes('SCRAFT') || String(series).includes('S CRAFT')) {
                brand = 'S CRAFT';
              } else {
                brand = 'S CRAFT';
              }
            }

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

              // Parse lat/lng if available from link
              let latitude: number | undefined;
              let longitude: number | undefined;
              if (gpsLink) {
                const match = String(gpsLink).match(/q=([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/);
                if (match) {
                  latitude = parseFloat(match[1]);
                  longitude = parseFloat(match[2]);
                }
              }

              parsedVisits.push({
                id: `imported-${Date.now()}-${index}`,
                salesExecutiveName: String(executive).trim(),
                customerVisitDate: String(date).slice(0, 10),
                customerName: String(customerName).trim() || 'Prospective Client',
                mobileNumber: String(mobile).trim(),
                companyName: String(company).trim(),
                gstNumber: String(gst).trim().toUpperCase() || undefined,
                customerType: (row['Customer Type'] as CustomerType) || 'Fabricator',
                state: String(state).trim(),
                district: String(district).trim(),
                city: String(city).trim(),
                customerAddress: String(row['Customer Address'] || row['Address'] || '').trim(),
                gpsLocationLink: String(gpsLink).trim() || undefined,
                latitude,
                longitude,
                brand: String(brand).trim(),
                interestedSeries: String(series).trim(),
                interestedBrand: `${brand} - ${series}`,
                currentBrand: String(row['Current Brand In Use'] || row['Current Brand'] || 'Competitor').trim(),
                quantityPerMonth: String(row['Quantity / Month'] || row['Quantity'] || 'Pending').trim(),
                piSent: (row['PI Sent?'] as PISentStatus) || (row['PI Sent'] as PISentStatus) || 'No',
                leadStatus: (row['Lead Status'] as LeadStatus) || 'Warm',
                followUpDate: String(row['Follow-up Date'] || '').slice(0, 10),
                visitRemarks: String(row['Visit Remarks'] || row['Remarks'] || '').trim(),
                createdAt: Date.now() - index * 1000,
              });
            }
          });

          if (parsedVisits.length === 0) {
            reject(new Error('No customer visit rows found in file. Please ensure columns match the template.'));
          } else {
            resolve(parsedVisits);
          }
        } catch (err: any) {
          reject(new Error(`Failed to parse file: ${err.message}`));
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Generate downloadable Blank Excel Template with GST No, Brand, Series & GPS Location Link
   */
  public static downloadTemplate() {
    const wb = XLSX.utils.book_new();

    const templateRows = [
      {
        'Sales Executive Name': 'Rajesh Patel',
        'Customer Visit Date': '2026-10-21',
        'Customer Name': 'Suresh Shah',
        'Mobile Number': '+91 98250 12345',
        'Company Name': 'Apex Window Fabricators & uPVC Systems',
        'GST No.': '24AAACA1234F1Z2',
        'Customer Type': 'Fabricator',
        'State': 'Gujarat',
        'District': 'Ahmedabad',
        'City / Town': 'Ahmedabad GIDC',
        'Customer Address': 'Plot 42, GIDC Phase IV, Vatva',
        'GPS Location Link': 'https://www.google.com/maps?q=22.956600,72.632200',
        'Brand': 'S CRAFT',
        'uPVC Series': '60mm Casement Series (Windows & Doors)',
        'Current Brand In Use': 'Prominance uPVC',
        'Quantity / Month': '5 MT / Month',
        'PI Sent?': 'Yes',
        'Lead Status': 'Hot',
        'Follow-up Date': '2026-10-25',
        'Visit Remarks': 'Demonstrated 3-chamber casement corner sample. Approved trial order.',
      },
      {
        'Sales Executive Name': 'Praveen Sharma',
        'Customer Visit Date': '2026-10-20',
        'Customer Name': 'Deepak Joshi',
        'Mobile Number': '+91 94140 78901',
        'Company Name': 'Shree Radhey Fenestrations',
        'GST No.': '08AAECS9876J1Z4',
        'Customer Type': 'Fabricator',
        'State': 'Rajasthan',
        'District': 'Jaipur',
        'City / Town': 'VKIA Jaipur',
        'Customer Address': 'Road No. 9, Vishwakarma Industrial Area',
        'GPS Location Link': 'https://www.google.com/maps?q=26.974400,75.768100',
        'Brand': 'SMART',
        'uPVC Series': '2.5 Track Sliding Series (With Mesh)',
        'Current Brand In Use': 'NCL VEKA',
        'Quantity / Month': '12 MT / Month',
        'PI Sent?': 'Yes',
        'Lead Status': 'Won / Closed',
        'Follow-up Date': '2026-10-30',
        'Visit Remarks': 'Advance token received for SMART 2.5-track sliding profiles.',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 22 },
      { wch: 18 },
      { wch: 22 },
      { wch: 18 },
      { wch: 26 },
      { wch: 20 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 32 },
      { wch: 42 }, // GPS Location Link
      { wch: 14 }, // Brand
      { wch: 36 }, // uPVC Series
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 40 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'SCRAFT_uPVC_Visits_Import_Template.xlsx');
  }
}
