import React, { useState } from 'react';
import { Send, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface CardNotification {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  approvalDate: string;
  approvalTime: string;
  availableLimit: string;
  message: string;
  createdAt: Date;
}

interface ApprovedCardNotificationProps {
  onNotificationAdded?: (notification: CardNotification) => void;
}

export default function ApprovedCardNotification({ onNotificationAdded }: ApprovedCardNotificationProps) {
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState<CardNotification[]>([]);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    approvalDate: new Date().toISOString().split('T')[0],
    approvalTime: new Date().toTimeString().slice(0, 5),
    availableLimit: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.clientName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    if (!formData.clientEmail.trim()) {
      toast.error('Email do cliente é obrigatório');
      return;
    }
    if (!formData.availableLimit.trim()) {
      toast.error('Limite disponível é obrigatório');
      return;
    }

    const newNotification: CardNotification = {
      id: Date.now().toString(),
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      approvalDate: formData.approvalDate,
      approvalTime: formData.approvalTime,
      availableLimit: formData.availableLimit,
      message: formData.message,
      createdAt: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    onNotificationAdded?.(newNotification);

    // Limpar formulário
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      approvalDate: new Date().toISOString().split('T')[0],
      approvalTime: new Date().toTimeString().slice(0, 5),
      availableLimit: '',
      message: '',
    });

    setShowForm(false);
    toast.success('Notificação de cartão aprovado registrada com sucesso!');
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notificação removida');
  };

  const handleSendNotification = (notification: CardNotification) => {
    const message = `Parabéns ${notification.clientName}! 🎉

Seu cartão foi APROVADO!

📅 Data de Aprovação: ${new Date(notification.approvalDate).toLocaleDateString('pt-BR')}
🕐 Horário: ${notification.approvalTime}
💳 Limite Disponível: R$ ${notification.availableLimit}

${notification.message ? `📝 Observações: ${notification.message}` : ''}

Você já pode usar seu cartão normalmente!

Qualquer dúvida, entre em contato conosco.

Atenciosamente,
Equipe de Atendimento`;

    // Copiar para clipboard
    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada! Você pode enviar por WhatsApp ou Email');

    // Abrir WhatsApp se tiver telefone
    if (notification.clientPhone) {
      const cleanPhone = notification.clientPhone.replace(/\D/g, '');
      const finalNumber = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${finalNumber}?text=${encodedMessage}`, '_blank');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Botão para Abrir Formulário */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">✅ Cartões Aprovados</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Cartão Aprovado
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-cyan-400">Registrar Cartão Aprovado</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Cliente */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  👤 Nome do Cliente *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Ex: João Silva"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📧 Email *
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="Ex: joao@email.com"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📱 Telefone/WhatsApp
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="Ex: (21) 99999-8888"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Data de Aprovação */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📅 Data de Aprovação
                </label>
                <input
                  type="date"
                  name="approvalDate"
                  value={formData.approvalDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Hora de Aprovação */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🕐 Hora de Aprovação
                </label>
                <input
                  type="time"
                  name="approvalTime"
                  value={formData.approvalTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Limite Disponível */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  💳 Limite Disponível (R$) *
                </label>
                <input
                  type="text"
                  name="availableLimit"
                  value={formData.availableLimit}
                  onChange={handleInputChange}
                  placeholder="Ex: 5000.00"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Mensagem Adicional */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📝 Mensagem Adicional (Opcional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Ex: Aproveite seu novo limite! Qualquer dúvida, entre em contato."
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
              >
                <Send size={18} />
                Registrar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Notificações */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-gradient-to-r from-green-900/20 to-cyan-900/20 border border-green-600/30 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-green-400">{notification.clientName}</h4>
                  <p className="text-sm text-slate-400">{notification.clientEmail}</p>
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                <div>
                  <span className="text-slate-400">Data:</span>
                  <p className="text-cyan-400 font-medium">
                    {new Date(notification.approvalDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Hora:</span>
                  <p className="text-cyan-400 font-medium">{notification.approvalTime}</p>
                </div>
                <div>
                  <span className="text-slate-400">Limite:</span>
                  <p className="text-green-400 font-medium">R$ {notification.availableLimit}</p>
                </div>
                <div>
                  <span className="text-slate-400">Registrado:</span>
                  <p className="text-slate-300 font-medium">
                    {notification.createdAt.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {notification.message && (
                <div className="mb-3 p-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300">
                  <p className="font-medium text-slate-400 mb-1">Observações:</p>
                  <p>{notification.message}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSendNotification(notification)}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  💬 Enviar Notificação
                </button>
                <button
                  onClick={() => {
                    const message = `Parabéns ${notification.clientName}! 🎉\n\nSeu cartão foi APROVADO!\n\n📅 Data: ${new Date(notification.approvalDate).toLocaleDateString('pt-BR')}\n🕐 Hora: ${notification.approvalTime}\n💳 Limite: R$ ${notification.availableLimit}`;
                    navigator.clipboard.writeText(message);
                    toast.success('Mensagem copiada!');
                  }}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium text-sm transition-colors"
                >
                  📋 Copiar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <p className="text-slate-400 text-lg">Nenhum cartão aprovado registrado ainda</p>
          <p className="text-slate-500 text-sm mt-2">Clique em "Novo Cartão Aprovado" para registrar</p>
        </div>
      )}
    </div>
  );
}
