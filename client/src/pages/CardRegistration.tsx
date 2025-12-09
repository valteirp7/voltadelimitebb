import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Save, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CardRow {
  id: number;
  holderName: string;
  sentBy: string;
  limitReturned: number;
  status: string;
  documentSentDate: string;
  isSaving: boolean;
}

export default function CardRegistration() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<CardRow[]>([]);
  const [formData, setFormData] = useState({
    holderName: "",
    sentBy: "",
    limitReturned: "",
    status: "Pendente",
    documentSentDate: "",
  });

  // Listar cartões
  const listCards = trpc.admin.listCards.useQuery(
    { search, limit: 50, offset: page * 50 },
    { enabled: true }
  );

  // Criar cartão
  const createCardMutation = trpc.admin.createCard.useMutation({
    onSuccess: () => {
      toast.success("Cartão cadastrado com sucesso!");
      setFormData({
        holderName: "",
        sentBy: "",
        limitReturned: "",
        status: "Pendente",
        documentSentDate: "",
      });
      listCards.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar cartão");
    },
  });

  // Atualizar cartão
  const updateCardMutation = trpc.admin.updateCard.useMutation({
    onSuccess: () => {
      toast.success("Cartão atualizado com sucesso!");
      listCards.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar cartão");
    },
  });

  // Deletar cartão
  const deleteCardMutation = trpc.admin.deleteCard.useMutation({
    onSuccess: () => {
      toast.success("Cartão deletado com sucesso!");
      listCards.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar cartão");
    },
  });

  // Sincronizar dados
  if (listCards.data?.cards && rows.length === 0) {
    setRows(
      listCards.data.cards.map((card: any) => ({
        id: card.id,
        holderName: card.holderName || "",
        sentBy: card.sentBy || "",
        limitReturned: card.limitReturned || 0,
        status: card.status || "Pendente",
        documentSentDate: card.documentSentDate
          ? new Date(card.documentSentDate).toLocaleDateString("pt-BR")
          : "",
        isSaving: false,
      }))
    );
  }

  const handleCellChange = (id: number, field: string, value: string | number) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = (row: CardRow) => {
    setRows(rows.map((r) => (r.id === row.id ? { ...r, isSaving: true } : r)));

    updateCardMutation.mutate({
      id: row.id,
      holderName: row.holderName,
      sentBy: row.sentBy,
      limitReturned: Number(row.limitReturned),
      status: row.status as "pending" | "completed" | "cancelled",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este cartão?")) {
      deleteCardMutation.mutate({ id });
    }
  };

  const handleCreateCard = () => {
    if (!formData.holderName || !formData.sentBy || !formData.limitReturned) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createCardMutation.mutate({
      holderName: formData.holderName,
      sentBy: formData.sentBy,
      limitReturned: Number(formData.limitReturned),
      status: formData.status as "pending" | "completed" | "cancelled",
    });
  };

  const total = listCards.data?.total || 0;
  const totalLimit = rows.reduce((sum, row) => sum + Number(row.limitReturned || 0), 0);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cadastro de Cartões</h1>
          <p className="text-slate-400">Gerencie todos os cartões cadastrados</p>
        </div>

        {/* Formulário de Cadastro */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Novo Cartão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Nome do Titular</label>
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Quem Mandou</label>
                <Input
                  type="text"
                  placeholder="Nome de quem mandou"
                  value={formData.sentBy}
                  onChange={(e) => setFormData({ ...formData, sentBy: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Limite</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.limitReturned}
                  onChange={(e) => setFormData({ ...formData, limitReturned: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Data Envio Documento</label>
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.documentSentDate}
                  onChange={(e) => setFormData({ ...formData, documentSentDate: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-slate-700 border border-slate-600 text-white text-sm h-10 px-3 rounded w-full"
                >
                  <option>Pendente</option>
                  <option>Aprovado</option>
                  <option>Rejeitado</option>
                  <option>Em Análise</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateCard}
                  disabled={createCardMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white w-full flex items-center gap-2 h-10"
                >
                  {createCardMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Cadastrar Cartão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Cartões */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Cartões Cadastrados</h2>
              <p className="text-slate-400 text-sm">Total: {total} cartão(ões) | Limite Total: R$ {totalLimit.toFixed(2)}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar por nome, quem mandou..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10"
            />
          </div>

          {/* Loading State */}
          {listCards.isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-cyan-400" />
            </div>
          )}

          {/* Table */}
          {!listCards.isLoading && rows.length > 0 && (
            <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 border-b border-slate-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Nome Titular</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Quem Mandou</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Limite</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Data Envio</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                      <td className="px-4 py-3 text-slate-300 font-semibold">#{row.id}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={row.holderName}
                          onChange={(e) => handleCellChange(row.id, "holderName", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={row.sentBy}
                          onChange={(e) => handleCellChange(row.id, "sentBy", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={row.limitReturned}
                          onChange={(e) => handleCellChange(row.id, "limitReturned", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={row.documentSentDate}
                          onChange={(e) => handleCellChange(row.id, "documentSentDate", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                          placeholder="DD/MM/AAAA"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.status}
                          onChange={(e) => handleCellChange(row.id, "status", e.target.value)}
                          className="bg-slate-700 border border-slate-600 text-white text-sm h-8 px-2 rounded"
                        >
                          <option>Pendente</option>
                          <option>Aprovado</option>
                          <option>Rejeitado</option>
                          <option>Em Análise</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave(row)}
                            disabled={row.isSaving}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 h-8"
                          >
                            {row.isSaving ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            Salvar
                          </Button>
                          <Button
                            onClick={() => handleDelete(row.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 h-8"
                          >
                            <Trash2 className="w-3 h-3" />
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

          {/* Empty State */}
          {!listCards.isLoading && rows.length === 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <p className="text-slate-400">Nenhum cartão cadastrado. Crie um novo cartão acima!</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-slate-400 text-sm">Página {page + 1} de {totalPages}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="bg-slate-700 hover:bg-slate-600 text-white"
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
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            <Button
              onClick={() => window.location.href = '/admin'}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Voltar ao Admin
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Ver Dashboard
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Voltar ao Formulário
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
