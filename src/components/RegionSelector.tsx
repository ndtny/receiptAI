"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Region, FieldType } from "@/types";

interface Props {
  imageSrc: string;
  onRegionSelected: (region: Region, fieldType: FieldType) => void;
  activeField: FieldType | null;
}

export default function RegionSelector({
  imageSrc,
  onRegionSelected,
  activeField,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // PLACEHOLDER_DRAW_IMAGE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;
      const maxW = container.clientWidth;
      const scale = Math.min(1, maxW / img.width);
      const w = img.width * scale;
      const h = img.height * scale;
      canvas.width = w;
      canvas.height = h;
      setImgSize({ width: img.width, height: img.height });
      ctx.drawImage(img, 0, 0, w, h);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!activeField) return;
      e.preventDefault();
      const pos = getPos(e);
      setStart(pos);
      setCurrent(pos);
      setDrawing(true);
    },
    [activeField, getPos]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing) return;
      e.preventDefault();
      setCurrent(getPos(e));

      // Redraw
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.src = imageSrc;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pos = getPos(e);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      const rx = start.x;
      const ry = start.y;
      const rw = pos.x - start.x;
      const rh = pos.y - start.y;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
    },
    [drawing, imageSrc, start, getPos]
  );

  const handleEnd = useCallback(() => {
    if (!drawing || !activeField) return;
    setDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = imgSize.width / canvas.width;
    const scaleY = imgSize.height / canvas.height;

    const x = Math.min(start.x, current.x) * scaleX;
    const y = Math.min(start.y, current.y) * scaleY;
    const width = Math.abs(current.x - start.x) * scaleX;
    const height = Math.abs(current.y - start.y) * scaleY;

    if (width < 5 || height < 5) return;

    const region: Region = {
      x: x / imgSize.width,
      y: y / imgSize.height,
      width: width / imgSize.width,
      height: height / imgSize.height,
    };

    onRegionSelected(region, activeField);
  }, [drawing, activeField, start, current, imgSize, onRegionSelected]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-lg border">
      {activeField && (
        <div className="bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Draw a box around the <strong>{activeField}</strong> field
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full ${activeField ? "cursor-crosshair" : ""}`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  );
}
