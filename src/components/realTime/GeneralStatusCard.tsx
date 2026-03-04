'use client';
import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

type Props = {
  activa: number;
  reactiva: number;
  aparente: number;
  fp: number; // porcentaje (no lo usaremos ahora porque será dinámico)
};

export default function GeneralStatusCard({ activa, reactiva, aparente }: Props) {

  const [factorPotencia, setFactorPotencia] = useState<number>(0.89);

  useEffect(() => {
    const generarValor = () => {
      const min = 0.89;
      const max = 0.91;
      const valor = Math.random() * (max - min) + min;
      setFactorPotencia(valor);
    };

    // Generar uno inicial diferente
    generarValor();

    const interval = setInterval(() => {
      generarValor();
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" /> INDICADORES DE POTENCIA
      </h2>

      <div className="grid grid-cols-4 gap-y-2 text-center">

        {/* ---------- TITULOS ---------- */}
        <p className="text-sm font-semibold text-gray-800">Potencia Activa</p>
        <p className="text-sm font-semibold text-gray-800">Potencia Reactiva</p>
        <p className="text-sm font-semibold text-gray-800">Potencia Aparente</p>
        <p className="text-sm font-semibold text-gray-800">Factor de poder</p>

        {/* ---------- VALORES ---------- */}
        <h3 className="text-3xl font-bold text-gray-900">{activa.toFixed(0)}</h3>
        <h3 className="text-3xl font-bold text-gray-900">{reactiva.toFixed(0)}</h3>
        <h3 className="text-3xl font-bold text-gray-900">{aparente.toFixed(0)}</h3>
        <h3 className="text-3xl font-bold text-gray-900">
          {factorPotencia.toFixed(2)}
        </h3>

        {/* ---------- UNIDADES ---------- */}
        <span className="text-sm font-medium text-gray-700">kW</span>
        <span className="text-sm font-medium text-gray-700">kVAr</span>
        <span className="text-sm font-medium text-gray-700">kVA</span>
        <span className="text-sm font-medium text-gray-700"></span>
      </div>
    </>
  );
}