import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, Calendar, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B"];

export default function AdminDocumentReports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch all document data
  const prQuery = trpc.purchaseRequisitions.list.useQuery();
  const poQuery = trpc.purchaseOrders.list.useQuery();
  const srQuery = trpc.stockRequisitions.list.useQuery();
  const joQuery = trpc.jobOrders.list.useQuery();
  const fsrQuery = trpc.fieldServiceReports.list.useQuery();
  const dlQuery = trpc.dailyLogs.list.useQuery();
  const quotationQuery = trpc.quotations.list.useQuery();
  const doQuery = trpc.deliveryOrders.list.useQuery();
  const invoiceQuery = trpc.invoices.list.useQuery();

  // Process data for charts
  const reportData = useMemo(() => {
    const allData = {
      pr: prQuery.data || [],
      po: poQuery.data || [],
      sr: srQuery.data || [],
      jo: joQuery.data || [],
      fsr: fsrQuery.data || [],
      dl: dlQuery.data || [],
      quotation: quotationQuery.data || [],
      do: doQuery.data || [],
      invoice: invoiceQuery.data || [],
    };

    // Filter by month and year
    const filterByMonth = (docs: any[]) => {
      return docs.filter((doc) => {
        const docDate = new Date(doc.createdAt);
        return docDate.getMonth() + 1 === selectedMonth && docDate.getFullYear() === selectedYear;
      });
    };

    // Count by type
    const typeCount = {
      PR: filterByMonth(allData.pr).length,
      PO: filterByMonth(allData.po).length,
      SR: filterByMonth(allData.sr).length,
      JO: filterByMonth(allData.jo).length,
      FSR: filterByMonth(allData.fsr).length,
      DL: filterByMonth(allData.dl).length,
      QT: filterByMonth(allData.quotation).length,
      DO: filterByMonth(allData.do).length,
      INV: filterByMonth(allData.invoice).length,
    };

    // Count by status
    const statusCount = {
      draft: 0,
      approved: 0,
      pending: 0,
      completed: 0,
      other: 0,
    };

    Object.values(allData).forEach((docs) => {
      filterByMonth(docs).forEach((doc) => {
        const status = doc.status || "draft";
        if (status === "draft") statusCount.draft++;
        else if (status === "approved" || status === "confirmed" || status === "completed") statusCount.approved++;
        else if (status === "pending") statusCount.pending++;
        else if (status === "completed") statusCount.completed++;
        else statusCount.other++;
      });
    });

    // Trend data (last 12 months)
    const trendData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      let count = 0;
      Object.values(allData).forEach((docs) => {
        docs.forEach((doc) => {
          const docDate = new Date(doc.createdAt);
          if (docDate.getMonth() + 1 === month && docDate.getFullYear() === year) {
            count++;
          }
        });
      });

      trendData.push({
        month: date.toLocaleDateString("th-TH", { month: "short", year: "2-digit" }),
        count,
      });
    }

    return {
      typeCount,
      statusCount,
      trendData,
      total: Object.values(typeCount).reduce((a, b) => a + b, 0),
    };
  }, [
    selectedMonth,
    selectedYear,
    prQuery.data,
    poQuery.data,
    srQuery.data,
    joQuery.data,
    fsrQuery.data,
    dlQuery.data,
    quotationQuery.data,
    doQuery.data,
    invoiceQuery.data,
  ]);

  const typeChartData = Object.entries(reportData.typeCount).map(([name, value]) => ({
    name,
    value,
  }));

  const statusChartData = Object.entries(reportData.statusCount)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

  const handleExportReport = () => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    });

    let csv = `สรุปรายงานเอกสารประจำเดือน ${monthName}\n\n`;
    csv += "ประเภทเอกสาร,จำนวน\n";

    Object.entries(reportData.typeCount).forEach(([type, count]) => {
      csv += `${type},${count}\n`;
    });

    csv += `\nรวมทั้งสิ้น,${reportData.total}\n\n`;
    csv += "สถานะ,จำนวน\n";

    Object.entries(reportData.statusCount).forEach(([status, count]) => {
      csv += `${status},${count}\n`;
    });

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = `document-report-${selectedYear}-${String(selectedMonth).padStart(2, "0")}.csv`;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายงานเอกสาร</h1>
          <p className="text-muted-foreground mt-2">สรุปสถิติและการวิเคราะห์เอกสารประจำเดือน</p>
        </div>

        {/* Month/Year Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              เลือกช่วงเวลา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-2">เดือน</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2026, month - 1).toLocaleDateString("th-TH", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ปี</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleExportReport} className="gap-2">
                <Download className="w-4 h-4" />
                ส่งออก CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">รวมทั้งสิ้น</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportData.total}</div>
              <p className="text-xs text-muted-foreground mt-1">เอกสารทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ร่าง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{reportData.statusCount.draft}</div>
              <p className="text-xs text-muted-foreground mt-1">รอการอนุมัติ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{reportData.statusCount.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">เสร็จสิ้น</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{reportData.statusCount.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">กำลังดำเนินการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>การกระจายตามประเภท</CardTitle>
              <CardDescription>จำนวนเอกสารแต่ละประเภท</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>การกระจายตามสถานะ</CardTitle>
              <CardDescription>สถานะของเอกสาร</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              แนวโน้มเอกสาร 12 เดือนที่ผ่านมา
            </CardTitle>
            <CardDescription>จำนวนเอกสารต่อเดือน</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="จำนวนเอกสาร" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดตามประเภท</CardTitle>
            <CardDescription>จำนวนเอกสารแต่ละประเภทในเดือนที่เลือก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">ประเภทเอกสาร</th>
                    <th className="text-right py-3 px-4 font-semibold">จำนวน</th>
                    <th className="text-right py-3 px-4 font-semibold">ร้อยละ</th>
                  </tr>
                </thead>
                <tbody>
                  {typeChartData.map((item) => (
                    <tr key={item.name} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="text-right py-3 px-4 font-medium">{item.value}</td>
                      <td className="text-right py-3 px-4">
                        {reportData.total > 0 ? ((item.value / reportData.total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b bg-muted/50 font-bold">
                    <td className="py-3 px-4">รวมทั้งสิ้น</td>
                    <td className="text-right py-3 px-4">{reportData.total}</td>
                    <td className="text-right py-3 px-4">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
