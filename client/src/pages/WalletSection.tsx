import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface WalletData {
  totalBalance: number;
  totalCommissions: number;
  withdrawnAmount: number;
  pendingAmount: number;
}

interface CommissionStats {
  total?: number;
  pending?: number;
  approved?: number;
  withdrawn?: number;
  available?: number;
  commission30Count?: number;
  commission30Total?: number;
  commission10Count?: number;
  commission10Total?: number;
  byCategory?: Array<{ category: string; count: number; totalLimit: number; totalCommission: number }>;
}

export default function WalletSection() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null);

  const getWalletQuery = trpc.wallet.getWallet.useQuery();
  const getCommissionsQuery = trpc.wallet.getCommissions.useQuery();

  useEffect(() => {
    if (getWalletQuery.data) {
      setWalletData(getWalletQuery.data);
    }
  }, [getWalletQuery.data]);

  useEffect(() => {
    if (getCommissionsQuery.data) {
      setCommissionStats(getCommissionsQuery.data);
    }
  }, [getCommissionsQuery.data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-8 h-8 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Carteira de Saldo</h2>
      </div>

      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {walletData ? formatCurrency(walletData.totalBalance) : "R$ 0,00"}
            </div>
            <p className="text-xs text-slate-500 mt-2">Saldo disponível para saque</p>
          </CardContent>
        </Card>

        {/* Total Commissions */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Total de Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {commissionStats ? formatCurrency(commissionStats.total) : "R$ 0,00"}
            </div>
            <p className="text-xs text-slate-500 mt-2">Todas as comissões ganhas</p>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-yellow-400" />
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">
              {commissionStats ? formatCurrency(commissionStats.pending) : "R$ 0,00"}
            </div>
            <p className="text-xs text-slate-500 mt-2">Aguardando aprovação</p>
          </CardContent>
        </Card>

        {/* Withdrawn Amount */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-red-400" />
              Sacado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">
              {walletData ? formatCurrency(walletData.withdrawnAmount) : "R$ 0,00"}
            </div>
            <p className="text-xs text-slate-500 mt-2">Já sacado da carteira</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Status Breakdown */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Resumo de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Aprovadas</p>
              <p className="text-2xl font-bold text-green-400">
                {commissionStats ? formatCurrency(commissionStats.approved) : "R$ 0,00"}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Disponível</p>
              <p className="text-2xl font-bold text-cyan-400">
                {commissionStats ? formatCurrency(commissionStats.available) : "R$ 0,00"}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Sacado</p>
              <p className="text-2xl font-bold text-slate-300">
                {walletData ? formatCurrency(walletData.withdrawnAmount) : "R$ 0,00"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Message */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <p className="text-sm text-slate-300">
          💡 <strong>Dica:</strong> Sua carteira é atualizada automaticamente quando novas comissões são geradas. 
          Você pode sacar o saldo disponível a qualquer momento.
        </p>
      </div>
    </div>
  );
}
