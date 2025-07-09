import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  Search, Filter, X, Calendar, DollarSign, Users, 
  SlidersHorizontal, Download, RefreshCw 
} from "lucide-react";
import { DateRange } from "react-day-picker";

interface FilterState {
  search: string;
  status: string[];
  dateRange: DateRange | undefined;
  minValue: number | null;
  maxValue: number | null;
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  data: any[];
  onFilteredData: (filtered: any[]) => void;
  searchFields: string[];
  statusOptions: { value: string; label: string; color?: string }[];
  categoryField?: string;
  valueField?: string;
  dateField?: string;
  title?: string;
}

export function AdvancedFilters({
  data,
  onFilteredData,
  searchFields,
  statusOptions,
  categoryField,
  valueField,
  dateField = 'createdAt',
  title = "Filtros Avançados"
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    dateRange: undefined,
    minValue: null,
    maxValue: null,
    category: 'all',
    sortBy: dateField,
    sortOrder: 'desc'
  });

  const [isOpen, setIsOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<FilterState[]>([]);

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`filters-${title.toLowerCase().replace(/\s+/g, '-')}`);
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, [title]);

  // Extract unique categories
  const categories = useMemo(() => {
    if (!categoryField) return [];
    const unique = [...new Set(data.map(item => item[categoryField]).filter(Boolean))];
    return unique.sort();
  }, [data, categoryField]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Text search across multiple fields
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchTerm);
        })
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(item => 
        filters.status.includes(item.status)
      );
    }

    // Date range filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      result = result.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= filters.dateRange!.from! && itemDate <= filters.dateRange!.to!;
      });
    }

    // Value range filter
    if (valueField && (filters.minValue !== null || filters.maxValue !== null)) {
      result = result.filter(item => {
        const value = parseFloat(item[valueField]) || 0;
        const minOk = filters.minValue === null || value >= filters.minValue;
        const maxOk = filters.maxValue === null || value <= filters.maxValue;
        return minOk && maxOk;
      });
    }

    // Category filter
    if (filters.category !== 'all' && categoryField) {
      result = result.filter(item => item[categoryField] === filters.category);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[filters.sortBy];
      let bVal = b[filters.sortBy];

      // Handle dates
      if (filters.sortBy === dateField) {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle numbers
      if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [data, filters, searchFields, dateField, categoryField, valueField]);

  // Update parent component when filtered data changes
  useEffect(() => {
    onFilteredData(filteredData);
  }, [filteredData, onFilteredData]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: [],
      dateRange: undefined,
      minValue: null,
      maxValue: null,
      category: 'all',
      sortBy: dateField,
      sortOrder: 'desc'
    });
  };

  const saveCurrentFilter = () => {
    const filterName = prompt('Nome para este filtro:');
    if (filterName && filterName.trim()) {
      const newFilter = { ...filters, name: filterName.trim() };
      const updated = [...savedFilters, newFilter];
      setSavedFilters(updated);
      localStorage.setItem(`filters-${title.toLowerCase().replace(/\s+/g, '-')}`, JSON.stringify(updated));
    }
  };

  const loadSavedFilter = (savedFilter: FilterState) => {
    setFilters(savedFilter);
    setIsOpen(false);
  };

  const exportFilteredData = () => {
    const csvContent = [
      // Headers
      Object.keys(filteredData[0] || {}).join(','),
      // Data rows
      ...filteredData.map(item => 
        Object.values(item).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterCount = [
    filters.search,
    filters.status.length > 0,
    filters.dateRange,
    filters.minValue !== null,
    filters.maxValue !== null,
    filters.category !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Quick Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar em ${searchFields.join(', ')}...`}
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border-2 focus:border-blue-500 transition-colors"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('search', '')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
        </Dialog>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={exportFilteredData}>
          <Download className="h-4 w-4 mr-1" />
          Exportar
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="px-3 py-1">
              <Search className="h-3 w-3 mr-1" />
              "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('search', '')}
                className="ml-1 p-0 h-4 w-4"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="px-3 py-1">
              Status: {statusOptions.find(s => s.value === status)?.label || status}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('status', filters.status.filter(s => s !== status))}
                className="ml-1 p-0 h-4 w-4"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.dateRange && (
            <Badge variant="secondary" className="px-3 py-1">
              <Calendar className="h-3 w-3 mr-1" />
              {filters.dateRange.from?.toLocaleDateString()} - {filters.dateRange.to?.toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('dateRange', undefined)}
                className="ml-1 p-0 h-4 w-4"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando <strong>{filteredData.length}</strong> de <strong>{data.length}</strong> resultados
        </span>
        <div className="flex items-center gap-3">
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={dateField}>Data</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              {valueField && <SelectItem value={valueField}>Valor</SelectItem>}
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Dialog */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter('status', [...filters.status, option.value]);
                      } else {
                        updateFilter('status', filters.status.filter(s => s !== option.value));
                      }
                    }}
                  />
                  <label className="text-sm cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">Período</label>
            <DatePickerWithRange
              selected={filters.dateRange}
              onSelect={(range) => updateFilter('dateRange', range)}
            />
          </div>

          {/* Value Range */}
          {valueField && (
            <div>
              <label className="text-sm font-medium mb-3 block">Faixa de Valores</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Mínimo</label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    value={filters.minValue || ''}
                    onChange={(e) => updateFilter('minValue', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Máximo</label>
                  <Input
                    type="number"
                    placeholder="R$ 999.999,99"
                    value={filters.maxValue || ''}
                    onChange={(e) => updateFilter('maxValue', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          {categoryField && categories.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-3 block">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-3 block">Filtros Salvos</label>
              <div className="grid grid-cols-1 gap-2">
                {savedFilters.map((savedFilter, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedFilter(savedFilter)}
                    className="justify-start"
                  >
                    {(savedFilter as any).name || `Filtro ${index + 1}`}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={saveCurrentFilter}>
            Salvar Filtro Atual
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAllFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Tudo
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </div>
  );
}