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
      return { x: clientX - rect.left, y: clientY - rect.top };
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

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.src = imageSrc;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pos = getPos(e);
      const rx = start.x;
      const ry = start.y;
      const rw = pos.x - start.x;
      const rh = pos.y - start.y;

      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      const radius = 4;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, radius);
      ctx.stroke();
      ctx.setLineDash([]);

      // Field label
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
      const labelX = Math.min(rx, rx + rw);
      const labelY = Math.min(ry, ry + rh) - 4;
      if (activeField) ctx.fillText(activeField, labelX, labelY);
    },
    [drawing, imageSrc, start, getPos, activeField]
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
    <div ref={containerRef} className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm animate-fade-in">
      {activeField ? (
        <div className="bg-blue-50 px-4 py-2.5 text-sm text-blue-700 flex items-center gap-2 border-b border-blue-100">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
          </svg>
          Draw a box around the <strong className="mx-1">{activeField}</strong> field
        </div>
      ) : (
        <div className="bg-gray-50 px-4 py-2.5 text-sm text-gray-500 flex items-center gap-2 border-b border-gray-100">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
          </svg>
          Select a field on the right, then draw a region on the image
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
