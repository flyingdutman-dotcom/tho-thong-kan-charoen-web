/**
 * Export utilities for converting data to CSV and Excel formats
 */

export interface InquiryData {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  serviceType: string;
  message: string | null;
  status: string;
  createdAt: Date;
}

/**
 * Convert inquiries to CSV format
 */
export function inquiriesToCSV(inquiries: InquiryData[]): string {
  const headers = ["ลำดับที่", "ชื่อ", "เบอร์โทร", "อีเมล", "ประเภทบริการ", "ข้อความ", "สถานะ", "วันที่"];
  const rows = inquiries.map((inquiry, index) => [
    index + 1,
    inquiry.name,
    inquiry.phone,
    inquiry.email || "",
    inquiry.serviceType,
    (inquiry.message || "").replace(/"/g, '""'), // Escape quotes
    getStatusLabel(inquiry.status),
    formatDate(inquiry.createdAt),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(inquiries: InquiryData[], filename = "inquiries.csv") {
  const csv = inquiriesToCSV(inquiries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download Excel file (using simple XLSX format)
 */
export function downloadExcel(inquiries: InquiryData[], filename = "inquiries.xlsx") {
  // For simplicity, we'll create an Excel file using CSV format
  // A more robust solution would use a library like xlsx
  const csv = inquiriesToCSV(inquiries);
  const blob = new Blob([csv], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get Thai label for status
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    new: "ใหม่",
    contacted: "ติดต่อแล้ว",
    completed: "เสร็จสิ้น",
    rejected: "ปฏิเสธ",
  };
  return statusMap[status] || status;
}

/**
 * Format date to Thai format
 */
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
