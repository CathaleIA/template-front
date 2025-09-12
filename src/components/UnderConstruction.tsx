// components/UnderConstruction.jsx

import React from 'react';

export default function UnderConstruction({ message = "Esta página está en construcción" }) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 text-center px-4 py-12 h-[calc(100svh-var(--header-height))]!">
      {/* SVG de construcción */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-muted-foreground"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-400 mb-2">
        En Construcción
      </h1>

      {/* Subtítulo personalizable */}
      <p className="text-muted-foreground max-w-md leading-relaxed">
        {message}
      </p>
    </div>
  );
}