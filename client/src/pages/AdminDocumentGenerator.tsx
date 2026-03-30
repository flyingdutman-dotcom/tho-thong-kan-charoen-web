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
    prNumber: "",
    poNumber: "",
    srNumber: "",
    joNumber: "",
    fsrNumber: "",
    dlNumber: "",
    quoteNumber: "",
    doNumber: "",
    invoiceNumber: "",
    requestedBy: "",
    supplierName: "",
    itemDescription: "",
    estimatedCost: "",
    purpose: "",
    notes: "",
    workDescription: "",
    status: "draft",
    approvedBy: "",
    quantity: "",
    workersCount: "",
    prId: "",
    joId: "",
    quoteId: "",
    doId: "",
    pipeLength: "",
    laborCost: "",
    materialCost: "",
    totalAmount: "",
    unitPrice: "",
    projectName: "",
    startDate: "",
    endDate: "",
    customerName: "",
    customerPhone: "",
    deliveryDate: "",
    supplierContact: "",
    technician: "",
    workDate: "",
    startTime: "",
    endTime: "",
    wasteQuantity: "",
    issues: "",
    logDate: "",
    equipmentUsed: "",
    workDone: "",
    obstacles: "",
    weatherCondition: "",
    safetyIncidents: "",
    supervisor: "",
    customerEmail: "",
    serviceType: "",
    workLocation: "",
    scopeOfWork: "",
    validUntil: "",
    workQuality: "",
    customerSignature: "",
    signedDate: "",
    customerTaxId: "",
    customerAddress: "",
    dueDate: "",
    taxRate: "",
    taxAmount: "",
    paymentStatus: "",
    paymentMethod: "",
    paidAmount: "",
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

      // Convert undefined/null values to empty strings
      const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = value === undefined || value === null ? "" : value;
        return acc;
      }, {} as Record<string, any>);

      let result;
      switch (selectedType) {
        case "pr":
          result = await prMutation.mutateAsync({
            prNumber: processedData.prNumber,
            requestedBy: processedData.requestedBy,
            itemDescription: processedData.itemDescription,
            estimatedCost: processedData.estimatedCost,
            purpose: processedData.purpose,
            status: processedData.status || "draft",
            approvedBy: processedData.approvedBy,
            notes: processedData.notes,
          });
          break;
        case "po":
          result = await poMutation.mutateAsync({
            poNumber: processedData.poNumber,
            prId: processedData.prId ? parseInt(processedData.prId) : undefined,
            supplierName: processedData.supplierName,
            supplierContact: processedData.supplierContact,
            itemDescription: processedData.itemDescription,
            quantity: processedData.quantity,
            unitPrice: processedData.unitPrice,
            totalAmount: processedData.totalAmount,
            deliveryDate: processedData.deliveryDate,
            status: processedData.status || "draft",
            notes: processedData.notes,
          });
          break;
        case "sr":
          result = await srMutation.mutateAsync({
            srNumber: processedData.srNumber,
            requestedBy: processedData.requestedBy,
            projectName: processedData.projectName,
            itemDescription: processedData.itemDescription,
            quantity: processedData.quantity,
            status: processedData.status || "draft",
            approvedBy: processedData.approvedBy,
            notes: processedData.notes,
          });
          break;
        case "jo":
          result = await joMutation.mutateAsync({
            joNumber: processedData.joNumber,
            customerName: processedData.customerName,
            customerPhone: processedData.customerPhone,
            serviceType: processedData.serviceType,
            workLocation: processedData.workLocation,
            problemDescription: processedData.workDescription,
            scheduledDate: processedData.startDate,
            scheduledTime: processedData.startTime,
            estimatedDuration: processedData.endDate,
            assignedTo: processedData.approvedBy,
            status: processedData.status || "draft",
            notes: processedData.notes,
          });
          break;
        case "fsr":
          result = await fsrMutation.mutateAsync({
            fsrNumber: processedData.fsrNumber,
            joId: processedData.joId ? parseInt(processedData.joId) : undefined,
            technician: processedData.technician,
            workDate: processedData.workDate,
            startTime: processedData.startTime,
            endTime: processedData.endTime,
            pipeLength: processedData.pipeLength,
            wasteQuantity: processedData.wasteQuantity,
            workCompleted: false,
            issues: processedData.issues,
            status: processedData.status || "draft",
            notes: processedData.notes,
          });
          break;
        case "dl":
          result = await dlMutation.mutateAsync({
            dlNumber: processedData.dlNumber,
            projectName: processedData.projectName,
            logDate: processedData.logDate,
            workersCount: processedData.workersCount,
            equipmentUsed: processedData.equipmentUsed,
            workDone: processedData.workDone,
            obstacles: processedData.obstacles,
            weatherCondition: processedData.weatherCondition,
            safetyIncidents: processedData.safetyIncidents,
            supervisor: processedData.supervisor,
            notes: processedData.notes,
          });
          break;
        case "quotation":
          result = await quotationMutation.mutateAsync({
            quoteNumber: processedData.quoteNumber,
            customerName: processedData.customerName,
            customerPhone: processedData.customerPhone,
            customerEmail: processedData.customerEmail,
            serviceType: processedData.serviceType,
            workLocation: processedData.workLocation,
            scopeOfWork: processedData.scopeOfWork,
            laborCost: processedData.laborCost,
            materialCost: processedData.materialCost,
            totalAmount: processedData.totalAmount,
            validUntil: processedData.validUntil,
            status: processedData.status || "draft",
            notes: processedData.notes,
          });
          break;
        case "do":
          result = await doMutation.mutateAsync({
            doNumber: processedData.doNumber,
            quoteId: processedData.quoteId ? parseInt(processedData.quoteId) : undefined,
            customerName: processedData.customerName,
            workDate: processedData.workDate,
            workDescription: processedData.workDescription,
            workQuality: processedData.workQuality,
            customerSignature: processedData.customerSignature,
            signedDate: processedData.signedDate,
            status: processedData.status || "draft",
            notes: processedData.notes,
          });
          break;
        case "invoice":
          result = await invoiceMutation.mutateAsync({
            invoiceNumber: processedData.invoiceNumber,
            doId: processedData.doId ? parseInt(processedData.doId) : undefined,
            customerName: processedData.customerName,
            customerTaxId: processedData.customerTaxId,
            customerAddress: processedData.customerAddress,
            invoiceDate: processedData.invoiceDate,
            dueDate: processedData.dueDate,
            laborCost: processedData.laborCost,
            materialCost: processedData.materialCost,
            taxRate: processedData.taxRate,
            taxAmount: processedData.taxAmount,
            totalAmount: processedData.totalAmount,
            paymentStatus: processedData.paymentStatus || "unpaid",
            paymentMethod: processedData.paymentMethod,
            paidAmount: processedData.paidAmount,
            notes: processedData.notes,
          });
          break;
      }

      setMessage({
        type: "success",
        text: `${DOCUMENT_TYPES.find((d) => d.id === selectedType)?.label} สร้าง สำเร็จ!`,
      });

      // Reset form
      setFormData((prev) => ({
        ...prev,
        documentType: selectedType,
        prNumber: "",
        poNumber: "",
        srNumber: "",
        joNumber: "",
        fsrNumber: "",
        dlNumber: "",
        quoteNumber: "",
        doNumber: "",
        invoiceNumber: "",
        requestedBy: "",
        supplierName: "",
        itemDescription: "",
        estimatedCost: "",
        purpose: "",
        notes: "",
        workDescription: "",
        status: "draft",
        approvedBy: "",
        quantity: "",
        workersCount: "",
        prId: "",
        joId: "",
        quoteId: "",
        doId: "",
        pipeLength: "",
        laborCost: "",
        materialCost: "",
        totalAmount: "",
        unitPrice: "",
        projectName: "",
        startDate: "",
        endDate: "",
        customerName: "",
        customerPhone: "",
        deliveryDate: "",
        supplierContact: "",
        technician: "",
        workDate: "",
        startTime: "",
        endTime: "",
        wasteQuantity: "",
        issues: "",
        logDate: "",
        equipmentUsed: "",
        workDone: "",
        obstacles: "",
        weatherCondition: "",
        safetyIncidents: "",
        supervisor: "",
        customerEmail: "",
        serviceType: "",
        workLocation: "",
        scopeOfWork: "",
        validUntil: "",
        workQuality: "",
        customerSignature: "",
        signedDate: "",
        customerTaxId: "",
        customerAddress: "",
        dueDate: "",
        taxRate: "",
        taxAmount: "",
        paymentStatus: "",
        paymentMethod: "",
        paidAmount: "",
      }));
    } catch (error: any) {
      setMessage({
        type: "error",
        text: `ไม่สามารถสร้างเอกสาร: ${error.message || JSON.stringify(error)}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">สร้างเอกสาร</h1>
        <p className="text-gray-600">สร้างเอกสารต่างๆ สำหรับการจัดการธุรกิจ</p>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <div className="flex items-start gap-3">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Document Type Selector */}
      <div className="grid grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((docType) => (
          <Card
            key={docType.id}
            className={`cursor-pointer transition-all ${
              selectedType === docType.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
            }`}
            onClick={() => {
              setSelectedType(docType.id as DocumentType);
              setMessage(null);
            }}
          >
            <CardContent className="p-4">
              <FileText className="w-6 h-6 mb-2 text-blue-600" />
              <h3 className="font-bold text-sm">{docType.label}</h3>
              <p className="text-xs text-gray-600">{docType.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{DOCUMENT_TYPES.find((d) => d.id === selectedType)?.name}</CardTitle>
          <CardDescription>กรอกข้อมูลด้านล่างเพื่อสร้างเอกสาร</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                    <Input placeholder="ชื่อผู้ขอซื้อ" value={formData.requestedBy || ""} onChange={(e) => handleInputChange("requestedBy", e.target.value)} />
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
                    <Label>วัตถุประสงค์</Label>
                    <Input placeholder="วัตถุประสงค์ของการซื้อ" value={formData.purpose || ""} onChange={(e) => handleInputChange("purpose", e.target.value)} />
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
                    <Label>เลขที่ PR (ไม่บังคับ)</Label>
                    <Input type="number" placeholder="0" value={formData.prId || ""} onChange={(e) => handleInputChange("prId", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อผู้ขาย</Label>
                    <Input placeholder="ชื่อผู้ขาย" value={formData.supplierName || ""} onChange={(e) => handleInputChange("supplierName", e.target.value)} />
                  </div>
                  <div>
                    <Label>ติดต่อผู้ขาย</Label>
                    <Input placeholder="เบอร์โทร/อีเมล" value={formData.supplierContact || ""} onChange={(e) => handleInputChange("supplierContact", e.target.value)} />
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
                    <Label>หมายเหตุ</Label>
                    <Input placeholder="หมายเหตุ" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
                  </div>
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
                    <Label>เลขที่ PR (ไม่บังคับ)</Label>
                    <Input type="number" placeholder="0" value={formData.prId || ""} onChange={(e) => handleInputChange("prId", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>รายละเอียดอุปกรณ์</Label>
                  <Textarea placeholder="อธิบายอุปกรณ์ที่ต้องการเบิก" value={formData.itemDescription || ""} onChange={(e) => handleInputChange("itemDescription", e.target.value)} />
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
                <div>
                  <Label>หมายเหตุ</Label>
                  <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
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
                    <Label>ประเภทบริการ</Label>
                    <Input placeholder="ประเภทบริการ" value={formData.serviceType || ""} onChange={(e) => handleInputChange("serviceType", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อลูกค้า</Label>
                    <Input placeholder="ชื่อลูกค้า" value={formData.customerName || ""} onChange={(e) => handleInputChange("customerName", e.target.value)} />
                  </div>
                  <div>
                    <Label>เบอร์โทรลูกค้า</Label>
                    <Input placeholder="เบอร์โทรลูกค้า" value={formData.customerPhone || ""} onChange={(e) => handleInputChange("customerPhone", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>รายละเอียดงาน</Label>
                  <Textarea placeholder="อธิบายรายละเอียดงาน" value={formData.workDescription || ""} onChange={(e) => handleInputChange("workDescription", e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>วันเริ่มงาน</Label>
                    <Input type="date" value={formData.startDate || ""} onChange={(e) => handleInputChange("startDate", e.target.value)} />
                  </div>
                  <div>
                    <Label>วันสิ้นสุด</Label>
                    <Input type="date" value={formData.endDate || ""} onChange={(e) => handleInputChange("endDate", e.target.value)} />
                  </div>
                  <div>
                    <Label>จำนวนคนงาน</Label>
                    <Input type="number" placeholder="0" value={formData.workersCount || ""} onChange={(e) => handleInputChange("workersCount", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>หมายเหตุ</Label>
                  <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
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
                    <Label>เลขที่ JO (ไม่บังคับ)</Label>
                    <Input type="number" placeholder="0" value={formData.joId || ""} onChange={(e) => handleInputChange("joId", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อช่างเทคนิค</Label>
                    <Input placeholder="ชื่อช่างเทคนิค" value={formData.technician || ""} onChange={(e) => handleInputChange("technician", e.target.value)} />
                  </div>
                  <div>
                    <Label>วันที่ทำงาน</Label>
                    <Input type="date" value={formData.workDate || ""} onChange={(e) => handleInputChange("workDate", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>เวลาเริ่มงาน</Label>
                    <Input type="time" value={formData.startTime || ""} onChange={(e) => handleInputChange("startTime", e.target.value)} />
                  </div>
                  <div>
                    <Label>เวลาสิ้นสุด</Label>
                    <Input type="time" value={formData.endTime || ""} onChange={(e) => handleInputChange("endTime", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ความยาวท่อ (เมตร)</Label>
                    <Input type="number" placeholder="0" value={formData.pipeLength || ""} onChange={(e) => handleInputChange("pipeLength", e.target.value)} />
                  </div>
                  <div>
                    <Label>ปริมาณน้าเสีย (ลิตร)</Label>
                    <Input type="number" placeholder="0" value={formData.wasteQuantity || ""} onChange={(e) => handleInputChange("wasteQuantity", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>ปัญหาที่พบ</Label>
                  <Textarea placeholder="อธิบายปัญหาที่พบระหว่างการทำงาน" value={formData.issues || ""} onChange={(e) => handleInputChange("issues", e.target.value)} />
                </div>
                <div>
                  <Label>หมายเหตุ</Label>
                  <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
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
                    <Label>ชื่อโครงการ</Label>
                    <Input placeholder="ชื่อโครงการ" value={formData.projectName || ""} onChange={(e) => handleInputChange("projectName", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>วันที่บันทึก</Label>
                    <Input type="date" value={formData.logDate || ""} onChange={(e) => handleInputChange("logDate", e.target.value)} />
                  </div>
                  <div>
                    <Label>จำนวนคนงาน</Label>
                    <Input type="number" placeholder="0" value={formData.workersCount || ""} onChange={(e) => handleInputChange("workersCount", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>อุปกรณ์ที่ใช้</Label>
                    <Input placeholder="อุปกรณ์ที่ใช้" value={formData.equipmentUsed || ""} onChange={(e) => handleInputChange("equipmentUsed", e.target.value)} />
                  </div>
                  <div>
                    <Label>สภาพอากาศ</Label>
                    <Input placeholder="สภาพอากาศ" value={formData.weatherCondition || ""} onChange={(e) => handleInputChange("weatherCondition", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>งานที่ทำ</Label>
                  <Textarea placeholder="อธิบายงานที่ทำในวันนี้" value={formData.workDone || ""} onChange={(e) => handleInputChange("workDone", e.target.value)} />
                </div>
                <div>
                  <Label>อุปสรรค</Label>
                  <Textarea placeholder="อุปสรรคที่พบ" value={formData.obstacles || ""} onChange={(e) => handleInputChange("obstacles", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>เหตุการณ์ด้านความปลอดภัย</Label>
                    <Input placeholder="เหตุการณ์ด้านความปลอดภัย" value={formData.safetyIncidents || ""} onChange={(e) => handleInputChange("safetyIncidents", e.target.value)} />
                  </div>
                  <div>
                    <Label>หัวหน้างาน</Label>
                    <Input placeholder="ชื่อหัวหน้างาน" value={formData.supervisor || ""} onChange={(e) => handleInputChange("supervisor", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>หมายเหตุ</Label>
                  <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>เบอร์โทรลูกค้า</Label>
                    <Input placeholder="เบอร์โทรลูกค้า" value={formData.customerPhone || ""} onChange={(e) => handleInputChange("customerPhone", e.target.value)} />
                  </div>
                  <div>
                    <Label>อีเมลลูกค้า (ไม่บังคับ)</Label>
                    <Input type="email" placeholder="อีเมลลูกค้า" value={formData.customerEmail || ""} onChange={(e) => handleInputChange("customerEmail", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ประเภทบริการ</Label>
                    <Input placeholder="ประเภทบริการ" value={formData.serviceType || ""} onChange={(e) => handleInputChange("serviceType", e.target.value)} />
                  </div>
                  <div>
                    <Label>สถานที่ทำงาน</Label>
                    <Input placeholder="สถานที่ทำงาน" value={formData.workLocation || ""} onChange={(e) => handleInputChange("workLocation", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>ขอบเขตงาน</Label>
                  <Textarea placeholder="อธิบายขอบเขตของงาน" value={formData.scopeOfWork || ""} onChange={(e) => handleInputChange("scopeOfWork", e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>ค่าแรง</Label>
                    <Input type="number" placeholder="0.00" value={formData.laborCost || ""} onChange={(e) => handleInputChange("laborCost", e.target.value)} />
                  </div>
                  <div>
                    <Label>ค่าวัสดุ (ไม่บังคับ)</Label>
                    <Input type="number" placeholder="0.00" value={formData.materialCost || ""} onChange={(e) => handleInputChange("materialCost", e.target.value)} />
                  </div>
                  <div>
                    <Label>จำนวนเงินรวม</Label>
                    <Input type="number" placeholder="0.00" value={formData.totalAmount || ""} onChange={(e) => handleInputChange("totalAmount", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>วันหมดอายุ (ไม่บังคับ)</Label>
                    <Input type="date" value={formData.validUntil || ""} onChange={(e) => handleInputChange("validUntil", e.target.value)} />
                  </div>
                  <div>
                    <Label>หมายเหตุ (ไม่บังคับ)</Label>
                    <Input placeholder="หมายเหตุ" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
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
                    <Label>เลขที่ใบเสนอราคา (ไม่บังคับ)</Label>
                    <Input type="number" placeholder="0" value={formData.quoteId || ""} onChange={(e) => handleInputChange("quoteId", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อลูกค้า</Label>
                    <Input placeholder="ชื่อลูกค้า" value={formData.customerName || ""} onChange={(e) => handleInputChange("customerName", e.target.value)} />
                  </div>
                  <div>
                    <Label>วันที่ทำงาน</Label>
                    <Input type="date" value={formData.workDate || ""} onChange={(e) => handleInputChange("workDate", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>รายละเอียดงาน</Label>
                  <Textarea placeholder="อธิบายรายละเอียดงาน" value={formData.workDescription || ""} onChange={(e) => handleInputChange("workDescription", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>คุณภาพงาน (ไม่บังคับ)</Label>
                    <Input placeholder="คุณภาพงาน" value={formData.workQuality || ""} onChange={(e) => handleInputChange("workQuality", e.target.value)} />
                  </div>
                  <div>
                    <Label>วันที่ลงนาม (ไม่บังคับ)</Label>
                    <Input type="date" value={formData.signedDate || ""} onChange={(e) => handleInputChange("signedDate", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>หมายเหตุ (ไม่บังคับ)</Label>
                  <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
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
                    <Label>เลขที่ DO (ไม่บังคับ)</Label>
                    <Input type="number" placeholder="0" value={formData.doId || ""} onChange={(e) => handleInputChange("doId", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อลูกค้า</Label>
                    <Input placeholder="ชื่อลูกค้า" value={formData.customerName || ""} onChange={(e) => handleInputChange("customerName", e.target.value)} />
                  </div>
                  <div>
                    <Label>เลขประจำตัวผู้เสียภาษี (ไม่บังคับ)</Label>
                    <Input placeholder="เลขประจำตัวผู้เสียภาษี" value={formData.customerTaxId || ""} onChange={(e) => handleInputChange("customerTaxId", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>ที่อยู่ลูกค้า (ไม่บังคับ)</Label>
                  <Textarea placeholder="ที่อยู่ลูกค้า" value={formData.customerAddress || ""} onChange={(e) => handleInputChange("customerAddress", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>วันที่ออกใบแจ้งหนี้</Label>
                    <Input type="date" value={formData.invoiceDate || ""} onChange={(e) => handleInputChange("invoiceDate", e.target.value)} />
                  </div>
                  <div>
                    <Label>วันครบกำหนด (ไม่บังคับ)</Label>
                    <Input type="date" value={formData.dueDate || ""} onChange={(e) => handleInputChange("dueDate", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>ค่าแรง</Label>
                    <Input type="number" placeholder="0.00" value={formData.laborCost || ""} onChange={(e) => handleInputChange("laborCost", e.target.value)} />
                  </div>
                  <div>
                    <Label>ค่าวัสดุ (ไม่บังคับ)</Label>
                    <Input type="number" placeholder="0.00" value={formData.materialCost || ""} onChange={(e) => handleInputChange("materialCost", e.target.value)} />
                  </div>
                  <div>
                    <Label>อัตราภาษี (ไม่บังคับ)</Label>
                    <Input placeholder="0" value={formData.taxRate || ""} onChange={(e) => handleInputChange("taxRate", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>จำนวนภาษี</Label>
                    <Input type="number" placeholder="0.00" value={formData.taxAmount || ""} onChange={(e) => handleInputChange("taxAmount", e.target.value)} />
                  </div>
                  <div>
                    <Label>จำนวนเงินรวม</Label>
                    <Input type="number" placeholder="0.00" value={formData.totalAmount || ""} onChange={(e) => handleInputChange("totalAmount", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>หมายเหตุ (ไม่บังคับ)</Label>
                  <Textarea placeholder="หมายเหตุเพิ่มเติม" value={formData.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} />
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
          </div>
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
