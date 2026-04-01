import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Trash2, Printer, Download, Loader2, FileJson, FileSpreadsheet, Bell, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

type DocumentType = "pr" | "po" | "sr" | "jo" | "fsr" | "dl" | "quotation" | "do" | "invoice";

const DOCUMENT_TYPES: Array<{ id: DocumentType; label: string; name: string }> = [
  { id: "pr", label: "PR", name: "Purchase Requisition (ใบขอซื้อ)" },
  { id: "po", label: "PO", name: "Purchase Order (ใบสั่งซื้อ)" },
  { id: "sr", label: "SR", name: "Stock Requisition (ใบเบิกอุปกรณ์)" },
  { id: "jo", label: "JO", name: "Job Order (ใบสั่งงาน)" },
  { id: "fsr", label: "FSR", name: "Field Service Report (ใบรายงานหน้างาน)" },
  { id: "dl", label: "DL", name: "Daily Log (บันทึกประจำวัน)" },
  { id: "quotation", label: "QT", name: "Quotation (ใบเสนอราคา)" },
  { id: "do", label: "DO", name: "Delivery Order (ใบรับมอบงาน)" },
  { id: "invoice", label: "INV", name: "Invoice (ใบแจ้งหนี้)" },
];

interface DocumentFormData {
  documentType: DocumentType;
  [key: string]: any;
}

function AdminDocumentManagementContent() {
  const [activeTab, setActiveTab] = useState<"create" | "list">("list");
  const [selectedType, setSelectedType] = useState<DocumentType>("pr");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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

  // tRPC queries for each document type
  const prQuery = trpc.purchaseRequisitions.list.useQuery();
  const poQuery = trpc.purchaseOrders.list.useQuery();
  const srQuery = trpc.stockRequisitions.list.useQuery();
  const joQuery = trpc.jobOrders.list.useQuery();
  const fsrQuery = trpc.fieldServiceReports.list.useQuery();
  const dlQuery = trpc.dailyLogs.list.useQuery();
  const quotationQuery = trpc.quotations.list.useQuery();
  const doQuery = trpc.deliveryOrders.list.useQuery();
  const invoiceQuery = trpc.invoices.list.useQuery();

  // tRPC mutations for creating documents
  const prMutation = trpc.purchaseRequisitions.create.useMutation();
  const poMutation = trpc.purchaseOrders.create.useMutation();
  const srMutation = trpc.stockRequisitions.create.useMutation();
  const joMutation = trpc.jobOrders.create.useMutation();
  const fsrMutation = trpc.fieldServiceReports.create.useMutation();
  const dlMutation = trpc.dailyLogs.create.useMutation();
  const quotationMutation = trpc.quotations.create.useMutation();
  const doMutation = trpc.deliveryOrders.create.useMutation();
  const invoiceMutation = trpc.invoices.create.useMutation();

  // tRPC mutations for deleting documents
  const prDelete = trpc.purchaseRequisitions.delete.useMutation();
  const poDelete = trpc.purchaseOrders.delete.useMutation();
  const srDelete = trpc.stockRequisitions.delete.useMutation();
  const joDelete = trpc.jobOrders.delete.useMutation();
  const fsrDelete = trpc.fieldServiceReports.delete.useMutation();
  const dlDelete = trpc.dailyLogs.delete.useMutation();
  const quotationDelete = trpc.quotations.delete.useMutation();
  const doDelete = trpc.deliveryOrders.delete.useMutation();
  const invoiceDelete = trpc.invoices.delete.useMutation();

  useEffect(() => {
    const queryMap: Record<DocumentType, any> = {
      pr: prQuery,
      po: poQuery,
      sr: srQuery,
      jo: joQuery,
      fsr: fsrQuery,
      dl: dlQuery,
      quotation: quotationQuery,
      do: doQuery,
      invoice: invoiceQuery,
    };

    const query = queryMap[selectedType];
    if (query.data) {
      setDocuments(query.data || []);
    }
    setIsLoading(query.isLoading);
  }, [selectedType, prQuery, poQuery, srQuery, joQuery, fsrQuery, dlQuery, quotationQuery, doQuery, invoiceQuery]);

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
        text: `${DOCUMENT_TYPES.find((d) => d.id === selectedType)?.label} สร้างสำเร็จ!`,
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
      }));

      // Refresh list
      setActiveTab("list");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (doc.prNumber?.toLowerCase().includes(searchLower)) ||
      (doc.poNumber?.toLowerCase().includes(searchLower)) ||
      (doc.srNumber?.toLowerCase().includes(searchLower)) ||
      (doc.joNumber?.toLowerCase().includes(searchLower)) ||
      (doc.fsrNumber?.toLowerCase().includes(searchLower)) ||
      (doc.dlNumber?.toLowerCase().includes(searchLower)) ||
      (doc.quoteNumber?.toLowerCase().includes(searchLower)) ||
      (doc.doNumber?.toLowerCase().includes(searchLower)) ||
      (doc.invoiceNumber?.toLowerCase().includes(searchLower)) ||
      (doc.requestedBy?.toLowerCase().includes(searchLower)) ||
      (doc.supplierName?.toLowerCase().includes(searchLower)) ||
      (doc.customerName?.toLowerCase().includes(searchLower)) ||
      (doc.itemDescription?.toLowerCase().includes(searchLower));

    const matchesStatus = filterStatus === "all" || (doc.status || "draft") === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือว่าต้องการลบเอกสารนี้?")) return;

    try {
      const deleteMap: Record<DocumentType, any> = {
        pr: prDelete,
        po: poDelete,
        sr: srDelete,
        jo: joDelete,
        fsr: fsrDelete,
        dl: dlDelete,
        quotation: quotationDelete,
        do: doDelete,
        invoice: invoiceDelete,
      };

      await deleteMap[selectedType].mutateAsync({ id });
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handlePrint = (doc: any) => {
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${doc.prNumber || doc.poNumber || "Document"}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .detail { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <h1>${DOCUMENT_TYPES.find(t => t.id === selectedType)?.name}</h1>
            ${Object.entries(doc)
              .map(([key, value]) => `<div class="detail"><span class="label">${key}:</span> ${value}</div>`)
              .join("")}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value || "";
        }).join(",")
      ),
    ].join("\n");
    return csv;
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const csv = convertToCSV(filteredDocuments);
      const link = document.createElement("a");
      link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      link.download = `${selectedType}-documents-${new Date().getTime()}.csv`;
      link.click();
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const csv = convertToCSV(filteredDocuments);
      const link = document.createElement("a");
      link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      link.download = `${selectedType}-documents-${new Date().getTime()}.xlsx`;
      link.click();
    } catch (error) {
      console.error("Error exporting Excel:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const selectedDocType = DOCUMENT_TYPES.find((d) => d.id === selectedType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">จัดการเอกสาร</h1>
        <p className="text-muted-foreground mt-2">สร้าง ดู และจัดการเอกสารทั้งหมด</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "list")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">รายการเอกสาร</TabsTrigger>
          <TabsTrigger value="create">สร้างเอกสารใหม่</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายการเอกสาร</CardTitle>
              <CardDescription>ดูและจัดการเอกสารที่สร้างไว้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Type Tabs */}
              <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as DocumentType)}>
                <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 w-full">
                  {DOCUMENT_TYPES.map((docType) => (
                    <TabsTrigger key={docType.id} value={docType.id} className="text-xs">
                      {docType.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {DOCUMENT_TYPES.map((docType) => (
                  <TabsContent key={docType.id} value={docType.id} className="space-y-4">
                    {/* Search and Filter */}
                    <div className="space-y-4">
                      <Input
                        placeholder="ค้นหาเอกสาร..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant={filterStatus === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterStatus("all")}
                        >
                          ทั้งหมด
                        </Button>
                        <Button
                          variant={filterStatus === "draft" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterStatus("draft")}
                        >
                          ร่าง
                        </Button>
                        <Button
                          variant={filterStatus === "approved" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterStatus("approved")}
                        >
                          อนุมัติแล้ว
                        </Button>
                        <div className="flex-1"></div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportCSV}
                          disabled={exportLoading || filteredDocuments.length === 0}
                        >
                          <FileJson className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportExcel}
                          disabled={exportLoading || filteredDocuments.length === 0}
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Excel
                        </Button>
                      </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredDocuments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        ไม่มีเอกสาร
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>เลขที่</TableHead>
                              <TableHead>รายละเอียด</TableHead>
                              <TableHead>สถานะ</TableHead>
                              <TableHead className="text-right">การจัดการ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDocuments.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell className="font-medium">
                                  {doc.prNumber || doc.poNumber || doc.srNumber || doc.joNumber || doc.fsrNumber || doc.dlNumber || doc.quoteNumber || doc.doNumber || doc.invoiceNumber || doc.id}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {doc.requestedBy || doc.supplierName || doc.customerName || doc.itemDescription}
                                </TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    {doc.status || "draft"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedDoc(doc)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>รายละเอียดเอกสาร</DialogTitle>
                                        <DialogDescription>
                                          {selectedDoc?.prNumber || selectedDoc?.poNumber || selectedDoc?.srNumber || selectedDoc?.joNumber || selectedDoc?.fsrNumber || selectedDoc?.dlNumber || selectedDoc?.quoteNumber || selectedDoc?.doNumber || selectedDoc?.invoiceNumber}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {selectedDoc &&
                                          Object.entries(selectedDoc).map(([key, value]) => (
                                            <div key={key} className="grid grid-cols-2 gap-2">
                                              <span className="font-semibold text-sm">{key}:</span>
                                              <span className="text-sm">{String(value)}</span>
                                            </div>
                                          ))}
                                      </div>
                                      <div className="flex gap-2 mt-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handlePrint(selectedDoc)}
                                        >
                                          <Printer className="w-4 h-4 mr-2" />
                                          พิมพ์
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(doc.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>สร้างเอกสารใหม่</CardTitle>
              <CardDescription>เลือกประเภทเอกสารและกรอกข้อมูล</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <Alert className={message.type === "success" ? "bg-green-50" : "bg-red-50"}>
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Document Type Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">เลือกประเภทเอกสาร</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {DOCUMENT_TYPES.map((docType) => (
                    <Button
                      key={docType.id}
                      variant={selectedType === docType.id ? "default" : "outline"}
                      onClick={() => {
                        setSelectedType(docType.id);
                        setMessage(null);
                      }}
                      className="h-auto flex flex-col items-center justify-center py-3"
                    >
                      <span className="font-bold text-lg">{docType.label}</span>
                      <span className="text-xs mt-1">{docType.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedType === "pr" && (
                    <>
                      <div>
                        <Label>PR Number</Label>
                        <Input
                          value={formData.prNumber}
                          onChange={(e) => handleInputChange("prNumber", e.target.value)}
                          placeholder="PR-2026-001"
                        />
                      </div>
                      <div>
                        <Label>Requested By</Label>
                        <Input
                          value={formData.requestedBy}
                          onChange={(e) => handleInputChange("requestedBy", e.target.value)}
                          placeholder="ชื่อผู้ขอ"
                        />
                      </div>
                      <div>
                        <Label>Item Description</Label>
                        <Textarea
                          value={formData.itemDescription}
                          onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                          placeholder="รายละเอียดสินค้า"
                        />
                      </div>
                      <div>
                        <Label>Estimated Cost</Label>
                        <Input
                          type="number"
                          value={formData.estimatedCost}
                          onChange={(e) => handleInputChange("estimatedCost", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Purpose</Label>
                        <Input
                          value={formData.purpose}
                          onChange={(e) => handleInputChange("purpose", e.target.value)}
                          placeholder="วัตถุประสงค์"
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleInputChange("status", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="draft">ร่าง</option>
                          <option value="approved">อนุมัติแล้ว</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder="หมายเหตุ"
                        />
                      </div>
                    </>
                  )}

                  {/* Add more document type forms here */}
                  {selectedType !== "pr" && (
                    <div className="md:col-span-2 text-center py-8 text-muted-foreground">
                      <p>แบบฟอร์มสำหรับประเภท {DOCUMENT_TYPES.find(d => d.id === selectedType)?.label} กำลังจะเพิ่มเติม</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างเอกสาร
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDocumentManagement() {
  return (
    <AdminLayout>
      <AdminDocumentManagementContent />
    </AdminLayout>
  );
}
