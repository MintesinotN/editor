'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pluggable } from 'unified';
import { EditorProps } from '@/types';
import { jsPDF } from 'jspdf';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>(`# Welcome to Markdown Editor

Type your **Markdown** here and see it rendered in real-time on the right!

## Features
- Real-time preview
- GitHub Flavored Markdown
- Modern, responsive UI
- Supports headers, lists, code blocks, and more

Try typing some Markdown below:

\`\`\`javascript
const hello = () => {
  console.log("Hello, Markdown!");
};
\`\`\`
`);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const copyToClipboard = () => {
    if (previewRef.current) {
      const htmlContent = previewRef.current.innerHTML;
      navigator.clipboard.writeText(htmlContent).then(() => {
        alert('Rich text copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard.');
      });
    }
  };

  const exportToPDF = () => {
    if (previewRef.current) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });
      doc.html(previewRef.current, {
        callback: (pdf) => {
          pdf.save('markdown-export.pdf');
        },
        x: 40,
        y: 40,
        width: 515, // A4 width in pt (595) - margins
        windowWidth: 595, // Match A4 width for consistent rendering
      });
    }
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Real-Time Markdown Editor
      </h1>
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Editor Pane */}
        <div className="w-full md:w-1/2">
          <textarea
            className="w-full h-full p-4 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
            value={markdown}
            onChange={handleChange}
            placeholder="Type your Markdown here..."
            aria-label="Markdown input"
          />
        </div>
        {/* Preview Pane */}
        <div className="w-full md:w-1/2 p-4 border rounded-lg shadow-sm bg-white overflow-auto">
          <div className="flex justify-end mb-2 gap-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              Copy
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              Export
            </button>
          </div>
          <div className="markdown-body" ref={previewRef}>
            <ReactMarkdown remarkPlugins={[remarkGfm as Pluggable]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}