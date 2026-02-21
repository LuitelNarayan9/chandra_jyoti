import { jsPDF } from "jspdf";
import * as d3 from "d3";

interface ExportOptions {
  svg: SVGSVGElement;
  g: SVGGElement;
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;
  fileName?: string;
  isDark: boolean;
}

async function prepareForExport({
  svg,
  g,
  zoomBehavior,
  isDark,
}: ExportOptions) {
  // Save current transform
  const currentTransform = d3.zoomTransform(svg);
  const bounds = g.getBBox();
  const padding = 60;

  const exportWidth = Math.max(bounds.width + padding * 2, 800);
  const exportHeight = Math.max(bounds.height + padding * 2, 600);

  const origStyleW = svg.style.width;
  const origStyleH = svg.style.height;
  const origAttrW = svg.getAttribute("width");
  const origAttrH = svg.getAttribute("height");
  const origViewBox = svg.getAttribute("viewBox");

  // Temporarily apply full-size dimensions and center the tree
  svg.style.width = `${exportWidth}px`;
  svg.style.height = `${exportHeight}px`;
  svg.setAttribute("width", exportWidth.toString());
  svg.setAttribute("height", exportHeight.toString());
  svg.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);

  d3.select(svg).call(
    zoomBehavior.transform,
    d3.zoomIdentity.translate(padding - bounds.x, padding - bounds.y)
  );

  // Add temporary background rect to ensure correct background colors in export
  const bg = d3
    .select(svg)
    .insert("rect", ":first-child")
    .attr("id", "temp-export-bg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", isDark ? "#18181b" : "#ffffff");

  // Await one frame to ensure DOM is updated before capturing
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    exportWidth,
    exportHeight,
    cleanup: () => {
      bg.remove();
      svg.style.width = origStyleW;
      svg.style.height = origStyleH;
      if (origAttrW) svg.setAttribute("width", origAttrW);
      else svg.removeAttribute("width");
      if (origAttrH) svg.setAttribute("height", origAttrH);
      else svg.removeAttribute("height");
      if (origViewBox) svg.setAttribute("viewBox", origViewBox);
      else svg.removeAttribute("viewBox");
      // Restore user's zoom position
      d3.select(svg).call(zoomBehavior.transform, currentTransform);
    },
  };
}

function getSvgString(svg: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svg);
  // Ensure basic namespaces are present
  if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(
      /^<svg/,
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }
  if (!svgString.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    svgString = svgString.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }
  return svgString;
}

async function svgToImageDataUrl(
  svgString: string,
  width: number,
  height: number,
  pixelRatio: number = 2,
  format: string = "image/png",
  quality: number = 0.92
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not create canvas context");

  // For JPEG, we need a white background because SVG transparency becomes black in JPEG
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.scale(pixelRatio, pixelRatio);

  const img = new Image();
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(url);
  return canvas.toDataURL(format, quality);
}

export async function exportTreeToPng(options: ExportOptions) {
  const { exportWidth, exportHeight, cleanup } = await prepareForExport(
    options
  );
  try {
    const svgString = getSvgString(options.svg);
    const dataUrl = await svgToImageDataUrl(svgString, exportWidth, exportHeight);

    const link = document.createElement("a");
    link.download = `${options.fileName || "family-tree"}.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    cleanup();
  }
}

export async function exportTreeToSvg(options: ExportOptions) {
  const { cleanup } = await prepareForExport(options);
  try {
    const svgString = getSvgString(options.svg);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.download = `${options.fileName || "family-tree"}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } finally {
    cleanup();
  }
}

export async function exportTreeToPdf(options: ExportOptions) {
  const { exportWidth, exportHeight, cleanup } = await prepareForExport(
    options
  );
  try {
    const svgString = getSvgString(options.svg);
    // Render as high-quality JPEG instead of PNG to aggressively compress PDF size
    const dataUrl = await svgToImageDataUrl(
      svgString,
      exportWidth,
      exportHeight,
      2, // Pixel ratio of 2 is crisp enough for PDF zoom without excessive memory parsing
      "image/jpeg",
      0.85
    );

    const pdf = new jsPDF({
      orientation: exportWidth > exportHeight ? "landscape" : "portrait",
      unit: "px",
      format: [exportWidth, exportHeight],
      compress: true,
    });
    pdf.addImage(dataUrl, "JPEG", 0, 0, exportWidth, exportHeight, undefined, "FAST");
    pdf.save(`${options.fileName || "family-tree"}.pdf`);
  } finally {
    cleanup();
  }
}
