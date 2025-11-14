"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  id: string | number;
  label: string;
  value: string;
}

interface VehicleAutocompleteProps {
  value: string;
  onChange: (value: string, option: AutocompleteOption | null) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
  noResultsText?: string;
  loadingText?: string;
}

export function VehicleAutocomplete({
  value,
  onChange,
  options,
  placeholder = "Buscar...",
  loading = false,
  disabled = false,
  className,
  onSearch,
  noResultsText = "No se encontraron resultados",
  loadingText = "Cargando...",
}: VehicleAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filtrar opciones basado en el input
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll automático al elemento resaltado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    onSearch?.(newValue);

    // Si el input está vacío, limpiar la selección
    if (!newValue) {
      onChange("", null);
    }
  };

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange(option.value, option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Resaltar texto coincidente
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="font-semibold bg-yellow-100 dark:bg-yellow-900">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="pl-9 pr-9"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              {loadingText}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {noResultsText}
            </div>
          ) : (
            <ul
              ref={listRef}
              className="max-h-60 overflow-y-auto py-1"
              role="listbox"
            >
              {filteredOptions.map((option, index) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={cn(
                    "px-3 py-2 cursor-pointer text-sm transition-colors",
                    highlightedIndex === index
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {highlightMatch(option.label, inputValue)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
