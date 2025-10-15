import { useEffect, useRef } from "react";

interface RecipeDisplayProps {
  recipes: string;
}

export default function RecipeDisplay({ recipes }: RecipeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipes && containerRef.current) {
      // Smooth scroll to the bottom of the container
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [recipes]);

  const handleDownload = () => {
    const blob = new Blob([recipes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recipe-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Recipe</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                padding: 20px;
                line-height: 1.6;
                color: #374151;
              }
              pre {
                white-space: pre-wrap;
                font-family: inherit;
              }
            </style>
          </head>
          <body>
            <pre>${recipes}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (!recipes) return null;

  return (
    <div
      ref={containerRef}
      className="mt-8 p-6 bg-white border-2 border-sage-400 rounded-xl shadow-md relative"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-terracotta-600 text-center flex-1">
          🤖
        </h2>
        <div className="flex gap-2 absolute top-6 right-6">
          <button
            onClick={handleDownload}
            className="p-2 text-terracotta-600 hover:text-terracotta-700 hover:bg-cream-100 rounded-lg transition-colors"
            title="Download recipe"
            aria-label="Download recipe"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-terracotta-600 hover:text-terracotta-700 hover:bg-cream-100 rounded-lg transition-colors"
            title="Print recipe"
            aria-label="Print recipe"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
              />
            </svg>
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap leading-relaxed text-gray-700 text-base font-sans">
        {recipes}
      </pre>
    </div>
  );
}
