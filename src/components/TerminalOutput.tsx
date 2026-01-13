import { useRef } from 'react';
import AnsiToHtml from 'ansi-to-html';

interface TerminalOutputProps {
  content: string;
  className?: string;
}

export function TerminalOutput({ content, className = '' }: TerminalOutputProps) {
  const converter = useRef(new AnsiToHtml({
    fg: '#fff',
    bg: '#0f0f0f',
    newline: true,
    escapeXML: true,
    stream: false,
  }));

  const htmlContent = converter.current.toHtml(content);

  return (
    <div 
      className={`bg-dark-bg border border-gray-800 rounded-lg p-4 overflow-auto font-mono text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    />
  );
}
