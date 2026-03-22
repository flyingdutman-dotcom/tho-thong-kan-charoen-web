import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminProvider } from "./contexts/AdminContext";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import PortfolioDetails from "./pages/PortfolioDetails";
import Reviews from "./pages/Reviews";
import ServiceArea from "./pages/ServiceArea";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInquiries from "./pages/AdminInquiries";
import AdminPortfolio from "./pages/AdminPortfolio";
import AdminReviews from "./pages/AdminReviews";
import AdminBookings from "./pages/AdminBookings";
import AdminDocuments from "./pages/AdminDocuments";
import AdminStats from "./pages/AdminStats";
import AdminDocumentGenerator from "./pages/AdminDocumentGenerator";
import AdminLogin from "./pages/AdminLogin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/portfolio/:id" component={PortfolioDetails} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/service-area" component={ServiceArea} />
      <Route path="/booking" component={Booking} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/inquiries" component={AdminInquiries} />
      <Route path="/admin/portfolio" component={AdminPortfolio} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/documents" component={AdminDocuments} />
      <Route path="/admin/document-generator" component={AdminDocumentGenerator} />
      <Route path="/admin/stats" component={AdminStats} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AdminProvider>
    </ErrorBoundary>
  );
}

export default App;
