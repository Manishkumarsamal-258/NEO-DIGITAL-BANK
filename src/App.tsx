import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataRefreshProvider } from "./contexts/DataRefreshContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import Beneficiaries from "./pages/Beneficiaries";
import Analytics from "./pages/Analytics";
import TellerCenter from "./pages/TellerCenter";
import AdminConsole from "./pages/AdminConsole";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ServicesDemo from "./pages/ServicesDemo";
import KycUpload from "./pages/KycUpload";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import MyAccounts from "./pages/MyAccounts";
import Statements from "./pages/Statements";
import Loans from "./pages/Loans";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <DataRefreshProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/kyc" element={<KycUpload />} />
          <Route path="/teller" element={<TellerCenter />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/accounts" element={<MyAccounts />} />
          <Route path="/statements" element={<Statements />} />
          <Route path="/loans" element={<Loans />} />
              <Route path="/services" element={<ServicesDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </DataRefreshProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
