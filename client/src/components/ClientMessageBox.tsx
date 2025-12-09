import React, { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';

interface ClientMessageBoxProps {
  clientName: string;
  clientEmail: string;
}

export default function ClientMessageBox({ clientName, clientEmail }: ClientMessageBoxProps) {
  const [copied, setCopied] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);

  // Extrair primeiro nome do cliente
  const firstName = clientName.split(' ')[0];

  // Mensagem profissional e humanizada
  const message = `Olá ${firstName},

Espero que você esteja bem!

Gostaria de informar que recebemos com sucesso todos os seus dados e documentos. Estamos processando as informações fornecidas e faremos uma análise detalhada de tudo.

Em breve, entraremos em contato com você para confirmar os próximos passos e esclarecer qualquer dúvida que possa surgir.

Agradecemos pela confiança e pela prontidão em fornecer os dados solicitados. Estamos comprometidos em oferecer um atendimento de qualidade e excelência.

Qualquer dúvida ou necessidade, não hesite em entrar em contato conosco.

Atenciosamente,
Equipe de Atendimento`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!whatsappNumber.trim()) {
      alert('Por favor, insira um número de WhatsApp válido');
      return;
    }

    // Remove caracteres especiais do número
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver (assume Brasil +55)
    const finalNumber = cleanNumber.length === 11 ? `55${cleanNumber}` : cleanNumber;
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Abre WhatsApp Web ou App
    window.open(`https://wa.me/${finalNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-cyan-500/30 shadow-lg">
      {/* Cabeçalho */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">📧 Mensagem para o Cliente</h3>
        <p className="text-sm text-slate-400">
          Clique em "Copiar" para copiar a mensagem e enviar para <span className="text-cyan-300 font-medium">{clientEmail}</span>
        </p>
      </div>

      {/* Caixa de Mensagem */}
      <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 mb-4 min-h-64">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {message}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check size={18} />
              Copiado!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copiar Mensagem
            </>
          )}
        </button>

        <button
          onClick={() => {
            const subject = `Confirmação de Recebimento de Dados - ${clientName}`;
            const body = encodeURIComponent(message);
            window.open(`mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200"
        >
          📨 Enviar por Email
        </button>

        <button
          onClick={() => setShowWhatsappInput(!showWhatsappInput)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
        >
          <MessageCircle size={18} />
          WhatsApp
        </button>
      </div>

      {/* Input de Número WhatsApp */}
      {showWhatsappInput && (
        <div className="mt-4 p-4 bg-slate-800 border border-green-600/30 rounded-lg">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            📱 Número de WhatsApp do Cliente
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="(21) 99999-8888 ou +55 21 99999-8888"
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-all duration-200"
            >
              Enviar
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">💡 Aceita formatos: (21) 99999-8888, 21999998888 ou +55 21 99999-8888</p>
        </div>
      )}

      {/* Informações */}
      <div className="mt-4 p-3 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400">
        <p>💡 <span className="text-slate-300">Dica:</span> Você pode personalizar a mensagem antes de enviar. A mensagem foi gerada automaticamente e pode ser editada conforme necessário.</p>
      </div>
    </div>
  );
}
