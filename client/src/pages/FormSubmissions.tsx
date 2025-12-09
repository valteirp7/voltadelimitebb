import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Search, Download, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditSubmissionModal } from "@/components/EditSubmissionModal";

export default function FormSubmissions() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Redirecionar se não autenticado ou não é admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  const listSubmissions = trpc.admin.listSubmissions.useQuery(
    { search, limit: 10, offset: page * 10 },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  const exportQuery = trpc.admin.exportSubmissions.useQuery();
  const deleteSubmissionMutation = trpc.admin.deleteSubmission.useMutation({
    onSuccess: () => {
      toast.success("Submissão deletada com sucesso!");
      listSubmissions.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar submissão");
    },
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (exportQuery.data) {
        const element = document.createElement('a');
        const file = new Blob([exportQuery.data.csv], { type: 'text/csv' });
        element.href = URL.createObjectURL(file);
        element.download = exportQuery.data.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        toast.success(`${exportQuery.data.count} submissões exportadas!`);
      }
    } catch (error) {
      toast.error('Erro ao exportar submissões');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const submissions = listSubmissions.data?.submissions || [];
  const total = listSubmissions.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Submissões do Formulário BB</h1>
            <p className="text-slate-400">Total: {total} submissões</p>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar CSV
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por email, CPF ou telefone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Loading State */}
        {listSubmissions.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-cyan-400" />
          </div>
        )}

        {/* Submissions List */}
        {!listSubmissions.isLoading && submissions.length > 0 && (
          <>
            <div className="space-y-4 mb-8">
              {submissions.map((submission) => (
                <Card key={submission.id} className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{submission.nomePai}</CardTitle>
                        <CardDescription className="text-slate-400">
                          ID: {submission.id} • {submission.email}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.ocrValidationStatus === 'validated' 
                            ? 'bg-green-900 text-green-200'
                            : submission.ocrValidationStatus === 'mismatch'
                            ? 'bg-yellow-900 text-yellow-200'
                            : submission.ocrValidationStatus === 'error'
                            ? 'bg-red-900 text-red-200'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {submission.ocrValidationStatus === 'validated' && '✓ Validado'}
                          {submission.ocrValidationStatus === 'mismatch' && '⚠ Divergência'}
                          {submission.ocrValidationStatus === 'error' && '✗ Erro'}
                          {submission.ocrValidationStatus === 'pending' && '⏳ Pendente'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">CPF</p>
                        <p className="text-white font-medium">{submission.cpf}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Telefone</p>
                        <p className="text-white font-medium">{submission.telefone}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Agência</p>
                        <p className="text-white font-medium">{submission.agencia}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Conta</p>
                        <p className="text-white font-medium">{submission.conta}</p>
                      </div>
                      {submission.limitReturned && (
                        <div>
                          <p className="text-slate-400">Limite</p>
                          <p className="text-cyan-400 font-medium">R$ {submission.limitReturned.toLocaleString('pt-BR')}</p>
                        </div>
                      )}
                      {submission.commissionRate && (
                        <div>
                          <p className="text-slate-400">Comissão</p>
                          <p className="text-orange-400 font-medium">{submission.commissionRate}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-400">Data</p>
                        <p className="text-white font-medium">
                          {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Fatura</p>
                        <p className="text-white font-medium">
                          {submission.faturaUrl ? '✓ Enviada' : '✗ Não enviada'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingSubmission(submission);
                          setIsEditModalOpen(true);
                        }}
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja deletar esta submissão?')) {
                            deleteSubmissionMutation.mutate({ id: submission.id });
                          }
                        }}
                        size="sm"
                        variant="destructive"
                        disabled={deleteSubmissionMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {deleteSubmissionMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Deletar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!listSubmissions.isLoading && submissions.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-400 mb-4">Nenhuma submissão encontrada</p>
              <Button
                onClick={() => setSearch('')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Limpar filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => setLocation('/dashboard')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Ver Dashboard
          </Button>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Voltar ao Formulário
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditSubmissionModal
        isOpen={isEditModalOpen}
        submission={editingSubmission}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => listSubmissions.refetch()}
      />
    </div>
  );
}
