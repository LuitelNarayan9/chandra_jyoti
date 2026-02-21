"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import type { TreeFilter } from "@/types/family-tree";

interface TreeFiltersProps {
  filter: TreeFilter;
  onFilterChange: (filter: TreeFilter) => void;
  clans: string[];
  generations: number[];
  totalCount: number;
  matchCount: number;
}

export function TreeFilters({
  filter,
  onFilterChange,
  clans,
  generations,
  totalCount,
  matchCount,
}: TreeFiltersProps) {
  const hasActiveFilter =
    filter.clan ||
    filter.generation !== null ||
    filter.gender ||
    !filter.showLiving ||
    !filter.showDeceased;

  const resetFilters = () => {
    onFilterChange({
      ...filter,
      clan: null,
      generation: null,
      gender: null,
      showLiving: true,
      showDeceased: true,
    });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap px-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Filters</span>
      </div>

      {/* Clan */}
      <Select
        value={filter.clan ?? "__all__"}
        onValueChange={(v) =>
          onFilterChange({ ...filter, clan: v === "__all__" ? null : v })
        }
      >
        <SelectTrigger className="h-8 w-[140px] text-xs rounded-lg border-border/50 bg-background/60 backdrop-blur-sm">
          <SelectValue placeholder="All Clans" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Clans</SelectItem>
          {clans.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Generation */}
      <Select
        value={
          filter.generation !== null ? String(filter.generation) : "__all__"
        }
        onValueChange={(v) =>
          onFilterChange({
            ...filter,
            generation: v === "__all__" ? null : Number(v),
          })
        }
      >
        <SelectTrigger className="h-8 w-[130px] text-xs rounded-lg border-border/50 bg-background/60 backdrop-blur-sm">
          <SelectValue placeholder="All Generations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Generations</SelectItem>
          {generations.map((g) => (
            <SelectItem key={g} value={String(g)}>
              Gen {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Gender */}
      <Select
        value={filter.gender ?? "__all__"}
        onValueChange={(v) =>
          onFilterChange({
            ...filter,
            gender: v === "__all__" ? null : (v as "MALE" | "FEMALE" | "OTHER"),
          })
        }
      >
        <SelectTrigger className="h-8 w-[110px] text-xs rounded-lg border-border/50 bg-background/60 backdrop-blur-sm">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Gender</SelectItem>
          <SelectItem value="MALE">Male</SelectItem>
          <SelectItem value="FEMALE">Female</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-5 w-px bg-border/40 mx-1" />

      {/* Living/Deceased toggles */}
      <div className="flex items-center gap-1.5">
        <Switch
          id="show-living"
          checked={filter.showLiving}
          onCheckedChange={(v) => onFilterChange({ ...filter, showLiving: v })}
          className="scale-75"
        />
        <Label htmlFor="show-living" className="text-xs cursor-pointer">
          Living
        </Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch
          id="show-deceased"
          checked={filter.showDeceased}
          onCheckedChange={(v) =>
            onFilterChange({ ...filter, showDeceased: v })
          }
          className="scale-75"
        />
        <Label htmlFor="show-deceased" className="text-xs cursor-pointer">
          Deceased
        </Label>
      </div>

      {hasActiveFilter && (
        <>
          <div className="h-5 w-px bg-border/40 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={resetFilters}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {matchCount} / {totalCount}
          </span>
        </>
      )}
    </div>
  );
}
