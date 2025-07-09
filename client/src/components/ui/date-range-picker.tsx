import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerWithRangeProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DatePickerWithRange({
  selected,
  onSelect,
  className,
  placeholder = "Selecione um período"
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected?.from ? (
              selected.to ? (
                <>
                  {format(selected.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(selected.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(selected.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <input
                type="date"
                value={selected?.from ? format(selected.from, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const newFrom = e.target.value ? new Date(e.target.value) : undefined;
                  onSelect({ from: newFrom, to: selected?.to });
                }}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <input
                type="date"
                value={selected?.to ? format(selected.to, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const newTo = e.target.value ? new Date(e.target.value) : undefined;
                  onSelect({ from: selected?.from, to: newTo });
                }}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full"
              size="sm"
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}