import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, CreditCard, Percent, ArrowUpRight, ArrowDownRight } from "lucide-react";

const COLORS = {
  primary: "#0066cc",    // Azul financeiro
  success: "#10b981",    // Verde
  warning: "#f59e0b",    // Ouro/Laranja
  danger: "#ef4444",     // Vermelho
  dark: "#1f2937",       // Cinza escuro
  light: "#f3f4f6",      // Cinza claro
};

export default function DashboardTab() {
  const { data: cardsData } = trpc.admin.listCards.useQuery(
    { search: "", limit: 1000, offset: 0 },
    { enabled: true }
  );

  // Calcular estatísticas
  const calculateStats = () => {
    if (!cardsData?.cards) return { 
      totalCards: 0, 
      totalLimit: 0, 
      totalCommission: 0, 
      commission30: 0, 
      commission10: 0, 
      bankData: [], 
      statusData: [], 
      cardsPerDay: [] 
    };

    const cards = cardsData.cards as any[];
    const totalCards = cards.length;
    const totalLimit = cards.reduce((sum: number, card: any) => sum + (card.limitReturned || 0), 0);
    
    // Calcular comissões (30% e 10%)
    const commission30 = cards
      .filter((c: any) => c.commissionRate === 30)
      .reduce((sum: number, c: any) => sum + ((c.limitReturned || 0) * 0.30), 0);
    const commission10 = cards
      .filter((c: any) => c.commissionRate === 10)
      .reduce((sum: number, c: any) => sum + ((c.limitReturned || 0) * 0.10), 0);
    const totalCommission = commission30 + commission10;

    // Agrupar por banco
    const cardsByBank: Record<string, number> = {};
    cards.forEach((card: any) => {
      const bank = card.bank || "Sem banco";
      cardsByBank[bank] = (cardsByBank[bank] || 0) + 1;
    });

    const bankData = Object.entries(cardsByBank).map(([name, value]) => ({
      name,
      value,
    }));

    // Agrupar por status
    const statusCounts: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
    cards.forEach((card: any) => {
      const status = card.status || "pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = [
      { name: "Pendente", value: statusCounts.pending, fill: COLORS.warning },
      { name: "Aprovado", value: statusCounts.approved, fill: COLORS.success },
      { name: "Rejeitado", value: statusCounts.rejected, fill: COLORS.danger },
    ];

    // Cartões por dia (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const cardsPerDay = last7Days.map((day) => {
      const count = cards.filter((c: any) => {
        const cardDate = new Date(c.createdAt).toISOString().split("T")[0];
        return cardDate === day;
      }).length;
      return {
        day: new Date(day).toLocaleDateString("pt-BR", { weekday: "short" }),
        cartoes: count,
      };
    });

    return {
      totalCards,
      totalLimit,
      totalCommission,
      commission30,
      commission10,
      bankData,
      statusData,
      cardsPerDay,
    };
  };

  const stats = calculateStats();

  // Formatar valores em Real
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard Financeiro
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Acompanhe em tempo real o desempenho de seus cartões e ganhos
        </p>
      </div>

      {/* Cards de Resumo - Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card Total de Cartões */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                Total de Cartões
              </p>
              <p className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-100">
                {stats.totalCards}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Cartões cadastrados
              </p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Card Limite Total */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                Limite Total
              </p>
              <p className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(stats.totalLimit)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Limite disponível
              </p>
            </div>
            <div className="bg-green-500 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Card Comissão 30% */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                Comissão 30%
              </p>
              <p className="text-2xl md:text-3xl font-bold text-amber-900 dark:text-amber-100">
                {formatCurrency(stats.commission30)}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Ganhos acumulados
              </p>
            </div>
            <div className="bg-amber-500 rounded-lg p-3">
              <Percent className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Card Comissão 10% */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                Comissão 10%
              </p>
              <p className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(stats.commission10)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                Ganhos acumulados
              </p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos - Grid Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gráfico de Cartões Criados */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Cartões Criados (Últimos 7 dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.cardsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
              <XAxis dataKey="day" stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: COLORS.dark, 
                  border: `1px solid ${COLORS.primary}`,
                  borderRadius: "8px",
                  color: "white"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cartoes" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição por Banco */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Distribuição por Banco
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.bankData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill={COLORS.primary}
                dataKey="value"
              >
                {stats.bankData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={[COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Status dos Cartões */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Status dos Cartões
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
              <XAxis dataKey="name" stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: COLORS.dark, 
                  border: `1px solid ${COLORS.primary}`,
                  borderRadius: "8px",
                  color: "white"
                }}
              />
              <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]}>
                {stats.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ganhos por Comissão */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Ganhos por Comissão
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: "30%", value: stats.commission30, fill: COLORS.success },
              { name: "10%", value: stats.commission10, fill: COLORS.warning }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} />
              <XAxis dataKey="name" stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: COLORS.dark, 
                  border: `1px solid ${COLORS.primary}`,
                  borderRadius: "8px",
                  color: "white"
                }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {[
                  { name: "30%", value: stats.commission30, fill: COLORS.success },
                  { name: "10%", value: stats.commission10, fill: COLORS.warning }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumo de Ganhos */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 rounded-lg p-6 md:p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm mb-2">Total de Ganhos</p>
            <p className="text-3xl md:text-4xl font-bold">{formatCurrency(stats.totalCommission)}</p>
          </div>
          <div className="border-l border-r border-blue-400 px-6">
            <p className="text-blue-100 text-sm mb-2">Ticket Médio</p>
            <p className="text-3xl md:text-4xl font-bold">
              {stats.totalCards > 0 ? formatCurrency(stats.totalLimit / stats.totalCards) : "R$ 0"}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-2">Margem Média</p>
            <p className="text-3xl md:text-4xl font-bold">
              {stats.totalLimit > 0 ? ((stats.totalCommission / stats.totalLimit) * 100).toFixed(1) : "0"}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
