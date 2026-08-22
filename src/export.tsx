import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AttendancePDFRecord {
  name: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export function exportAttendancePDF(
  records: AttendancePDFRecord[],
  date: string
): void {
  const pdf = new jsPDF();

  // Header
  pdf.setFontSize(20);
  pdf.text('Dayflow HRMS', 14, 20);

  pdf.setFontSize(14);
  pdf.text('Attendance Report', 14, 30);

  pdf.setFontSize(10);
  pdf.text(`Date: ${date}`, 14, 38);
  pdf.text(`Total Records: ${records.length}`, 14, 44);

  // Attendance table
  autoTable(pdf, {
    startY: 52,
    head: [
      [
        'Employee',
        'Department',
        'Date',
        'Check In',
        'Check Out',
        'Status',
      ],
    ],
    body: records.map((record) => [
      record.name,
      record.department,
      record.date,
      record.checkIn,
      record.checkOut,
      record.status,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fontStyle: 'bold',
    },
  });

  // Footer
  const pageCount = pdf.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.setFontSize(8);
    pdf.text(
      `Dayflow HRMS • Page ${page} of ${pageCount}`,
      14,
      pdf.internal.pageSize.height - 10
    );
  }

  // Download
  pdf.save(`dayflow-attendance-${date}.pdf`);
}
