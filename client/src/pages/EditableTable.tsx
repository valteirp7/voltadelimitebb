import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Save, Trash2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditableRow {
  id: number;
  email: string;
  cpf: string;
  telefone: string;
  nomePai: string;
  nomeMae: string;
  dataNascimento: string;
  agencia: string;
  conta: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  status: string;
  submittedAt: string;
  isSaving: boolean;
}

export default function EditableTable() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<EditableRow[]>([]);

  // Permitir acesso à tabela mesmo sem autenticação
  // useEffect(() => {
  //   if (!isAuthenticated || user?.role !== 'admin') {
  //     setLocation('/');
  //   }
  // }, [isAuthenticated, user, setLocation]);

  const listSubmissions = trpc.admin.listSubmissions.useQuery(
    { search, limit: 50, offset: page * 50 },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  const updateMutation = trpc.admin.updateSubmission.useMutation({
    onSuccess: () => {
      toast.success("Dados atualizados!");
      listSubmissions.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar");
    },
  });

  const deleteSubmissionMutation = trpc.admin.deleteSubmission.useMutation({
    onSuccess: () => {
      toast.success("Submissão deletada!");
      listSubmissions.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar");
    },
  });

  // Sincronizar dados da query com estado local
  useEffect(() => {
    if (listSubmissions.data?.submissions) {
      setRows(
        listSubmissions.data.submissions.map((sub: any) => ({
          id: sub.id,
          email: sub.email || "",
          cpf: sub.cpf || "",
          telefone: sub.telefone || "",
          nomePai: sub.nomePai || "",
          nomeMae: sub.nomeMae || "",
          dataNascimento: sub.dataNascimento || "",
          agencia: sub.agencia || "",
          conta: sub.conta || "",
          rua: sub.rua || "",
          numero: sub.numero || "",
          complemento: sub.complemento || "",
          bairro: sub.bairro || "",
          cidade: sub.cidade || "",
          estado: sub.estado || "",
          cep: sub.cep || "",
          status: sub.status || "Pendente",
          submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('pt-BR') : "",
          isSaving: false,
        }))
      );
    }
  }, [listSubmissions.data]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleCellChange = (id: number, field: string, value: string) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = async (row: EditableRow) => {
    setRows(rows.map(r => r.id === row.id ? { ...r, isSaving: true } : r));
    
    updateMutation.mutate({
      id: row.id,
      email: row.email,
      cpf: row.cpf,
      telefone: row.telefone,
      nomePai: row.nomePai,
      nomeMae: row.nomeMae,
      dataNascimento: row.dataNascimento,
      agencia: row.agencia,
      conta: row.conta,
      rua: row.rua,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cidade: row.cidade,
      estado: row.estado,
      cep: row.cep,
    });

    setRows(rows.map(r => r.id === row.id ? { ...r, isSaving: false } : r));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      deleteSubmissionMutation.mutate({ id });
    }
  };

  const total = listSubmissions.data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Tabela Editável Completa</h1>
            <p className="text-slate-400">Total: {total} submissões - Edite qualquer campo e clique em Salvar</p>
          </div>
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

        {/* Table */}
        {!listSubmissions.isLoading && rows.length > 0 && (
          <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 border-b border-slate-700 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left text-white font-semibold">ID</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Email</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">CPF</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Telefone</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Nome Pai</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Nome Mãe</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Data Nasc.</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Agência</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Conta</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Rua</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Nº</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Compl.</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Bairro</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Cidade</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Estado</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">CEP</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Status</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Data</th>
                  <th className="px-2 py-2 text-left text-white font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                    <td className="px-2 py-2 text-slate-300 whitespace-nowrap">{row.id}</td>
                    <td className="px-2 py-2"><Input type="email" value={row.email} onChange={(e) => handleCellChange(row.id, 'email', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.cpf} onChange={(e) => handleCellChange(row.id, 'cpf', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="tel" value={row.telefone} onChange={(e) => handleCellChange(row.id, 'telefone', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.nomePai} onChange={(e) => handleCellChange(row.id, 'nomePai', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.nomeMae} onChange={(e) => handleCellChange(row.id, 'nomeMae', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.dataNascimento} onChange={(e) => handleCellChange(row.id, 'dataNascimento', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.agencia} onChange={(e) => handleCellChange(row.id, 'agencia', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.conta} onChange={(e) => handleCellChange(row.id, 'conta', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.rua} onChange={(e) => handleCellChange(row.id, 'rua', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.numero} onChange={(e) => handleCellChange(row.id, 'numero', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.complemento} onChange={(e) => handleCellChange(row.id, 'complemento', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.bairro} onChange={(e) => handleCellChange(row.id, 'bairro', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.cidade} onChange={(e) => handleCellChange(row.id, 'cidade', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.estado} onChange={(e) => handleCellChange(row.id, 'estado', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2"><Input type="text" value={row.cep} onChange={(e) => handleCellChange(row.id, 'cep', e.target.value)} className="bg-slate-700 border-slate-600 text-white text-xs h-7 p-1" /></td>
                    <td className="px-2 py-2">
                      <select value={row.status} onChange={(e) => handleCellChange(row.id, 'status', e.target.value)} className="bg-slate-700 border border-slate-600 text-white text-xs h-7 px-1 rounded">
                        <option>Pendente</option>
                        <option>Aprovado</option>
                        <option>Rejeitado</option>
                        <option>Em Análise</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 text-slate-300 whitespace-nowrap text-xs">{row.submittedAt}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex gap-1">
                        <Button onClick={() => handleSave(row)} disabled={row.isSaving} size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 h-7 px-2 text-xs">
                          {row.isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          Salvar
                        </Button>
                        <Button onClick={() => handleDelete(row.id)} disabled={deleteSubmissionMutation.isPending} size="sm" variant="destructive" className="flex items-center gap-1 h-7 px-2 text-xs">
                          {deleteSubmissionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Del
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!listSubmissions.isLoading && rows.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-slate-400 text-sm">Página {page + 1} de {totalPages}</p>
            <div className="flex gap-2">
              <Button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Anterior</Button>
              <Button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="bg-cyan-600 hover:bg-cyan-700 text-white">Próxima</Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!listSubmissions.isLoading && rows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">Nenhuma submissão encontrada</p>
            <Button onClick={() => setSearch('')} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Limpar filtros</Button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button onClick={() => setLocation('/dashboard')} className="bg-cyan-600 hover:bg-cyan-700 text-white">Ver Dashboard</Button>
          <Button onClick={() => setLocation('/submissoes')} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Ver Submissões (Cards)</Button>
          <Button onClick={() => setLocation('/')} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Voltar ao Formulário</Button>
        </div>
      </div>
    </div>
  );
}
