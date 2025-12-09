import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Target } from "lucide-react";
import { useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Redirecionar se não autenticado ou não é admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  const weeklyStats = trpc.admin.getWeeklyStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin'
  });

  const commissionStats = trpc.admin.getCommissionStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin'
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (weeklyStats.isLoading || commissionStats.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="animate-spin w-8 h-8 text-cyan-400" />
      </div>
    );
  }

  const weekly = weeklyStats.data;
  const commission = commissionStats.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard de Ganhos</h1>
          <p className="text-slate-400">Acompanhe suas comissões e performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total de Cartões */}
          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                Cartões (Semana)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{weekly?.totalCards || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Últimos 7 dias</p>
            </CardContent>
          </Card>

          {/* Total de Limite */}
          <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                Limite Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">R$ {(weekly?.totalLimit || 0).toLocaleString('pt-BR')}</div>
              <p className="text-xs text-slate-400 mt-1">Valor total</p>
            </CardContent>
          </Card>

          {/* Comissão 30% */}
          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Comissão 30%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">R$ {(weekly?.commissionBy30 || 0).toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">{commission?.commission30Count || 0} cartões</p>
            </CardContent>
          </Card>

          {/* Comissão 10% */}
          <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-500" />
                Comissão 10%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">R$ {(weekly?.commissionBy10 || 0).toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-1">{commission?.commission10Count || 0} cartões</p>
            </CardContent>
          </Card>
        </div>

        {/* Total Ganho */}
        <Card className="bg-gradient-to-r from-cyan-900 to-orange-900 border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Total de Ganhos (Semana)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-500">
              R$ {(weekly?.totalCommission || 0).toFixed(2)}
            </div>
            <p className="text-slate-300 mt-2">Comissão 30% + Comissão 10%</p>
          </CardContent>
        </Card>

        {/* Grafico de Ganhos por Dia */}
        {weekly?.cardsByDay && weekly.cardsByDay.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Ganhos por Dia</CardTitle>
              <CardDescription className="text-slate-400">Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weekly.cardsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="commission" stroke="#06b6d4" name="Comissão (R$)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ganhos por Categoria */}
        {commission?.byCategory && commission.byCategory.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Ganhos por Categoria</CardTitle>
              <CardDescription className="text-slate-400">Distribuição de comissões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commission.byCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{cat.category}</p>
                      <p className="text-sm text-slate-400">{cat.count} cartão(ões)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-bold">R$ {cat.totalCommission.toFixed(2)}</p>
                      <p className="text-sm text-slate-400">Limite: R$ {cat.totalLimit.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="mt-8 flex gap-4">
          <Button 
            onClick={() => setLocation('/admin')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Ver Submissões
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
    </div>
  );
}
