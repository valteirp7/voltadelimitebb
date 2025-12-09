import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface BankStats {
  bank: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalLimit: number;
}

const BANKS = [
  "Banco do Brasil",
  "Caixa",
  "Sicoob",
  "Bradesco",
  "Carrefour",
  "Atacadão",
  "PicPay",
  "Nubank",
  "Santander",
  "Porto Seguro",
  "Safra",
  "Itaú",
];

export default function BankDistributionTab() {
  // Listar todos os cartões
  const listCards = trpc.admin.listCards.useQuery(
    { search: "", limit: 1000, offset: 0 },
    { enabled: true }
  );

  // Calcular estatísticas por banco
  const bankStats = useMemo(() => {
    const stats: Record<string, BankStats> = {};

    // Inicializar todos os bancos
    BANKS.forEach((bank) => {
      stats[bank] = {
        bank,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalLimit: 0,
      };
    });

    // Processar cartões
    if (listCards.data?.cards) {
      listCards.data.cards.forEach((card: any) => {
        const bank = card.bank || "Banco do Brasil";
        if (stats[bank]) {
          stats[bank].total += 1;
          stats[bank].totalLimit += card.limitReturned || 0;

          const status = card.status || "pending";
          if (status === "pending") stats[bank].pending += 1;
          else if (status === "completed") stats[bank].approved += 1;
          else if (status === "cancelled") stats[bank].rejected += 1;
        }
      });
    }

    return Object.values(stats);
  }, [listCards.data?.cards]);

  const totalCards = bankStats.reduce((sum, s) => sum + s.total, 0);
  const totalLimit = bankStats.reduce((sum, s) => sum + s.totalLimit, 0);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Cartões por Banco</h2>
        <p className="text-slate-400">Acompanhe a distribuição de cartões por instituição bancária</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Total de Cartões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-cyan-400">{totalCards}</div>
            <p className="text-xs text-slate-400 mt-1">Distribuídos entre bancos</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Limite Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400">R$ {totalLimit.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">Soma de todos os limites</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Bancos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-400">
              {bankStats.filter((s) => s.total > 0).length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Com cartões cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Distribuição */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Distribuição por Instituição</CardTitle>
        </CardHeader>
        <CardContent>
          {listCards.isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr className="text-slate-300">
                    <th className="text-left px-4 py-3">Banco</th>
                    <th className="text-center px-4 py-3">Total</th>
                    <th className="text-center px-4 py-3">Pendentes</th>
                    <th className="text-center px-4 py-3">Aprovados</th>
                    <th className="text-center px-4 py-3">Rejeitados</th>
                    <th className="text-right px-4 py-3">Limite Total</th>
                    <th className="text-center px-4 py-3">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bankStats.map((stat) => (
                    <tr
                      key={stat.bank}
                      className={`border-b border-slate-700 hover:bg-slate-700/50 ${
                        stat.total === 0 ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-300 font-medium">{stat.bank}</td>
                      <td className="px-4 py-3 text-center text-white font-semibold">{stat.total}</td>
                      <td className="px-4 py-3 text-center text-yellow-400">{stat.pending}</td>
                      <td className="px-4 py-3 text-center text-green-400">{stat.approved}</td>
                      <td className="px-4 py-3 text-center text-red-400">{stat.rejected}</td>
                      <td className="px-4 py-3 text-right text-cyan-400 font-semibold">
                        R$ {stat.totalLimit.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">
                        {totalCards > 0 ? ((stat.total / totalCards) * 100).toFixed(1) : "0"}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!listCards.isLoading && bankStats.every((s) => s.total === 0) && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <p className="text-slate-400">Nenhum cartão cadastrado ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
