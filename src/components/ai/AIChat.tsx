'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BookOpen, Brain, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasManualContext?: boolean;
  sources?: Array<{
    source: string;
    relevance: number;
    content: string;
  }>;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        hasManualContext: data.hasManualContext,
        sources: data.sources,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const exampleQuestions = [
    "¿Cuál es la temperatura actual?",
    "¿Qué hacer si hay vibración alta?",
    "Dame los datos de voltaje de hoy",
    "¿Qué es el factor de potencia?",
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[var(--color-panel-border)] shadow-[8px_8px_20px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="relative flex items-stretch h-10 w-full">
        <div className="bg-[var(--green-dark)] text-white h-10 flex items-center border-b-4 border-gray-400 w-4/5 px-4">
          <Brain className="w-5 h-5 mr-2" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider leading-none">
              Asistente Inteligente
            </h3>
            <p className="text-xs text-gray-200">Manuales + Datos en Tiempo Real</p>
          </div>
        </div>
        <div className="-ml-px h-10 w-10 bg-[var(--green-dark)] border-b-4 border-r-4 border-gray-400 rounded-br-[9999px]" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-[var(--green-dark)]" />
            <p className="text-lg mb-2 font-bold text-gray-800">Hola, soy tu asistente inteligente. Puedo ayudarte con:</p>
            <div className="text-left max-w-md mx-auto mb-4 space-y-2">
              <p className="text-sm text-gray-700">📚 <strong>Consultas técnicas</strong> sobre equipos (manuales, procedimientos, troubleshooting)</p>
              <p className="text-sm text-gray-700">📊 <strong>Análisis de datos</strong> de telemetría (temperaturas, voltajes, potencia, etc.)</p>
            </div>
            <p className="text-sm mb-4 font-semibold text-gray-600">¿En qué puedo ayudarte hoy?</p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-xs bg-white hover:bg-[var(--green-dark)] hover:text-white border border-gray-200 px-3 py-2 rounded-lg text-left transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 shadow-md ${
                msg.role === 'user'
                  ? 'bg-[var(--green-dark)] text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

              {/* Source Badge */}
              {msg.role === 'assistant' && (
                <div className="mt-2 flex items-center gap-2">
                  {msg.hasManualContext ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <BookOpen className="w-3 h-3" />
                      Basado en Manuales
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <Brain className="w-3 h-3" />
                      IA General
                    </span>
                  )}
                </div>
              )}

              {/* Sources Expander */}
              {msg.sources && msg.sources.length > 0 && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-semibold">
                    📚 Ver fuentes ({msg.sources.length})
                  </summary>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {msg.sources.map((source, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded border border-gray-200">
                        <p className="font-semibold text-gray-800">{source.source}</p>
                        <p className="text-gray-500 mt-1">
                          Relevancia: {(source.relevance * 100).toFixed(0)}%
                        </p>
                        <p className="mt-1 text-gray-700 text-xs">
                          {source.content.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2 shadow-md">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--green-dark)]" />
              <span className="text-sm text-gray-600">Pensando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-dark)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[var(--green-dark)] text-white px-4 py-2 rounded-lg hover:bg-[var(--green-light)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Presiona Enter para enviar • Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
