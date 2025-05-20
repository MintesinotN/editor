'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Welcome to the Markdown Editor\n\nType your Markdown here and see it rendered on the right!');
  const markdownRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (markdownRef.current) {
      const text = markdownRef.current.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        // alert('Rendered text copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy text:', err);
        alert('Failed to copy text. Please try again.');
      });
    }
  };

  const handleExport = async () => {
    if (markdownRef.current) {
      try {
        // Clone the rendered Markdown content
        const clonedElement = markdownRef.current.cloneNode(true) as HTMLElement;
        // Remove Tailwind classes and apply simple RGB styles
        clonedElement.className = '';
        clonedElement.style.backgroundColor = 'rgb(255, 255, 255)';
        clonedElement.style.color = 'rgb(0, 0, 0)';
        clonedElement.style.padding = '16px';
        clonedElement.style.fontFamily = 'Inter, sans-serif';
        clonedElement.style.fontSize = '16px';
        // Remove classes from child elements to avoid oklch
        const removeClasses = (element: HTMLElement) => {
          element.className = '';
          Array.from(element.children).forEach((child) =>
            removeClasses(child as HTMLElement)
          );
        };
        removeClasses(clonedElement);

        // Append to a hidden container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.backgroundColor = 'rgb(255, 255, 255)';
        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);

        const canvas = await html2canvas(tempContainer, { scale: 2 });
        document.body.removeChild(tempContainer);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4',
        });
        const imgWidth = pdf.internal.pageSize.getWidth() - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('markdown-output.pdf');
      } catch (err) {
        console.error('Failed to export PDF:', err);
        alert('Failed to export PDF. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-md p-4 sticky top-0 z-10 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Markdown Studio</h1>
      </header>
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={handleCopy}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 shadow-md"
            >
              Copy
            </button>
            <button
              onClick={handleExport}
              className="bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 shadow-md"
            >
              Export
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <textarea
              className="w-full md:w-1/2 h-[60vh] max-h-[600px] p-6 bg-gray-800/90 border border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 transition-all duration-300 shadow-md animate-fade-in"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your Markdown here..."
            />
            <div
              ref={markdownRef}
              className="w-full md:w-1/2 h-[60vh] max-h-[600px] p-6 bg-gray-800/90 border border-gray-600 rounded-xl overflow-auto prose prose-invert prose-lg shadow-md animate-fade-in"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}