import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Save, Trash2, Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CardRow {
  id: number;
  holderName: string;
  sentBy: string;
  limitReturned: number;
  commissionRate: number;
  status: string;
  createdDate: string;
  isSaving: boolean;
}

export default function CardManager() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<CardRow[]>([]);
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCard, setNewCard] = useState({
    holderName: "",
    sentBy: "",
    limitReturned: 0,
    commissionRate: 30,
  });

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  const listCards = trpc.admin.listCards.useQuery(
    { search, limit: 100, offset: page * 100 },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  const createCardMutation = trpc.admin.createCard.useMutation({
    onSuccess: () => {
      toast.success("Cartão criado!");
      setNewCard({ holderName: "", sentBy: "", limitReturned: 0, commissionRate: 30 });
      setShowNewCard(false);
      listCards.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar cartão");
    },
  });

  const updateCardMutation = trpc.admin.updateCard.useMutation({
    onSuccess: () => {
      toast.success("Cartão atualizado!");
      listCards.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar");
    },
  });

  const deleteCardMutation = trpc.admin.deleteCard.useMutation({
    onSuccess: () => {
      toast.success("Cartão deletado!");
      listCards.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar");
    },
  });

  // Sincronizar dados
  useEffect(() => {
    if (listCards.data?.cards) {
      setRows(
        listCards.data.cards.map((card: any) => ({
          id: card.id,
          holderName: card.holderName || "",
          sentBy: card.sentBy || "",
          limitReturned: card.limitReturned || 0,
          commissionRate: card.commissionRate || 0,
          status: card.status || "pending",
          createdDate: card.createdDate ? new Date(card.createdDate).toLocaleDateString('pt-BR') : "",
          isSaving: false,
        }))
      );
    }
  }, [listCards.data]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleCellChange = (id: number, field: string, value: any) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = async (row: CardRow) => {
    setRows(rows.map(r => r.id === row.id ? { ...r, isSaving: true } : r));
    
    updateCardMutation.mutate({
      id: row.id,
      holderName: row.holderName,
      sentBy: row.sentBy,
      limitReturned: row.limitReturned,
      commissionRate: row.commissionRate,
      status: row.status as any,
    });

    setRows(rows.map(r => r.id === row.id ? { ...r, isSaving: false } : r));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      deleteCardMutation.mutate({ id });
    }
  };

  const handleCreateCard = () => {
    if (!newCard.holderName || !newCard.sentBy) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createCardMutation.mutate(newCard);
  };

  const total = listCards.data?.total || 0;
  const weekCards = rows.length; // Simplificado
  const totalLimit = rows.reduce((sum, r) => sum + r.limitReturned, 0);
  const commission30 = rows.filter(r => r.commissionRate === 30).reduce((sum, r) => sum + (r.limitReturned * 0.30), 0);
  const commission10 = rows.filter(r => r.commissionRate === 10).reduce((sum, r) => sum + (r.limitReturned * 0.10), 0);
  const totalPages = Math.ceil(total / 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Gerenciador de Cartões</h1>
          <p className="text-slate-400">Gerencie seus cartões de crédito e comissões</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Cartões esta semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{weekCards}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Limite Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">R$ {totalLimit.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Comissão 30%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">R$ {commission30.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Comissão 10%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">R$ {commission10.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Total Ganho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">R$ {(commission30 + commission10).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar por nome, email ou quem enviou..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10"
            />
          </div>
          <Button
            onClick={() => setShowNewCard(!showNewCard)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Cartão
          </Button>
        </div>

        {/* Novo Cartão Form */}
        {showNewCard && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Criar Novo Cartão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nome do Titular"
                  value={newCard.holderName}
                  onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  placeholder="Enviado Por"
                  value={newCard.sentBy}
                  onChange={(e) => setNewCard({ ...newCard, sentBy: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Limite Retornado"
                  value={newCard.limitReturned}
                  onChange={(e) => setNewCard({ ...newCard, limitReturned: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <select
                  value={newCard.commissionRate}
                  onChange={(e) => setNewCard({ ...newCard, commissionRate: parseInt(e.target.value) })}
                  className="bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
                >
                  <option value={30}>Comissão 30%</option>
                  <option value={10}>Comissão 10%</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleCreateCard}
                  disabled={createCardMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {createCardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
                </Button>
                <Button
                  onClick={() => setShowNewCard(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          <select className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded text-sm">
            <option>Todos os Status</option>
            <option>Pendente</option>
            <option>Completo</option>
            <option>Cancelado</option>
          </select>
        </div>

        {/* Loading State */}
        {listCards.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-cyan-400" />
          </div>
        )}

        {/* Table */}
        {!listCards.isLoading && rows.length > 0 && (
          <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg mb-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-white font-semibold">Nome</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Enviado Por</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Limite</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Taxa</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Comissão</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Data Criação</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const commission = (row.limitReturned * row.commissionRate) / 100;
                  return (
                    <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={row.holderName}
                          onChange={(e) => handleCellChange(row.id, 'holderName', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={row.sentBy}
                          onChange={(e) => handleCellChange(row.id, 'sentBy', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={row.limitReturned}
                          onChange={(e) => handleCellChange(row.id, 'limitReturned', parseInt(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.commissionRate}
                          onChange={(e) => handleCellChange(row.id, 'commissionRate', parseInt(e.target.value))}
                          className="bg-slate-700 border border-slate-600 text-white text-sm h-8 px-2 rounded"
                        >
                          <option value={30}>30%</option>
                          <option value={10}>10%</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-semibold">R$ {commission.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={row.status}
                          onChange={(e) => handleCellChange(row.id, 'status', e.target.value)}
                          className="bg-slate-700 border border-slate-600 text-white text-sm h-8 px-2 rounded"
                        >
                          <option value="pending">Pendente</option>
                          <option value="completed">Completo</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-sm">{row.createdDate}</td>
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
                            disabled={deleteCardMutation.isPending}
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-1 h-8"
                          >
                            {deleteCardMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!listCards.isLoading && rows.length === 0 && (
          <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="text-slate-400 mb-4">Nenhum cartão encontrado. Clique em "Novo Cartão" para começar.</p>
          </div>
        )}

        {/* Pagination */}
        {!listCards.isLoading && rows.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
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
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => setLocation('/admin')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Voltar ao Painel Admin
          </Button>
          <Button
            onClick={() => setLocation('/dashboard')}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Ver Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
