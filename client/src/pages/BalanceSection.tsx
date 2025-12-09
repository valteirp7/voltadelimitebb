import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function BalanceSection() {
  // Listar cartões para calcular saldo
  const listCards = trpc.admin.listCards.useQuery(
    { search: "", limit: 1000, offset: 0 },
    { enabled: true }
  );

  if (listCards.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const cards = listCards.data?.cards || [];
  const totalCards = cards.length;
  const totalLimitReturned = cards.reduce((sum, card: any) => sum + (card.limitReturned || 0), 0);
  const pendingCards = cards.filter((card: any) => card.status === "pending" || card.status === "Pendente").length;
  const completedCards = cards.filter((card: any) => card.status === "completed" || card.status === "Aprovado").length;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Saldo de Cartões</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total de Cartões */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Total de Cartões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-cyan-400">{totalCards}</div>
            <p className="text-xs text-slate-400 mt-1">Cartões cadastrados</p>
          </CardContent>
        </Card>

        {/* Limite Total Retornado */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Limite Retornado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400">R$ {totalLimitReturned.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Total disponível</p>
          </CardContent>
        </Card>

        {/* Cartões Pendentes */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-400">{pendingCards}</div>
            <p className="text-xs text-slate-400 mt-1">Em processamento</p>
          </CardContent>
        </Card>

        {/* Cartões Aprovados */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-400">{completedCards}</div>
            <p className="text-xs text-slate-400 mt-1">Finalizados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
