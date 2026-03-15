import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
