import React, { useMemo } from 'react';
import katex from 'katex';

interface MathEquationProps {
  math: string;
  display?: boolean;
  className?: string;
}

export const MathEquation: React.FC<MathEquationProps> = ({ math, display = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: false
      });
    } catch (e) {
      return `<span class="text-rose-400 font-mono text-xs">${math}</span>`;
    }
  }, [math, display]);

  return (
    <span 
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};
