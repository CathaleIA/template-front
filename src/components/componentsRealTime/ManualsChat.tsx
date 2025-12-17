import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BookOpen, BarChart3 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  agentType?: 'manuals' | 'data'; // Tipo de agente que respondió
}

export default function ManualsChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hola, soy tu asistente inteligente. Puedo ayudarte con:\n\n📚 Consultas técnicas sobre equipos (manuales, procedimientos, troubleshooting)\n📊 Análisis de datos de telemetría (temperaturas, voltajes, potencia, etc.)\n\n¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // The API returns the response with agent type
      const responseText = typeof data === 'string' ? data : (data.answer || data.response || 'Lo siento, no pude encontrar una respuesta.');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseText,
        sources: data.sources,
        agentType: data.agentType // 'manuals' or 'data'
      }]);
    } catch (error) {
      console.error('Error querying agent:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Hubo un error al consultar el agente. Por favor intenta de nuevo.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Bot className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">Asistente Inteligente</h3>
          <p className="text-xs text-slate-400">Manuales + Datos en Tiempo Real</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-200'
            }`}>
              {/* Agent Type Badge */}
              {msg.role === 'assistant' && msg.agentType && (
                <div className="mb-2 flex items-center gap-1.5">
                  {msg.agentType === 'data' ? (
                    <>
                      <BarChart3 className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs font-medium text-green-400">Datos</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400">Manuales</span>
                    </>
                  )}
                </div>
              )}

              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              
              {/* Sources Citation */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Fuentes consultadas:
                  </p>
                  <div className="space-y-1">
                    {msg.sources.map((source: any, i: number) => (
                      <div key={i} className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                        📄 {source.doc} <span className="opacity-50">(Score: {source.score.toFixed(2)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-sm text-slate-400">Pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre datos, manuales, mantenimiento, errores..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
