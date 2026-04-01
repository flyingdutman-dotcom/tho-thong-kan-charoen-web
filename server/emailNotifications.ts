/**
 * Email notification system for document operations
 * Sends notifications when documents are created, approved, or rejected
 */

import { notifyOwner } from "./_core/notification";

export type DocumentAction = "created" | "approved" | "rejected" | "updated";
export type DocumentType = "pr" | "po" | "sr" | "jo" | "fsr" | "dl" | "quotation" | "do" | "invoice";

interface DocumentNotificationData {
  documentType: DocumentType;
  documentNumber: string;
  action: DocumentAction;
  createdBy?: string;
  approvedBy?: string;
  customerName?: string;
  amount?: number;
  status?: string;
  notes?: string;
}

const documentTypeLabels: Record<DocumentType, string> = {
  pr: "Purchase Requisition (ใบขอซื้อ)",
  po: "Purchase Order (ใบสั่งซื้อ)",
  sr: "Stock Requisition (ใบเบิกอุปกรณ์)",
  jo: "Job Order (ใบสั่งงาน)",
  fsr: "Field Service Report (ใบรายงานหน้างาน)",
  dl: "Daily Log (บันทึกประจำวัน)",
  quotation: "Quotation (ใบเสนอราคา)",
  do: "Delivery Order (ใบรับมอบงาน)",
  invoice: "Invoice (ใบแจ้งหนี้)",
};

const actionLabels: Record<DocumentAction, string> = {
  created: "สร้างใหม่",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธ",
  updated: "อัปเดต",
};

/**
 * Send email notification for document operation
 */
export async function sendDocumentNotification(
  data: DocumentNotificationData
): Promise<boolean> {
  try {
    const docTypeLabel = documentTypeLabels[data.documentType];
    const actionLabel = actionLabels[data.action];

    let content = `
เอกสาร: ${docTypeLabel}
เลขที่: ${data.documentNumber}
การดำเนินการ: ${actionLabel}
`;

    if (data.createdBy) {
      content += `ผู้สร้าง: ${data.createdBy}\n`;
    }

    if (data.approvedBy) {
      content += `ผู้อนุมัติ: ${data.approvedBy}\n`;
    }

    if (data.customerName) {
      content += `ลูกค้า: ${data.customerName}\n`;
    }

    if (data.amount) {
      content += `จำนวนเงิน: ${data.amount.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      })}\n`;
    }

    if (data.status) {
      content += `สถานะ: ${data.status}\n`;
    }

    if (data.notes) {
      content += `หมายเหตุ: ${data.notes}\n`;
    }

    const title = `${actionLabel} ${docTypeLabel} #${data.documentNumber}`;

    // Send notification to owner
    const result = await notifyOwner({
      title,
      content,
    });

    return result;
  } catch (error) {
    console.error("Error sending document notification:", error);
    return false;
  }
}

/**
 * Send batch notifications for multiple documents
 */
export async function sendBatchDocumentNotifications(
  notifications: DocumentNotificationData[]
): Promise<boolean[]> {
  const results = await Promise.all(
    notifications.map((notification) => sendDocumentNotification(notification))
  );
  return results;
}

/**
 * Send approval reminder notification
 */
export async function sendApprovalReminder(
  documentType: DocumentType,
  documentNumber: string,
  pendingCount: number
): Promise<boolean> {
  const docTypeLabel = documentTypeLabels[documentType];

  const result = await notifyOwner({
    title: `${pendingCount} เอกสาร ${docTypeLabel} รอการอนุมัติ`,
    content: `มีเอกสาร ${docTypeLabel} จำนวน ${pendingCount} รายการรอการอนุมัติ
เลขที่ล่าสุด: ${documentNumber}

กรุณาตรวจสอบและอนุมัติเอกสารเหล่านี้โดยเร็ว`,
  });

  return result;
}

/**
 * Send monthly summary notification
 */
export async function sendMonthlySummary(
  month: number,
  year: number,
  summary: Record<DocumentType, number>
): Promise<boolean> {
  const monthName = new Date(year, month - 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });

  let content = `สรุปเอกสารประจำเดือน ${monthName}\n\n`;

  let total = 0;
  Object.entries(summary).forEach(([docType, count]) => {
    const label = documentTypeLabels[docType as DocumentType];
    content += `${label}: ${count} รายการ\n`;
    total += count;
  });

  content += `\nรวมทั้งสิ้น: ${total} รายการ`;

  const result = await notifyOwner({
    title: `สรุปเอกสารประจำเดือน ${monthName}`,
    content,
  });

  return result;
}
