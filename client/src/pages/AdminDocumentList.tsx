import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, Printer, Download, Loader2 } from "lucide-react";
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

function DocumentListContent() {
  const [selectedType, setSelectedType] = useState<DocumentType>("pr");
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

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

  // tRPC delete mutations
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

  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (doc.prNumber?.toLowerCase().includes(searchLower)) ||
      (doc.poNumber?.toLowerCase().includes(searchLower)) ||
      (doc.requestedBy?.toLowerCase().includes(searchLower)) ||
      (doc.supplierName?.toLowerCase().includes(searchLower)) ||
      (doc.itemDescription?.toLowerCase().includes(searchLower))
    );
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
    // Generate a simple HTML for printing
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

  const selectedDocType = DOCUMENT_TYPES.find((d) => d.id === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ประวัติเอกสาร</h1>
        <p className="text-muted-foreground mt-2">ดูและจัดการเอกสารที่สร้างไว้</p>
      </div>

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
          <TabsContent key={docType.id} value={docType.id}>
            <Card>
              <CardHeader>
                <CardTitle>{docType.name}</CardTitle>
                <CardDescription>รายการเอกสารทั้งหมด ({filteredDocuments.length})</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <Input
                  placeholder="ค้นหาเอกสาร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

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
                              {doc.prNumber || doc.poNumber || doc.id}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {doc.requestedBy || doc.supplierName || doc.itemDescription}
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
                                      {selectedDoc?.prNumber || selectedDoc?.poNumber}
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
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function AdminDocumentList() {
  return (
    <DashboardLayout>
      <DocumentListContent />
    </DashboardLayout>
  );
}
