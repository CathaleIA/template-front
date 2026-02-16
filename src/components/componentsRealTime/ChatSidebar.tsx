'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ChevronRight, Send, Bot, User, Loader2, BookOpen, BarChart3, Sparkles, AlertTriangle } from 'lucide-react';
import { useIoTData } from '@/context/IoTDataContext';
import { INDUSTRIAL_THRESHOLDS } from '@/config/thresholds';
import { getNumericValue } from '@/types/iot.types';

// Simple markdown renderer for chat messages
function renderMarkdown(text: string) {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc ml-4 my-2">$&</ul>')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotifiedAlarms, setHasNotifiedAlarms] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: iotData } = useIoTData();

  // Función para detectar alarmas activas basadas en las reglas de AWS
  const getActiveAlarms = () => {
    if (!iotData?.data) return [];

    const alarms = [];
    const rules = INDUSTRIAL_THRESHOLDS.ALARM_RULES;

    for (const rule of rules) {
      // Helper para obtener valor anidado similar a la Lambda
      const getValue = (obj: any, path: string) => {
        return path.split('.').reduce((curr, key) => curr?.[key], obj);
      };

      const val = getValue(iotData, rule.path);
      if (val === undefined || val === null) continue;

      let violates = false;
      const numVal = typeof val === 'object' && 'value' in val ? val.value : val;

      switch (rule.operator) {
        case '>': violates = numVal > rule.threshold; break;
        case '<': violates = numVal < rule.threshold; break;
        case '==': violates = numVal === rule.threshold; break;
      }

      if (violates) {
        alarms.push({ ...rule, currentVal: numVal });
      }
    }
    return alarms;
  };

  const activeAlarms = getActiveAlarms();
  const hasAlarms = activeAlarms.length > 0;

  // Auto-diagnóstico al abrir el chat
  useEffect(() => {
    if (isOpen && hasAlarms && !hasNotifiedAlarms) {
      const alarmList = activeAlarms.map(a =>
        `- **${a.id}**: ${a.currentVal} (Umbral ${a.operator} ${a.threshold}) - ${a.message}`
      ).join('\n');

      const diagnosisMessage: Message = {
        role: 'assistant',
        content: `⚠️ **¡ATENCIÓN! ANOMALÍA DETECTADA**\n\nHe detectado que las siguientes variables están fuera de los umbrales de seguridad operativos:\n\n${alarmList}\n\n¿Deseas que profundice en el análisis de alguna de estas variables?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, diagnosisMessage]);
      setHasNotifiedAlarms(true);
    }
  }, [isOpen, hasAlarms, hasNotifiedAlarms, activeAlarms]);

  // Resetear notificación si las alarmas desaparecen por un tiempo (opcional)
  useEffect(() => {
    if (!hasAlarms) {
      setHasNotifiedAlarms(false);
    }
  }, [hasAlarms]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);
    setIsLoading(true);

    try {
      // Paso 1: Iniciar el job
      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer || `Error: ${data.error}`,
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }

      // Si no devuelve jobId, es una respuesta directa (backward compatibility)
      if (!data.jobId) {
        const responseText = typeof data === 'string'
          ? data
          : (data.answer || data.response || 'Lo siento, no pude encontrar una respuesta.');

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: responseText,
          sources: data.sources,
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }

      // Paso 2: Polling - consultar estado cada 2 segundos
      const jobId = data.jobId;
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/agent-chat?jobId=${jobId}`);
          const jobData = await statusResponse.json();

          if (jobData.status === 'completed') {
            clearInterval(pollInterval);
            setIsLoading(false);

            setMessages(prev => [...prev, {
              role: 'assistant',
              content: jobData.result?.answer || 'Respuesta recibida.',
              sources: jobData.result?.sources,
              timestamp: new Date()
            }]);
          } else if (jobData.status === 'error') {
            clearInterval(pollInterval);
            setIsLoading(false);

            setMessages(prev => [...prev, {
              role: 'assistant',
              content: jobData.result?.answer || 'Hubo un error al procesar tu consulta.',
              timestamp: new Date()
            }]);
          }
          // Si status es 'pending' o 'processing', continuar esperando
        } catch (pollError) {
          console.error('Error polling job status:', pollError);
          clearInterval(pollInterval);
          setIsLoading(false);

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Error al verificar el estado de la consulta. Por favor intenta de nuevo.',
            timestamp: new Date()
          }]);
        }
      }, 2000); // Poll cada 2 segundos

      // Timeout de seguridad (2 minutos)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isLoading) {
          setIsLoading(false);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'La consulta tardó demasiado. Por favor intenta de nuevo.',
            timestamp: new Date()
          }]);
        }
      }, 120000);

    } catch (error: any) {
      console.error('Error querying agent:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hubo un error técnico al conectar con el servidor. Por favor intenta de nuevo.',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const exampleQuestions = [
    '¿Cuál es la potencia actual del generador?',
    '¿Hay alguna alerta de temperatura?',
    '¿Cuál es el voltaje en L1?',
    'Dame un resumen del estado del sistema',
  ];

  // Botón flotante cuando está cerrado
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 text-white p-3 rounded-l-lg shadow-lg transition-all z-[9999] group 
          ${hasAlarms
            ? 'bg-red-600 animate-[pulse_2s_infinite]'
            : 'bg-[var(--green-dark)] hover:brightness-110'}`}
        title={hasAlarms ? "¡Alerta en el sistema!" : "Abrir Asistente IA"}
      >
        <style jsx>{`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          }
        `}</style>
        {hasAlarms ? <AlertTriangle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        <span className="absolute right-full mr-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {hasAlarms ? '⚠️ Alarmas detectadas' : 'Asistente IA'}
        </span>
      </button>
    );
  }

  return (
    <aside className={`fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 bg-background flex flex-col shadow-2xl z-[9999] border-l transition-colors duration-300
      ${hasAlarms ? 'border-red-500/50' : 'border-border'}`}>
      {/* Header */}
      <div className={`${hasAlarms ? 'bg-red-700' : 'bg-[var(--green-dark)]'} text-white p-4 flex items-center justify-between transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            {hasAlarms ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-semibold text-sm">{hasAlarms ? 'Diagnóstico Crítico' : 'Asistente IA'}</h2>
            <p className="text-xs opacity-80">{hasAlarms ? `${activeAlarms.length} Alertas Activas` : 'Bedrock Agent + Tiempo Real'}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="hover:bg-white/10 p-2 rounded-lg transition-colors"
          title="Cerrar panel"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <div className="text-center mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-[var(--green-dark)] dark:text-[var(--green-medium)]" />
            <p className="text-sm font-semibold text-foreground mb-2">¡Hola! Soy tu asistente IA</p>
            <p className="text-xs text-muted-foreground mb-4">
              Puedo ayudarte con consultas técnicas y análisis de datos usando AWS Bedrock
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground/60 mb-2">Preguntas sugeridas:</p>
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="w-full text-left bg-card border border-border rounded-lg p-3 hover:border-[var(--green-dark)] hover:bg-[var(--green-dark)]/5 transition-all text-xs text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--green-dark)] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user'
                ? 'bg-[var(--green-dark)] text-white'
                : 'bg-card text-foreground border border-border shadow-sm'
                }`}>
                <div
                  className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />

                <span className="text-xs opacity-60 mt-2 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Sources Citation adapted for both modes */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-[10px] font-semibold opacity-70 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Fuentes:
                    </p>
                    <div className="space-y-1">
                      {msg.sources.map((source: any, i: number) => (
                        <div key={i} className="text-[10px] bg-muted p-1 rounded text-muted-foreground">
                          {source.source || source.doc || source.text || 'Documento técnico'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--green-dark)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 text-[var(--green-dark)] animate-spin" />
              <span className="text-sm text-muted-foreground">Procesando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-[var(--green-dark)] focus:ring-1 focus:ring-[var(--green-dark)] text-sm text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-lg transition-colors ${input.trim() && !isLoading
              ? 'bg-[var(--green-dark)] text-white hover:bg-[var(--green-medium)]'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-muted-foreground/60 mt-2 text-center">
          Presiona Enter para enviar
        </p>
      </div>
    </aside>
  );
}
