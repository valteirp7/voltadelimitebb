import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import FormularioBB from "./pages/FormularioBB";
import Confirmacao from "./pages/Confirmacao";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import FormSubmissions from "./pages/FormSubmissions";
import EditableTable from "./pages/EditableTable";
import CardManager from "./pages/CardManager";
import CardRegistration from "./pages/CardRegistration";
import CardStatusChat from "./pages/CardStatusChat";

function Router() {
  return (
    <Switch>
      {/* Formulário público - página principal */}
      <Route path="/" component={FormularioBB} />
      
      {/* Rota personalizada para o formulário */}
      <Route path="/trampobb01" component={FormularioBB} />
      
      {/* Página de confirmação após envio */}
      <Route path="/confirmacao" component={Confirmacao} />
      
      {/* Login administrativo */}
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Painel administrativo protegido */}
      <Route path="/admin" component={AdminPanel} />
      
      {/* Dashboard de ganhos */}
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Submissões do formulário */}
      <Route path="/submissoes" component={FormSubmissions} />
      
      {/* Tabela editável */}
      <Route path="/tabela" component={EditableTable} />
      
      {/* Gerenciador de cartões */}
      <Route path="/cartoes" component={CardManager} />
      
      {/* Cadastro de cartões */}
      <Route path="/cartoes-registro" component={CardRegistration} />
      
      {/* Chat de status de cartão */}
      <Route path="/status" component={CardStatusChat} />
      
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
