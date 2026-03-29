import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Printer } from "lucide-react";

type DocumentType = "pr" | "po" | "sr" | "jo" | "fsr" | "dl" | "quotation" | "do" | "invoice";

interface DocumentFormData {
  documentType: DocumentType;
  [key: string]: any;
}

export default function AdminDocumentGenerator() {
  const [activeTab, setActiveTab] = useState<DocumentType>("pr");
  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: "pr",
  });
  const [isGenerating, setIsGenerating] = useState(false);

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
  };

  const handleGenerateDocument = async () => {
    try {
      setIsGenerating(true);
      
      // Convert number fields from strings to actual numbers
      const processedData = { ...formData };
      const numberFields = ['quantity', 'workersCount', 'prId', 'joId', 'quoteId', 'doId', 'pipeLength', 'laborCost', 'materialCost', 'totalAmount', 'estimatedCost'];
      numberFields.forEach(field => {
        if (processedData[field] && typeof processedData[field] === 'string') {
          processedData[field] = parseFloat(processedData[field]) || 0;
        }
      });
      
      // Call appropriate tRPC mutation based on document type
      switch (activeTab) {
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
      setFormData({ documentType: activeTab });
      alert(`${activeTab.toUpperCase()} created successfully!`);
    } catch (error) {
      console.error("Error creating document:", error);
      alert(`Failed to create document: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Generator</h1>
          <p className="text-muted-foreground mt-2">Create and manage business documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintDocument}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="pr" className="text-xs">PR</TabsTrigger>
          <TabsTrigger value="po" className="text-xs">PO</TabsTrigger>
          <TabsTrigger value="sr" className="text-xs">SR</TabsTrigger>
          <TabsTrigger value="jo" className="text-xs">JO</TabsTrigger>
          <TabsTrigger value="fsr" className="text-xs">FSR</TabsTrigger>
          <TabsTrigger value="dl" className="text-xs">DL</TabsTrigger>
          <TabsTrigger value="quotation" className="text-xs">QT</TabsTrigger>
          <TabsTrigger value="do" className="text-xs">DO</TabsTrigger>
          <TabsTrigger value="invoice" className="text-xs">INV</TabsTrigger>
        </TabsList>

        {/* Purchase Requisition */}
        <TabsContent value="pr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requisition (PR)</CardTitle>
              <CardDescription>ใบขอซื้อ - Request for equipment or materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PR Number</Label>
                  <Input placeholder="PR-2026-001" onChange={(e) => handleInputChange("prNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Requested By</Label>
                  <Input placeholder="Department/Person" onChange={(e) => handleInputChange("requestedBy", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Item Description</Label>
                <Textarea placeholder="Describe items to purchase" onChange={(e) => handleInputChange("itemDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estimated Cost</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("estimatedCost", e.target.value)} />
                </div>
                <div>
                  <Label>Purpose/Project</Label>
                  <Input placeholder="Project name" onChange={(e) => handleInputChange("purpose", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes" onChange={(e) => handleInputChange("notes", e.target.value)} />
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate PR"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Order */}
        <TabsContent value="po" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order (PO)</CardTitle>
              <CardDescription>ใบสั่งซื้อ - Order sent to supplier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PO Number</Label>
                  <Input placeholder="PO-2026-001" onChange={(e) => handleInputChange("poNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Supplier Name</Label>
                  <Input placeholder="Supplier name" onChange={(e) => handleInputChange("supplierName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Item Description</Label>
                <Textarea placeholder="Describe items" onChange={(e) => handleInputChange("itemDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="0" onChange={(e) => handleInputChange("quantity", e.target.value)} />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("unitPrice", e.target.value)} />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("totalAmount", e.target.value)} />
                </div>
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate PO"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Requisition */}
        <TabsContent value="sr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Requisition (SR)</CardTitle>
              <CardDescription>ใบเบิกอุปกรณ์ - Equipment checkout form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SR Number</Label>
                  <Input placeholder="SR-2026-001" onChange={(e) => handleInputChange("srNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Requested By</Label>
                  <Input placeholder="Team/Person" onChange={(e) => handleInputChange("requestedBy", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Project Name</Label>
                <Input placeholder="Project name" onChange={(e) => handleInputChange("projectName", e.target.value)} />
              </div>
              <div>
                <Label>Item Description</Label>
                <Textarea placeholder="Describe items" onChange={(e) => handleInputChange("itemDescription", e.target.value)} />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" placeholder="0" onChange={(e) => handleInputChange("quantity", e.target.value)} />
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate SR"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Order */}
        <TabsContent value="jo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Order (JO)</CardTitle>
              <CardDescription>ใบสั่งงาน - Work assignment form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>JO Number</Label>
                  <Input placeholder="JO-2026-001" onChange={(e) => handleInputChange("joNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Input placeholder="Customer name" onChange={(e) => handleInputChange("customerName", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Phone</Label>
                  <Input placeholder="Phone number" onChange={(e) => handleInputChange("customerPhone", e.target.value)} />
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Input placeholder="e.g., ลอกท่อระบายน้ำ" onChange={(e) => handleInputChange("serviceType", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Work Location</Label>
                <Textarea placeholder="Address/Location" onChange={(e) => handleInputChange("workLocation", e.target.value)} />
              </div>
              <div>
                <Label>Problem Description</Label>
                <Textarea placeholder="Describe the problem" onChange={(e) => handleInputChange("problemDescription", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scheduled Date</Label>
                  <Input type="date" onChange={(e) => handleInputChange("scheduledDate", e.target.value)} />
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <Input placeholder="Technician name" onChange={(e) => handleInputChange("assignedTo", e.target.value)} />
                </div>
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate JO"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Field Service Report */}
        <TabsContent value="fsr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Service Report (FSR)</CardTitle>
              <CardDescription>ใบรายงานหน้างาน - Work completion report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>FSR Number</Label>
                  <Input placeholder="FSR-2026-001" onChange={(e) => handleInputChange("fsrNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Technician</Label>
                  <Input placeholder="Technician name" onChange={(e) => handleInputChange("technician", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Work Date</Label>
                <Input type="date" onChange={(e) => handleInputChange("workDate", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pipe Length (meters)</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("pipeLength", e.target.value)} />
                </div>
                <div>
                  <Label>Waste Quantity</Label>
                  <Input placeholder="e.g., 5 bags" onChange={(e) => handleInputChange("wasteQuantity", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Issues/Notes</Label>
                <Textarea placeholder="Any issues encountered" onChange={(e) => handleInputChange("issues", e.target.value)} />
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate FSR"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Log */}
        <TabsContent value="dl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Log (DL)</CardTitle>
              <CardDescription>บันทึกประจำวัน - Daily project progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>DL Number</Label>
                  <Input placeholder="DL-2026-001" onChange={(e) => handleInputChange("dlNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Project Name</Label>
                  <Input placeholder="Project name" onChange={(e) => handleInputChange("projectName", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Log Date</Label>
                  <Input type="date" onChange={(e) => handleInputChange("logDate", e.target.value)} />
                </div>
                <div>
                  <Label>Workers Count</Label>
                  <Input type="number" placeholder="0" onChange={(e) => handleInputChange("workersCount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Work Done</Label>
                <Textarea placeholder="Describe work completed" onChange={(e) => handleInputChange("workDone", e.target.value)} />
              </div>
              <div>
                <Label>Obstacles</Label>
                <Textarea placeholder="Any obstacles encountered" onChange={(e) => handleInputChange("obstacles", e.target.value)} />
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate DL"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotation */}
        <TabsContent value="quotation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quotation (QT)</CardTitle>
              <CardDescription>ใบเสนอราคา - Price proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quote Number</Label>
                  <Input placeholder="QT-2026-001" onChange={(e) => handleInputChange("quoteNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Input placeholder="Customer name" onChange={(e) => handleInputChange("customerName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Service Type</Label>
                <Input placeholder="e.g., ลอกท่อระบายน้ำ" onChange={(e) => handleInputChange("serviceType", e.target.value)} />
              </div>
              <div>
                <Label>Scope of Work</Label>
                <Textarea placeholder="Detailed description of work" onChange={(e) => handleInputChange("scopeOfWork", e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Labor Cost</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("laborCost", e.target.value)} />
                </div>
                <div>
                  <Label>Material Cost</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("materialCost", e.target.value)} />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("totalAmount", e.target.value)} />
                </div>
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Quotation"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Order */}
        <TabsContent value="do" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Order (DO)</CardTitle>
              <CardDescription>ใบรับมอบงาน - Work completion acceptance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>DO Number</Label>
                  <Input placeholder="DO-2026-001" onChange={(e) => handleInputChange("doNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Input placeholder="Customer name" onChange={(e) => handleInputChange("customerName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Work Date</Label>
                <Input type="date" onChange={(e) => handleInputChange("workDate", e.target.value)} />
              </div>
              <div>
                <Label>Work Description</Label>
                <Textarea placeholder="Describe work completed" onChange={(e) => handleInputChange("workDescription", e.target.value)} />
              </div>
              <div>
                <Label>Work Quality</Label>
                <Select onValueChange={(value) => handleInputChange("workQuality", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate DO"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice */}
        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice (INV)</CardTitle>
              <CardDescription>ใบแจ้งหนี้ - Billing document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input placeholder="INV-2026-001" onChange={(e) => handleInputChange("invoiceNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Input placeholder="Customer name" onChange={(e) => handleInputChange("customerName", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Date</Label>
                  <Input type="date" onChange={(e) => handleInputChange("invoiceDate", e.target.value)} />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" onChange={(e) => handleInputChange("dueDate", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Labor Cost</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("laborCost", e.target.value)} />
                </div>
                <div>
                  <Label>Material Cost</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("materialCost", e.target.value)} />
                </div>
                <div>
                  <Label>Tax Amount</Label>
                  <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("taxAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Total Amount</Label>
                <Input type="number" placeholder="0.00" onChange={(e) => handleInputChange("totalAmount", e.target.value)} />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select onValueChange={(value) => handleInputChange("paymentStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateDocument} disabled={isGenerating} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Invoice"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
