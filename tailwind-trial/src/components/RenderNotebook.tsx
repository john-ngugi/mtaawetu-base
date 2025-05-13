// import React, { useState, useEffect } from 'react';
// import { ArrowLeft, FileText, Search, Loader, X } from 'lucide-react';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { github } from 'react-syntax-highlighter/dist/esm/styles/prism';

// // Simplified interface for notebooks
// interface SimpleNotebookItem {
//   id: string;
//   title: string;
//   source: string; // The actual notebook content as JSON string
// }

// // Component to display simplified notebook list
// const SimpleNotebookList = ({
//   notebooks,
//   onNotebookSelect,
//   isLoading
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredNotebooks, setFilteredNotebooks] = useState([]);

//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       setFilteredNotebooks(notebooks);
//       return;
//     }

//     const filtered = notebooks.filter(notebook =>
//       notebook.title.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     setFilteredNotebooks(filtered);
//   }, [notebooks, searchTerm]);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-full">
//         <div className="flex flex-col items-center">
//           <Loader className="animate-spin h-8 w-8 text-blue-600 mb-4" />
//           <p className="text-gray-600">Loading notebooks...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full flex flex-col">
//       <div className="p-4 bg-white border-b border-gray-200">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//           <input
//             type="text"
//             placeholder="Search notebooks..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm('')}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//             >
//               <X size={16} />
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
//         <h1 className="text-2xl font-bold mb-6 text-blue-800">Notebooks</h1>

//         {filteredNotebooks.length === 0 ? (
//           <div className="text-center py-10">
//             <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <p className="text-gray-500 text-lg">No notebooks found</p>
//             {searchTerm && (
//               <p className="text-gray-400 mt-2">
//                 Try using different search terms
//               </p>
//             )}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredNotebooks.map((notebook) => (
//               <div
//                 key={notebook.id}
//                 className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 cursor-pointer"
//                 onClick={() => onNotebookSelect(notebook)}
//               >
//                 <div className="h-32 bg-blue-50 flex items-center justify-center border-b border-gray-200">
//                   <FileText className="h-12 w-12 text-blue-400" />
//                 </div>
//                 <div className="p-4">
//                   <h3 className="font-semibold text-lg text-blue-800 mb-2 line-clamp-1">{notebook.title}</h3>
//                   <div className="text-gray-600 text-sm mb-3 line-clamp-2">
//                     Notebook ID: {notebook.id}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Cell renderer components - reused from original
// const CodeCell = ({ cell }) => {
//   return (
//     <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
//       <div className="bg-gray-100 px-4 py-1 text-xs text-gray-600 border-b border-gray-200">
//         Code
//       </div>
//       <SyntaxHighlighter
//         language="python"
//         style={github}
//         customStyle={{margin: 0, padding: '1rem'}}
//       >
//         {Array.isArray(cell.source) ? cell.source.join('') : cell.source}
//       </SyntaxHighlighter>

//       {cell.outputs && cell.outputs.length > 0 && (
//         <div className="border-t border-gray-200">
//           <div className="bg-gray-50 px-4 py-1 text-xs text-gray-600 border-b border-gray-200">
//             Output
//           </div>
//           <div className="p-4 overflow-x-auto">
//             {cell.outputs.map((output, i) => {
//               if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
//                 if (output.data && output.data['text/html']) {
//                   return (
//                     <div
//                       key={i}
//                       dangerouslySetInnerHTML={{
//                         __html: Array.isArray(output.data['text/html'])
//                           ? output.data['text/html'].join('')
//                           : output.data['text/html']
//                       }}
//                     />
//                   );
//                 } else if (output.data && output.data['text/plain']) {
//                   return (
//                     <pre key={i} className="whitespace-pre-wrap text-sm">
//                       {Array.isArray(output.data['text/plain'])
//                         ? output.data['text/plain'].join('')
//                         : output.data['text/plain']}
//                     </pre>
//                   );
//                 }
//               } else if (output.output_type === 'stream') {
//                 return (
//                   <pre key={i} className="whitespace-pre-wrap text-sm">
//                     {Array.isArray(output.text) ? output.text.join('') : output.text}
//                   </pre>
//                 );
//               }
//               return null;
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const MarkdownCell = ({ cell }) => {
//   const [html, setHtml] = useState('');

//   useEffect(() => {
//     // Simple markdown parsing for demonstration
//     const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
//     const formatted = source
//       .split('\n\n')
//       .map(p => p.startsWith('#')
//         ? `<h${p.match(/^#+/)[0].length}>${p.replace(/^#+\s/, '')}</h${p.match(/^#+/)[0].length}>`
//         : `<p>${p}</p>`)
//       .join('');

//     setHtml(formatted);
//   }, [cell.source]);

//   return (
//     <div className="mb-4 px-4 py-2">
//       <div
//         className="prose max-w-none"
//         dangerouslySetInnerHTML={{ __html: html }}
//       />
//     </div>
//   );
// };

// // Simplified NotebookViewer component
// const SimpleNotebookViewer = ({ notebook, onBack }) => {
//   const [notebookContent, setNotebookContent] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const parseNotebookContent = () => {
//       setIsLoading(true);
//       try {
//         // Parse the source string to JSON
//         const data = JSON.parse(notebook.source);
//         setNotebookContent(data);
//       } catch (err) {
//         console.error('Error parsing notebook:', err);
//         setError(err.message || 'Failed to parse notebook');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     parseNotebookContent();
//   }, [notebook.source]);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-full">
//         <div className="flex flex-col items-center">
//           <Loader className="animate-spin h-8 w-8 text-blue-600 mb-4" />
//           <p className="text-gray-600">Loading notebook...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col h-full">
//         <div className="bg-white border-b border-gray-200 p-4 flex items-center">
//           <button
//             onClick={onBack}
//             className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <h2 className="text-xl font-semibold text-red-600">Error</h2>
//         </div>
//         <div className="flex-1 flex items-center justify-center p-8">
//           <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-lg">
//             <h3 className="text-lg font-medium mb-2">Failed to load notebook</h3>
//             <p>{error}</p>
//             <button
//               onClick={onBack}
//               className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
//             >
//               Back to notebook list
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full">
//       <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
//         <div className="flex items-center">
//           <button
//             onClick={onBack}
//             className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
//             aria-label="Back to notebook list"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <h2 className="text-xl font-semibold truncate">{notebook.title}</h2>
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto bg-white p-6">
//         {notebookContent && (
//           <div className="max-w-4xl mx-auto">
//             <div className="mb-8">
//               <h1 className="text-2xl font-bold text-blue-800 mb-2">{notebook.title}</h1>
//             </div>

//             <div className="border-t border-gray-200 pt-6">
//               {notebookContent.cells.map((cell, index) => {
//                 if (cell.cell_type === 'code') {
//                   return <CodeCell key={index} cell={cell} />;
//                 } else if (cell.cell_type === 'markdown') {
//                   return <MarkdownCell key={index} cell={cell} />;
//                 }
//                 return null;
//               })}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Main SimpleNotebookManager component
// const SimpleNotebookManager = () => {
//   const [notebooks, setNotebooks] = useState([]);
//   const [selectedNotebook, setSelectedNotebook] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchNotebooks();
//   }, []);

//   const fetchNotebooks = async () => {
//     setIsLoading(true);
//     try {
//       // Replace with your API endpoint
//       const response = await fetch('/api/simple-notebooks/');
//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }
//       const data = await response.json();
//       setNotebooks(data);
//     } catch (err) {
//       console.error('Error fetching notebooks:', err);
//       setError(err.message || 'Failed to load notebooks');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-full p-8">
//         <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-lg">
//           <h3 className="text-lg font-medium mb-2">Error loading notebooks</h3>
//           <p>{error}</p>
//           <button
//             onClick={fetchNotebooks}
//             className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full">
//       {selectedNotebook ? (
//         <SimpleNotebookViewer
//           notebook={selectedNotebook}
//           onBack={() => setSelectedNotebook(null)}
//         />
//       ) : (
//         <SimpleNotebookList
//           notebooks={notebooks}
//           onNotebookSelect={setSelectedNotebook}
//           isLoading={isLoading}
//         />
//       )}
//     </div>
//   );
// };

// export default SimpleNotebookManager;
