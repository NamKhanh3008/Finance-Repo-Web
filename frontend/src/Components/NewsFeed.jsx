// src/Components/NewsFeed.jsx
import React from "react";
import { ExternalLink, Calendar } from "lucide-react";

function NewsFeed({ news }) {
  if (!news || news.length === 0) {
    return <div className="text-gray-500 text-xs italic mt-2">No recent news found.</div>;
  }

  return (
    <div className="flex flex-col gap-4 mt-2">
      {news.map((article, index) => (
        <a 
          key={article.id || index} 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer" // Security best practice
          className="group flex gap-3 p-2 rounded-md hover:bg-gray-800 transition border border-transparent hover:border-gray-700 cursor-pointer relative"
        >
          {/* THUMBNAIL */}
          <div className="shrink-0 w-20 h-14 bg-gray-700 rounded overflow-hidden">
             {article.thumbnail ? (
               <img 
                 src={article.thumbnail} 
                 alt="news thumb" 
                 className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] bg-gray-700">
                 N/A
               </div>
             )}
          </div>

          {/* TEXT CONTENT */}
          <div className="flex flex-col justify-between min-w-0 flex-1">
             <h4 className="text-xs font-medium text-gray-200 leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
               {article.title || "No Title Available"}
             </h4>
             
             <div className="flex items-center gap-3 mt-1">
               <span className="text-[9px] text-blue-300 font-bold uppercase tracking-wider truncate max-w-[80px]">
                 {article.publisher}
               </span>
               <div className="flex items-center gap-1 text-[9px] text-gray-500 ml-auto">
                 <Calendar size={8} />
                 <span>{article.date}</span>
               </div>
             </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default NewsFeed;