"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  LayoutGrid,
  Rows3,
  Columns3,
  CircleDot,
  Download,
  Image as ImageIcon,
  FileCode2,
  FileText,
} from "lucide-react";
import type { TreeLayout } from "@/types/family-tree";

interface TreeControlsProps {
  layout: TreeLayout;
  onLayoutChange: (layout: TreeLayout) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
}

const layoutOptions: {
  value: TreeLayout;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "vertical", label: "Vertical", icon: Rows3 },
  { value: "horizontal", label: "Horizontal", icon: Columns3 },
  { value: "radial", label: "Radial", icon: CircleDot },
];

export function TreeControls({
  layout,
  onLayoutChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  isFullscreen,
  onToggleFullscreen,
  onExportPng,
  onExportSvg,
  onExportPdf,
}: TreeControlsProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1.5 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl p-1.5 shadow-xl">
        {/* Zoom controls */}
        <ControlButton icon={ZoomIn} label="Zoom In" onClick={onZoomIn} />
        <ControlButton icon={ZoomOut} label="Zoom Out" onClick={onZoomOut} />
        <ControlButton
          icon={RotateCcw}
          label="Fit to Screen"
          onClick={onFitToScreen}
        />

        <div className="mx-1 border-t border-border/40" />

        {/* Layout picker */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">Layout</TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            side="left"
            align="center"
            className="min-w-[140px]"
          >
            {layoutOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onLayoutChange(opt.value)}
                className={layout === opt.value ? "bg-accent" : ""}
              >
                <opt.icon className="h-4 w-4 mr-2" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">Export Tree</TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            side="left"
            align="end"
            className="min-w-[140px]"
          >
            <DropdownMenuItem onClick={onExportPng}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportSvg}>
              <FileCode2 className="h-4 w-4 mr-2" />
              Export as SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 border-t border-border/40" />

        {/* Fullscreen */}
        <ControlButton
          icon={isFullscreen ? Minimize2 : Maximize2}
          label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={onToggleFullscreen}
        />
      </div>
    </TooltipProvider>
  );
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200"
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
