import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Download, Printer, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DocumentType = "pr" | "po" | "sr" | "jo" | "fsr" | "dl" | "quotation" | "do" | "invoice";

interface DocumentFormData {
  documentType: DocumentType;
  [key: string]: any;
}

const DOCUMENT_TYPES = [
  { id: "pr", label: "PR", name: "Purchase Requisition (ใบขอซื้อ)", category: "Procurement & Cost" },
  { id: "po", label: "PO", name: "Purchase Order (ใบสั่งซื้อ)", category: "Procurement & Cost" },
  { id: "sr", label: "SR", name: "Stock Requisition (ใบเบิกอุปกรณ์)", category: "Procurement & Cost" },
  { id: "jo", label: "JO", name: "Job Order (ใบสั่งงาน)", category: "Operations & Field Work" },
  { id: "fsr", label: "FSR", name: "Field Service Report (ใบรายงานหน้างาน)", category: "Operations & Field Work" },
  { id: "dl", label: "DL", name: "Daily Log (บันทึกประจำวัน)", category: "Operations & Field Work" },
  { id: "quotation", label: "QT", name: "Quotation (ใบเสนอราคา)", category: "Finance & Closing" },
  { id: "do", label: "DO", name: "Delivery Order (ใบรับมอบงาน)", category: "Finance & Closing" },
  { id: "invoice", label: "INV", name: "Invoice (ใบแจ้งหนี้)", category: "Finance & Closing" },
];

function AdminDocumentGeneratorContent() {
  const [selectedType, setSelectedType] = useState<DocumentType>("pr");
  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: "pr",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // tRPC mutations for each document type
  const prMutation = trpc.purchaseRequisitions.create.useMutation();
  const poMutation = trpc.purchaseOrders.create.useMutation();
  const srMutation = trpc.stockRequisitions.create.useMutation();
  const joMutation = trpc.jobOrders.create.useMutation();
  const fsrMutation = trpc.fieldServiceReports.create.useMutation();
  const dlMutation = trpc.dailyLogs.create.useMutation();
  const quotationMutation = trpc.quotations.create.useMutation();
  const doMutation = trpc.deliveryOrders.create.useMutation();
  const invoiceMutation = trpc.invoices.create.useMutation();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setMessage(null);
  };

  const handleGenerateDocument = async () => {
    try {
      setIsGenerating(true);
      setMessage(null);
      
      // Convert number fields from strings to actual numbers
      const processedData = { ...formData };
      // Only convert these fields to numbers
      const numberFields = ['quantity', 'workersCount', 'prId', 'joId', 'quoteId', 'doId', 'pipeLength'];
      numberFields.forEach(field => {
        if (processedData[field] && typeof processedData[field] === 'string') {
          processedData[field] = parseFloat(processedData[field]) || 0;
        }
      });
      // Keep string fields as strings (prices, costs, amounts)
      const stringFields = ['totalAmount', 'unitPrice', 'laborCost', 'materialCost', 'estimatedCost'];
      stringFields.forEach(field => {
        if (processedData[field] && typeof processedData[field] !== 'string') {
          processedData[field] = String(processedData[field]);
        }
      });
      
      // Call appropriate tRPC mutation based on document type
      switch (selectedType) {
        case "pr":
          await prMutation.mutateAsync(processedData as any);
          break;
        case "po":
          await poMutation.mutateAsync(processedData as any);
          break;
        case "sr":
          await srMutation.mutateAsync(processedData as any);
          break;
        case "jo":
          await joMutation.mutateAsync(processedData as any);
          break;
        case "fsr":
          await fsrMutation.mutateAsync(processedData as any);
          break;
        case "dl":
          await dlMutation.mutateAsync(processedData as any);
          break;
        case "quotation":
          await quotationMutation.mutateAsync(processedData as any);
          break;
        case "do":
          await doMutation.mutateAsync(processedData as any);
          break;
        case "invoice":
          await invoiceMutation.mutateAsync(processedData as any);
          break;
      }
      
      // Reset form after successful creation
      setFormData({ documentType: selectedType });
      setMessage({ type: "success", text: `${selectedType.toUpperCase()} สร้างสำเร็จ!` });
    } catch (error) {
      console.error("Error creating document:", error);
      const errorMsg = error instanceof Error ? error.message : "ไม่ทราบข้อผิดพลาด";
      setMessage({ type: "error", text: `ไม่สามารถสร้างเอกสาร: ${errorMsg}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const [, navigate] = useLocation();

  const handlePrintDocument = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      const docType = DOCUMENT_TYPES.find(d => d.id === selectedType);
      printWindow.document.write(`
        <html>
          <head>
            <title>${docType?.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .detail { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <h1>${docType?.name}</h1>
            ${Object.entries(formData)
              .filter(([key]) => key !== 'documentType')
              .map(([key, value]) => `<div class="detail"><span class="label">${key}:</span> ${value}</div>`)
              .join("")}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleViewDocuments = () => {
    navigate("/admin/documents-list");
  };

  const selectedDocType = DOCUMENT_TYPES.find(d => d.id === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">สร้างเอกสาร</h1>
          <p className="text-muted-foreground mt-2">สร้างและจัดการเอกสารทางธุรกิจ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleViewDocuments}>
            <FileText className="w-4 h-4 mr-2" />
            ดูประวัติ
          </Button>
        </div>
      </div>

      {/* Document Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {DOCUMENT_TYPES.map((docType) => (
          <button
            key={docType.id}
            onClick={() => {
              setSelectedType(docType.id as DocumentType);
              setFormData({ documentType: docType.id as DocumentType });
              setMessage(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedType === docType.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex items-start gap-3">
              <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                selectedType === docType.id ? "text-blue-600" : "text-gray-400"
              }`} />
              <div>
                <div className="font-semibold text-sm">{docType.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{docType.name}</div>
                <div className="text-xs text-gray-500 mt-1">{docType.category}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800" : "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedDocType?.name}</CardTitle>
          <CardDescription>กรอกข้อมูลเพื่อสร้างเอกสาร</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PR Form */}
          {selectedType === "pr" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ PR</Label>
                  <Input placeholder="PR-2026-001" value={formData.prNumber || ""} onChange={(e) => handleInputChange("prNumber", e.target.value)} />
                </div>
                <div>
                  <Label>ผู้ขอซื้อ</Label>
                  <Input placeholder="แผนก/ชื่อบุคคล" value={formData.requestedBy || ""} onChange={(e) => handleInputChange("requestedBy", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>รายละเอียดสินค้า</Label>
                <Textarea placeholder="อธิบายสินค้าที่ต้องการซื้อ" value={formData.itemDescription || ""} onChange={(e) => handleInputChange("itemDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ราคาประมาณการ</Label>
                  <Input type="number" placeholder="0.00" value={formData.estimatedCost || ""} onChange={(e) => handleInputChange("estimatedCost", e.target.value)} />
                </div>
                <div>
                  <Label>โครงการ/วัตถุประสงค์</Label>
                  <Input placeholder="ชื่อโครงการ" value={formData.purpose || ""} onChange={(e) => handleInputChange("purpose", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>หมายเหตุ</Label>
                <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
              </div>
            </div>
          )}

          {/* PO Form */}
          {selectedType === "po" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ PO</Label>
                  <Input placeholder="PO-2026-001" value={formData.poNumber || ""} onChange={(e) => handleInputChange("poNumber", e.target.value)} />
                </div>
                <div>
                  <Label>ชื่อผู้จัดจำหน่าย</Label>
                  <Input placeholder="ชื่อผู้จัดจำหน่าย" value={formData.supplierName || ""} onChange={(e) => handleInputChange("supplierName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>รายละเอียดสินค้า</Label>
                <Textarea placeholder="อธิบายสินค้า" value={formData.itemDescription || ""} onChange={(e) => handleInputChange("itemDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>จำนวน</Label>
                  <Input type="number" placeholder="0" value={formData.quantity || ""} onChange={(e) => handleInputChange("quantity", e.target.value)} />
                </div>
                <div>
                  <Label>ราคาต่อหน่วย</Label>
                  <Input type="number" placeholder="0.00" value={formData.unitPrice || ""} onChange={(e) => handleInputChange("unitPrice", e.target.value)} />
                </div>
                <div>
                  <Label>จำนวนเงินรวม</Label>
                  <Input type="number" placeholder="0.00" value={formData.totalAmount || ""} onChange={(e) => handleInputChange("totalAmount", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>วันที่ส่งมอบ</Label>
                  <Input type="date" value={formData.deliveryDate || ""} onChange={(e) => handleInputChange("deliveryDate", e.target.value)} />
                </div>
                <div>
                  <Label>ติดต่อผู้จัดจำหน่าย</Label>
                  <Input placeholder="เบอร์โทร/อีเมล" value={formData.supplierContact || ""} onChange={(e) => handleInputChange("supplierContact", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>หมายเหตุ</Label>
                <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
              </div>
            </div>
          )}

          {/* SR Form */}
          {selectedType === "sr" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ SR</Label>
                  <Input placeholder="SR-2026-001" value={formData.srNumber || ""} onChange={(e) => handleInputChange("srNumber", e.target.value)} />
                </div>
                <div>
                  <Label>ผู้ขอเบิก</Label>
                  <Input placeholder="ทีม/บุคคล" value={formData.requestedBy || ""} onChange={(e) => handleInputChange("requestedBy", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>ชื่อโครงการ</Label>
                <Input placeholder="ชื่อโครงการ" value={formData.projectName || ""} onChange={(e) => handleInputChange("projectName", e.target.value)} />
              </div>
              <div>
                <Label>รายละเอียดอุปกรณ์</Label>
                <Textarea placeholder="อธิบายอุปกรณ์ที่ต้องการเบิก" value={formData.itemDescription || ""} onChange={(e) => handleInputChange("itemDescription", e.target.value)} />
              </div>
              <div>
                <Label>จำนวน</Label>
                <Input type="number" placeholder="0" value={formData.quantity || ""} onChange={(e) => handleInputChange("quantity", e.target.value)} />
              </div>
            </div>
          )}

          {/* JO Form */}
          {selectedType === "jo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ JO</Label>
                  <Input placeholder="JO-2026-001" value={formData.joNumber || ""} onChange={(e) => handleInputChange("joNumber", e.target.value)} />
                </div>
                <div>
                  <Label>ชื่อโครงการ</Label>
                  <Input placeholder="ชื่อโครงการ" value={formData.projectName || ""} onChange={(e) => handleInputChange("projectName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>รายละเอียดงาน</Label>
                <Textarea placeholder="อธิบายงานที่ต้องทำ" value={formData.jobDescription || ""} onChange={(e) => handleInputChange("jobDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>วันที่เริ่มงาน</Label>
                  <Input type="date" value={formData.startDate || ""} onChange={(e) => handleInputChange("startDate", e.target.value)} />
                </div>
                <div>
                  <Label>วันที่สิ้นสุด</Label>
                  <Input type="date" value={formData.endDate || ""} onChange={(e) => handleInputChange("endDate", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>จำนวนคนงาน</Label>
                <Input type="number" placeholder="0" value={formData.workersCount || ""} onChange={(e) => handleInputChange("workersCount", e.target.value)} />
              </div>
            </div>
          )}

          {/* FSR Form */}
          {selectedType === "fsr" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ FSR</Label>
                  <Input placeholder="FSR-2026-001" value={formData.fsrNumber || ""} onChange={(e) => handleInputChange("fsrNumber", e.target.value)} />
                </div>
                <div>
                  <Label>เลขที่ JO</Label>
                  <Input type="number" placeholder="0" value={formData.joId || ""} onChange={(e) => handleInputChange("joId", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>รายงานการทำงาน</Label>
                <Textarea placeholder="รายงานสรุปการทำงานในหน้างาน" value={formData.reportContent || ""} onChange={(e) => handleInputChange("reportContent", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>วันที่รายงาน</Label>
                  <Input type="date" value={formData.reportDate || ""} onChange={(e) => handleInputChange("reportDate", e.target.value)} />
                </div>
                <div>
                  <Label>ผู้รายงาน</Label>
                  <Input placeholder="ชื่อผู้รายงาน" value={formData.reportedBy || ""} onChange={(e) => handleInputChange("reportedBy", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* DL Form */}
          {selectedType === "dl" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ DL</Label>
                  <Input placeholder="DL-2026-001" value={formData.dlNumber || ""} onChange={(e) => handleInputChange("dlNumber", e.target.value)} />
                </div>
                <div>
                  <Label>วันที่</Label>
                  <Input type="date" value={formData.logDate || ""} onChange={(e) => handleInputChange("logDate", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>บันทึกประจำวัน</Label>
                <Textarea placeholder="บันทึกกิจกรรมและเหตุการณ์ในแต่ละวัน" value={formData.logContent || ""} onChange={(e) => handleInputChange("logContent", e.target.value)} />
              </div>
              <div>
                <Label>ผู้บันทึก</Label>
                <Input placeholder="ชื่อผู้บันทึก" value={formData.loggedBy || ""} onChange={(e) => handleInputChange("loggedBy", e.target.value)} />
              </div>
            </div>
          )}

          {/* Quotation Form */}
          {selectedType === "quotation" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ใบเสนอราคา</Label>
                  <Input placeholder="QT-2026-001" value={formData.quoteNumber || ""} onChange={(e) => handleInputChange("quoteNumber", e.target.value)} />
                </div>
                <div>
                  <Label>ชื่อลูกค้า</Label>
                  <Input placeholder="ชื่อลูกค้า" value={formData.customerName || ""} onChange={(e) => handleInputChange("customerName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>รายละเอียดบริการ</Label>
                <Textarea placeholder="อธิบายบริการที่เสนอ" value={formData.serviceDescription || ""} onChange={(e) => handleInputChange("serviceDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ราคาประมาณการ</Label>
                  <Input type="number" placeholder="0.00" value={formData.estimatedCost || ""} onChange={(e) => handleInputChange("estimatedCost", e.target.value)} />
                </div>
                <div>
                  <Label>วันหมดอายุ</Label>
                  <Input type="date" value={formData.expiryDate || ""} onChange={(e) => handleInputChange("expiryDate", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* DO Form */}
          {selectedType === "do" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ DO</Label>
                  <Input placeholder="DO-2026-001" value={formData.doNumber || ""} onChange={(e) => handleInputChange("doNumber", e.target.value)} />
                </div>
                <div>
                  <Label>เลขที่ใบเสนอราคา</Label>
                  <Input type="number" placeholder="0" value={formData.quoteId || ""} onChange={(e) => handleInputChange("quoteId", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>รายละเอียดการส่งมอบ</Label>
                <Textarea placeholder="อธิบายรายละเอียดการส่งมอบงาน" value={formData.deliveryDetails || ""} onChange={(e) => handleInputChange("deliveryDetails", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>วันที่ส่งมอบ</Label>
                  <Input type="date" value={formData.deliveryDate || ""} onChange={(e) => handleInputChange("deliveryDate", e.target.value)} />
                </div>
                <div>
                  <Label>ผู้รับมอบ</Label>
                  <Input placeholder="ชื่อผู้รับมอบ" value={formData.receivedBy || ""} onChange={(e) => handleInputChange("receivedBy", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Invoice Form */}
          {selectedType === "invoice" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลขที่ใบแจ้งหนี้</Label>
                  <Input placeholder="INV-2026-001" value={formData.invoiceNumber || ""} onChange={(e) => handleInputChange("invoiceNumber", e.target.value)} />
                </div>
                <div>
                  <Label>เลขที่ DO</Label>
                  <Input type="number" placeholder="0" value={formData.doId || ""} onChange={(e) => handleInputChange("doId", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>ชื่อลูกค้า</Label>
                <Input placeholder="ชื่อลูกค้า" value={formData.customerName || ""} onChange={(e) => handleInputChange("customerName", e.target.value)} />
              </div>
              <div>
                <Label>รายละเอียดบริการ</Label>
                <Textarea placeholder="อธิบายบริการ" value={formData.serviceDescription || ""} onChange={(e) => handleInputChange("serviceDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>ค่าแรง</Label>
                  <Input type="number" placeholder="0.00" value={formData.laborCost || ""} onChange={(e) => handleInputChange("laborCost", e.target.value)} />
                </div>
                <div>
                  <Label>ค่าวัสดุ</Label>
                  <Input type="number" placeholder="0.00" value={formData.materialCost || ""} onChange={(e) => handleInputChange("materialCost", e.target.value)} />
                </div>
                <div>
                  <Label>จำนวนเงินรวม</Label>
                  <Input type="number" placeholder="0.00" value={formData.totalAmount || ""} onChange={(e) => handleInputChange("totalAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>วันที่ออกใบแจ้งหนี้</Label>
                <Input type="date" value={formData.invoiceDate || ""} onChange={(e) => handleInputChange("invoiceDate", e.target.value)} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleGenerateDocument} 
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังสร้างเอกสาร...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                สร้างเอกสาร
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      </div>
    );
  }

export default function AdminDocumentGenerator() {
  return (
    <AdminLayout>
      <AdminDocumentGeneratorContent />
    </AdminLayout>
  );
}
