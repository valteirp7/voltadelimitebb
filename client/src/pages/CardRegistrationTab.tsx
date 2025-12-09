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
  bank: string;
  limitReturned: number;
  status: string;
  documentSentDate: string;
  isSaving: boolean;
}

export default function CardRegistrationTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<CardRow[]>([]);
  const [formData, setFormData] = useState({
    holderName: "",
    sentBy: "",
    limitReturned: "",
    status: "Pendente",
    documentSentDate: "",
    bank: "Banco do Brasil",
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
        bank: "Banco do Brasil",
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
        bank: card.bank || "Banco do Brasil",
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
      bank: row.bank,
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
      bank: formData.bank,
    });
  };

  const total = listCards.data?.total || 0;
  const totalLimit = rows.reduce((sum, row) => sum + Number(row.limitReturned || 0), 0);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Cadastro de Cartões</h2>
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
              <label className="text-slate-300 text-sm font-medium mb-2 block">Banco</label>
              <select
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="bg-slate-700 border border-slate-600 text-white text-sm h-10 px-3 rounded w-full"
              >
                <option>Banco do Brasil</option>
                <option>Caixa</option>
                <option>Sicoob</option>
                <option>Bradesco</option>
                <option>Carrefour</option>
                <option>Atacadão</option>
                <option>PicPay</option>
                <option>Nubank</option>
                <option>Santander</option>
                <option>Porto Seguro</option>
                <option>Safra</option>
                <option>Itaú</option>
              </select>
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
                className="bg-cyan-600 hover:bg-cyan-700 text-white w-full h-10 flex items-center gap-2"
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

      {/* Tabela de Cartões */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Cartões Cadastrados</CardTitle>
          <p className="text-slate-400 text-sm mt-2">
            Total: {total} cartão(ões) | Limite Total: R$ {totalLimit.toFixed(2)}
          </p>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-6 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, quem mandou..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="bg-slate-700 border-slate-600 text-white pl-10"
              />
            </div>
          </div>

          {/* Tabela */}
          {listCards.isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            </div>
          ) : rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr className="text-slate-300">
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">Nome Titular</th>
                    <th className="text-left px-4 py-3">Quem Mandou</th>
                    <th className="text-left px-4 py-3">Banco</th>
                    <th className="text-left px-4 py-3">Limite</th>
                    <th className="text-left px-4 py-3">Data Envio</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-slate-300">#{row.id}</td>
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
                        <select
                          value={row.bank}
                          onChange={(e) => handleCellChange(row.id, "bank", e.target.value)}
                          className="bg-slate-700 border border-slate-600 text-white text-sm h-8 px-2 rounded w-full"
                        >
                          <option>Banco do Brasil</option>
                          <option>Caixa</option>
                          <option>Sicoob</option>
                          <option>Bradesco</option>
                          <option>Carrefour</option>
                          <option>Atacadão</option>
                          <option>PicPay</option>
                          <option>Nubank</option>
                          <option>Santander</option>
                          <option>Porto Seguro</option>
                          <option>Safra</option>
                          <option>Itaú</option>
                        </select>
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
                          </Button>
                          <Button
                            onClick={() => handleDelete(row.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 h-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
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
        </CardContent>
      </Card>
    </div>
  );
}
