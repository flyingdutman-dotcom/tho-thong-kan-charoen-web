import React from "react";

interface DocumentData {
  [key: string]: any;
}

interface DocumentPrintTemplateProps {
  documentType: string;
  data: DocumentData;
}

export default function DocumentPrintTemplate({ documentType, data }: DocumentPrintTemplateProps) {
  const getDocumentTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      pr: "ใบขอซื้อ (Purchase Requisition)",
      po: "ใบสั่งซื้อ (Purchase Order)",
      sr: "ใบเบิกอุปกรณ์ (Stock Requisition)",
      jo: "ใบสั่งงาน (Job Order)",
      fsr: "ใบรายงานหน้างาน (Field Service Report)",
      dl: "บันทึกประจำวัน (Daily Log)",
      quotation: "ใบเสนอราคา (Quotation)",
      do: "ใบรับมอบงาน (Delivery Order)",
      invoice: "ใบแจ้งหนี้ (Invoice)",
    };
    return titles[type] || "เอกสาร";
  };

  const formatDate = (date: any) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatCurrency = (value: any) => {
    if (!value) return "0.00";
    return parseFloat(value).toFixed(2);
  };

  return (
    <div className="print-template bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="border-b-4 border-primary pb-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ท</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">บริษัท ท่อทองการเจริญ จำกัด</h1>
              <p className="text-sm text-gray-600">บริการลอกท่อระบายน้ำและรับเหมาทั่วไป</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-secondary">{getDocumentTitle(documentType)}</p>
            <p className="text-xs text-gray-500">เลขที่: {data.prNumber || data.poNumber || data.srNumber || data.joNumber || data.fsrNumber || data.dlNumber || data.quoteNumber || data.doNumber || data.invoiceNumber || "-"}</p>
          </div>
        </div>
      </div>

      {/* Document Type Specific Content */}
      {documentType === "pr" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ผู้ขอซื้อ</p>
              <p className="font-semibold">{data.requestedBy || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่</p>
              <p className="font-semibold">{formatDate(data.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดสินค้า</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">รายการ</th>
                  <th className="border p-2 text-right">ราคาประมาณ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{data.itemDescription || "-"}</td>
                  <td className="border p-2 text-right">{formatCurrency(data.estimatedCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">วัตถุประสงค์</p>
              <p className="text-sm">{data.purpose || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">หมายเหตุ</p>
              <p className="text-sm">{data.notes || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {documentType === "po" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ชื่อผู้จำหน่าย</p>
              <p className="font-semibold">{data.supplierName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่</p>
              <p className="font-semibold">{formatDate(data.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดสินค้า</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">รายการ</th>
                  <th className="border p-2 text-center">จำนวน</th>
                  <th className="border p-2 text-right">ราคาต่อหน่วย</th>
                  <th className="border p-2 text-right">รวม</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{data.itemDescription || "-"}</td>
                  <td className="border p-2 text-center">{data.quantity || "-"}</td>
                  <td className="border p-2 text-right">{formatCurrency(data.unitPrice)}</td>
                  <td className="border p-2 text-right">{formatCurrency(data.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-right space-y-2">
            <div className="flex justify-end gap-4">
              <span className="font-semibold">รวมทั้งสิ้น:</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(data.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {documentType === "sr" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ผู้เบิก</p>
              <p className="font-semibold">{data.requestedBy || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่</p>
              <p className="font-semibold">{formatDate(data.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดอุปกรณ์</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">รายการ</th>
                  <th className="border p-2 text-center">จำนวน</th>
                  <th className="border p-2 text-left">หน่วย</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{data.itemDescription || "-"}</td>
                  <td className="border p-2 text-center">{data.quantity || "-"}</td>
                  <td className="border p-2">{data.unit || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">หมายเหตุ</p>
            <p className="text-sm">{data.notes || "-"}</p>
          </div>
        </div>
      )}

      {documentType === "jo" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ชื่อลูกค้า</p>
              <p className="font-semibold">{data.customerName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">เบอร์โทร</p>
              <p className="font-semibold">{data.customerPhone || "-"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดงาน</p>
            <p className="text-sm whitespace-pre-wrap">{data.workDescription || "-"}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">วันเริ่มงาน</p>
              <p className="font-semibold">{formatDate(data.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันสิ้นสุด</p>
              <p className="font-semibold">{formatDate(data.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">จำนวนคนงาน</p>
              <p className="font-semibold">{data.workersCount || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {documentType === "fsr" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ช่างเทคนิค</p>
              <p className="font-semibold">{data.technician || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่ทำงาน</p>
              <p className="font-semibold">{formatDate(data.workDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">เวลาเริ่มงาน</p>
              <p className="font-semibold">{data.startTime || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">เวลาสิ้นสุด</p>
              <p className="font-semibold">{data.endTime || "-"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดงาน</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">รายการ</th>
                  <th className="border p-2 text-right">ค่า</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">ความยาวท่อ (เมตร)</td>
                  <td className="border p-2 text-right">{data.pipeLength || "-"}</td>
                </tr>
                <tr>
                  <td className="border p-2">ปริมาณน้าเสีย (ลิตร)</td>
                  <td className="border p-2 text-right">{data.wasteQuantity || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">ปัญหาที่พบ</p>
            <p className="text-sm whitespace-pre-wrap">{data.issues || "-"}</p>
          </div>
        </div>
      )}

      {documentType === "dl" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ชื่อโครงการ</p>
              <p className="font-semibold">{data.projectName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่</p>
              <p className="font-semibold">{formatDate(data.workDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ผู้บันทึก</p>
              <p className="font-semibold">{data.recordedBy || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">สถานที่</p>
              <p className="font-semibold">{data.location || "-"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">กิจกรรมประจำวัน</p>
            <p className="text-sm whitespace-pre-wrap">{data.dailyActivities || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase">หมายเหตุ</p>
            <p className="text-sm whitespace-pre-wrap">{data.notes || "-"}</p>
          </div>
        </div>
      )}

      {documentType === "quotation" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ชื่อลูกค้า</p>
              <p className="font-semibold">{data.customerName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่</p>
              <p className="font-semibold">{formatDate(data.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดบริการ</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">บริการ</th>
                  <th className="border p-2 text-right">ราคา</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{data.serviceDescription || "-"}</td>
                  <td className="border p-2 text-right">{formatCurrency(data.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-right space-y-2">
            <div className="flex justify-end gap-4">
              <span className="font-semibold">รวมทั้งสิ้น:</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(data.totalAmount)}</span>
            </div>
            <p className="text-xs text-gray-500">วันหมดอายุ: {formatDate(data.validUntil)}</p>
          </div>
        </div>
      )}

      {documentType === "do" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ผู้รับมอบ</p>
              <p className="font-semibold">{data.recipientName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่</p>
              <p className="font-semibold">{formatDate(data.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดงาน</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">รายการ</th>
                  <th className="border p-2 text-right">ราคา</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{data.workDescription || "-"}</td>
                  <td className="border p-2 text-right">{formatCurrency(data.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-right space-y-2">
            <div className="flex justify-end gap-4">
              <span className="font-semibold">รวมทั้งสิ้น:</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(data.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {documentType === "invoice" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">ชื่อลูกค้า</p>
              <p className="font-semibold">{data.customerName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">วันที่</p>
              <p className="font-semibold">{formatDate(data.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">รายละเอียดค่าใช้งาน</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">รายการ</th>
                  <th className="border p-2 text-right">ราคา</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{data.description || "-"}</td>
                  <td className="border p-2 text-right">{formatCurrency(data.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>ค่าแรงงาน:</span>
              <span>{formatCurrency(data.laborCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>ค่าวัสดุ:</span>
              <span>{formatCurrency(data.materialCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>ภาษี ({data.taxRate}%):</span>
              <span>{formatCurrency(data.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>รวมทั้งสิ้น:</span>
              <span className="text-primary">{formatCurrency(data.totalAmount)}</span>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-xs text-gray-500 uppercase">สถานะการชำระเงิน</p>
            <p className="font-semibold">{data.paymentStatus || "-"}</p>
          </div>
        </div>
      )}

      {/* Footer with Signature */}
      <div className="border-t-4 border-primary mt-12 pt-8">
        <div className="grid grid-cols-3 gap-8 text-center text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-8">ผู้เตรียมเอกสาร</p>
            <p className="border-t border-gray-400 pt-2">_____________________</p>
            <p className="text-xs text-gray-500 mt-2">{formatDate(new Date())}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-8">ผู้อนุมัติ</p>
            <p className="border-t border-gray-400 pt-2">_____________________</p>
            <p className="text-xs text-gray-500 mt-2">วันที่</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-8">ผู้รับทราบ</p>
            <p className="border-t border-gray-400 pt-2">_____________________</p>
            <p className="text-xs text-gray-500 mt-2">วันที่</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-template {
            max-width: 100%;
            margin: 0;
            padding: 20mm;
            background: white;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
