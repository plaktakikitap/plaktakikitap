"use client";

import dynamic from "next/dynamic";
import { HardcoverBookShell } from "./HardcoverBookShell";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

export const DEFAULT_PAGE_WIDTH = 500;
export const DEFAULT_PAGE_HEIGHT = 700;

interface PlannerBookProps {
  children: React.ReactNode;
  pageWidth?: number;
  pageHeight?: number;
  startPage?: number;
  onFlip?: (page: number) => void;
  onChangeState?: (state: string) => void;
  className?: string;
}

/**
 * Wraps HTMLFlipBook inside HardcoverBookShell.
 * Fixed page size; cover overhang visible around all inner pages.
 */
export function PlannerBook({
  children,
  pageWidth = DEFAULT_PAGE_WIDTH,
  pageHeight = DEFAULT_PAGE_HEIGHT,
  startPage = 0,
  onFlip,
  onChangeState,
  className = "",
}: PlannerBookProps) {
  const spreadWidth = pageWidth * 2;
  const spreadHeight = pageHeight;
  const pageSize = { width: pageWidth, height: pageHeight };

  return (
    <HardcoverBookShell spreadWidth={spreadWidth} spreadHeight={spreadHeight}>
      <div
        className={`relative h-full w-full overflow-hidden rounded-md ${className}`}
        style={{
          perspective: "2200px",
          transformStyle: "preserve-3d",
        }}
      >
        <HTMLFlipBook
          width={pageSize.width}
          height={pageSize.height}
          size="fixed"
          style={{}}
          startZIndex={0}
          autoSize={false}
          minWidth={pageWidth}
          maxWidth={pageWidth}
          minHeight={pageHeight}
          maxHeight={pageHeight}
          usePortrait={false}
          showCover={true}
          mobileScrollSupport
          maxShadowOpacity={0.4}
          drawShadow
          flippingTime={650}
          startPage={startPage}
          clickEventForward
          useMouseEvents
          swipeDistance={25}
          showPageCorners
          disableFlipByClick={false}
          onFlip={(e: { data: number }) => onFlip?.(e.data)}
          onChangeState={(e: { data: string }) => onChangeState?.(e.data)}
          className="bg-transparent ajanda-flipbook"
        >
          {children}
        </HTMLFlipBook>
      </div>
    </HardcoverBookShell>
  );
}
