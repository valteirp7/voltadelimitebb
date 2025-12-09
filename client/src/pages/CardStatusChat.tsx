import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function CardStatusChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Olá! 👋 Bem-vindo ao assistente de status de cartão. Digite seu CPF ou email para consultar o status do seu cartão.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCardStatus = (identifier: string): string => {
    // Simular resposta baseada no identificador
    const statuses = [
      'Seu cartão está em análise. Estamos verificando todos os dados fornecidos. Tempo estimado: 2-3 dias úteis.',
      'Parabéns! Seu cartão foi aprovado! O limite foi restaurado. Você já pode usar normalmente.',
      'Seu cartão está em processamento. Estamos finalizando os últimos detalhes. Retorno em breve!',
      'Seu cartão foi aprovado com sucesso! Limite disponível: R$ 5.000,00',
      'Ainda estamos analisando sua solicitação. Fique atento ao seu email para atualizações.',
    ];

    // Usar o hash do identificador para retornar um status consistente
    const hash = identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return statuses[hash % statuses.length];
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simular delay de resposta
    setTimeout(() => {
      let botResponse = '';

      // Verificar se é CPF ou email
      const isCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/.test(input.trim());
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());

      if (isCPF || isEmail) {
        botResponse = `✅ Encontrei seu registro!\n\n${getCardStatus(input)}\n\nPrecisa de mais informações? Digite "ajuda" para ver as opções disponíveis.`;
      } else if (input.toLowerCase().includes('ajuda') || input.toLowerCase().includes('help')) {
        botResponse = `📋 Aqui estão as opções disponíveis:\n\n1️⃣ Digite seu CPF (formato: 000.000.000-00) para consultar o status\n2️⃣ Digite seu email para consultar o status\n3️⃣ Digite "limite" para saber sobre seu limite de crédito\n4️⃣ Digite "contato" para falar com um atendente\n\nComo posso ajudá-lo?`;
      } else if (input.toLowerCase().includes('limite')) {
        botResponse = `💳 Informações sobre Limite:\n\nSeu limite atual está sendo processado. Assim que aprovado, você receberá uma notificação com o valor disponível.\n\nDeseja consultar o status novamente? Digite seu CPF ou email.`;
      } else if (input.toLowerCase().includes('contato') || input.toLowerCase().includes('atendente')) {
        botResponse = `📞 Para falar com um atendente:\n\n📧 Email: suporte@trampobb.com\n📱 WhatsApp: (21) 99999-8888\n🕐 Horário de atendimento: Segunda a Sexta, 9h às 18h\n\nEstamos aqui para ajudar!`;
      } else {
        botResponse = `Desculpe, não entendi sua mensagem. 🤔\n\nDigite seu CPF ou email para consultar o status do cartão, ou digite "ajuda" para ver as opções disponíveis.`;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-screen md:h-[600px] bg-slate-800 rounded-lg shadow-2xl border border-cyan-500/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center gap-3">
          <MessageCircle size={28} className="text-white" />
          <div>
            <h1 className="text-xl font-bold text-white">Assistente de Status de Cartão</h1>
            <p className="text-cyan-100 text-sm">Consulte o status do seu cartão em tempo real</p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none border border-slate-600">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-800 border-t border-slate-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite seu CPF, email ou 'ajuda'..."
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            💡 Dica: Digite seu CPF (000.000.000-00) ou email para consultar o status
          </p>
        </div>
      </div>
    </div>
  );
}
