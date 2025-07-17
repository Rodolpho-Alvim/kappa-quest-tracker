import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

interface HideoutSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const HideoutSearch: React.FC<HideoutSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Buscar estações ou itens..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default HideoutSearch;
