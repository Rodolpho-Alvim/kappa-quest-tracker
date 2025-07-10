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
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar itens..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
);
