import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
}) => (
  <div className="mb-8">
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 z-10" />
        <Input
          placeholder="🔍 Buscar itens por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-4 py-4 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-xl focus:shadow-2xl transition-all duration-300 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10"
        />
        {searchTerm && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <span className="text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {searchTerm.length} caracteres
            </span>
          </div>
        )}
      </div>
      {searchTerm && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          Buscando por:{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            "{searchTerm}"
          </span>
        </p>
      )}
    </div>
  </div>
);
