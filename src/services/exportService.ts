import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Expense, BudgetGoal } from '../types/expense';

export class ExportService {
  /**
   * Export expenses and category budget breakdown to Microsoft Excel (.xlsx)
   */
  public static exportToExcel(
    expenses: Expense[],
    budgets: BudgetGoal[],
    currencySymbol: string = '₹',
    title: string = 'Personal_Budget_Expenses'
  ) {
    const wb = XLSX.utils.book_new();

    // 1. Transactions Sheet
    const transactionsData = expenses.map((exp, idx) => ({
      '#': idx + 1,
      'Date': exp.date,
      'Merchant / Payee': exp.merchant || exp.title,
      'Category': exp.category,
      'Amount': exp.amount,
      'Currency': exp.currency || 'INR',
      'Payment Method': exp.paymentMethod,
      'Detection Type': exp.status === 'auto_detected' ? 'Gmail Auto-Sync' : exp.status === 'verified' ? 'Verified' : 'Manual Entry',
      'Email Subject': exp.emailSource?.subject || 'N/A',
      'Email Sender': exp.emailSource?.sender || 'N/A',
      'Notes': exp.notes || '',
    }));

    const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
    // Set column widths
    wsTransactions['!cols'] = [
      { wch: 5 },  // #
      { wch: 12 }, // Date
      { wch: 25 }, // Merchant
      { wch: 20 }, // Category
      { wch: 12 }, // Amount
      { wch: 10 }, // Currency
      { wch: 16 }, // Payment Method
      { wch: 18 }, // Detection Type
      { wch: 35 }, // Email Subject
      { wch: 30 }, // Email Sender
      { wch: 25 }, // Notes
    ];
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

    // 2. Budget vs Spent Summary Sheet
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const budgetData = budgets.map((b) => {
      const spent = categoryTotals[b.category] || 0;
      const remaining = b.limit - spent;
      const utilPercent = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      return {
        'Category': b.category,
        'Monthly Budget Limit': b.limit,
        'Actual Spent': spent,
        'Remaining Balance': remaining,
        'Utilization (%)': `${utilPercent}%`,
        'Status': spent > b.limit ? 'OVER BUDGET' : utilPercent > 80 ? 'WARNING (>80%)' : 'ON TRACK',
      };
    });

    const wsBudgets = XLSX.utils.json_to_sheet(budgetData);
    wsBudgets['!cols'] = [
      { wch: 22 }, // Category
      { wch: 18 }, // Budget Limit
      { wch: 15 }, // Actual Spent
      { wch: 18 }, // Remaining Balance
      { wch: 15 }, // Utilization
      { wch: 18 }, // Status
    ];
    XLSX.utils.book_append_sheet(wb, wsBudgets, 'Budget_Summary');

    // 3. Overall Summary Sheet
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const netSavings = totalBudget - totalSpent;

    const summaryData = [
      { Metric: 'Report Name', Value: 'SpendSync Personal Expense & Budget Report' },
      { Metric: 'Generated Date', Value: new Date().toLocaleString() },
      { Metric: 'Total Transactions Logged', Value: expenses.length },
      { Metric: 'Total Amount Spent', Value: `${currencySymbol} ${totalSpent.toLocaleString()}` },
      { Metric: 'Total Monthly Budget', Value: `${currencySymbol} ${totalBudget.toLocaleString()}` },
      { Metric: 'Net Remaining / Savings', Value: `${currencySymbol} ${netSavings.toLocaleString()}` },
      { Metric: 'Overall Budget Health', Value: totalSpent > totalBudget ? 'Over Budget' : 'Within Budget' },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 28 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Overview');

    // Trigger download
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${title}_${dateStr}.xlsx`);
  }

  /**
   * Export expenses and category budget breakdown to a clean, formatted PDF document
   */
  public static exportToPdf(
    expenses: Expense[],
    budgets: BudgetGoal[],
    currencySymbol: string = '₹',
    title: string = 'Personal Budget & Expense Statement'
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const netBalance = totalBudget - totalSpent;

    // Primary Header Background Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 36, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('SPENDSYNC', 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Automated Gmail Expense & Budget Tracker Statement', 14, 23);

    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.setFontSize(9);
    doc.text(`Generated: ${generatedDate}`, 150, 16);
    doc.text(`Records: ${expenses.length} Items`, 150, 23);

    // Summary KPI Metric Cards (Boxes)
    const cardY = 42;
    // Box 1: Total Spent
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, cardY, 56, 22, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL EXPENSES', 18, cardY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`${currencySymbol} ${totalSpent.toLocaleString()}`, 18, cardY + 16);

    // Box 2: Total Budget
    doc.roundedRect(77, cardY, 56, 22, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('MONTHLY BUDGET', 81, cardY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`${currencySymbol} ${totalBudget.toLocaleString()}`, 81, cardY + 16);

    // Box 3: Remaining / Net
    doc.roundedRect(140, cardY, 56, 22, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('REMAINING BALANCE', 144, cardY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(netBalance >= 0 ? 16 : 225, netBalance >= 0 ? 185 : 29, netBalance >= 0 ? 129 : 72);
    doc.text(`${currencySymbol} ${netBalance.toLocaleString()}`, 144, cardY + 16);

    // Section 1: Category Budget Breakdown Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Budget Category Status', 14, 72);

    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const budgetTableRows = budgets.map((b) => {
      const spent = categoryTotals[b.category] || 0;
      const remaining = b.limit - spent;
      const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      const statusText = spent > b.limit ? 'Over Budget' : pct > 80 ? 'Near Limit' : 'Healthy';
      return [
        b.category,
        `${currencySymbol} ${b.limit.toLocaleString()}`,
        `${currencySymbol} ${spent.toLocaleString()}`,
        `${currencySymbol} ${remaining.toLocaleString()}`,
        `${pct}%`,
        statusText,
      ];
    });

    autoTable(doc, {
      startY: 76,
      head: [['Category', 'Budget Limit', 'Spent', 'Remaining', 'Usage', 'Status']],
      body: budgetTableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 51,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 26, halign: 'right' },
        2: { cellWidth: 26, halign: 'right' },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 32, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    // Section 2: Detailed Transactions
    const finalY = (doc as any).lastAutoTable?.finalY || 130;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Expense Transactions List', 14, finalY + 12);

    const expenseTableRows = expenses.map((exp) => [
      exp.date,
      exp.merchant || exp.title,
      exp.category,
      exp.paymentMethod,
      exp.status === 'auto_detected' ? 'Gmail' : 'Manual',
      `${currencySymbol} ${exp.amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: finalY + 16,
      head: [['Date', 'Merchant / Payee', 'Category', 'Method', 'Source', 'Amount']],
      body: expenseTableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 51,
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 54 },
        2: { cellWidth: 40 },
        3: { cellWidth: 24 },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer on every page
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `SpendSync Statement - Page ${data.pageNumber} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10
        );
      },
    });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.pdf`);
  }
}
