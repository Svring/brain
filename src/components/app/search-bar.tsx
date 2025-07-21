"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDisclosure } from "@reactuses/core";

interface SearchBarProps {
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  onSearchChange,
  placeholder = "Search...",
  className = "relative w-full max-w-md",
}: SearchBarProps) {
  const {
    isOpen: isSearchOpen,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
  } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleBlur = () => {
    if (!searchTerm) {
      onSearchClose();
    }
  };

  return (
    <div className={className}>
      {isSearchOpen ? (
        <Input
          ref={searchInputRef}
          className="h-9 w-full"
          onChange={(e) => handleSearchChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          value={searchTerm}
        />
      ) : (
        <Button variant="ghost" onClick={onSearchOpen}>
          <Search />
        </Button>
      )}
    </div>
  );
}