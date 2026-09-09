import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Paperclip,
  Share2,
  Printer
} from 'lucide-react';
import { Attachment } from '../types';
import { getAttachmentPreviewUrl } from '../utils/attachmentUtils';

interface ImageLightboxModalProps {
  attachment: Attachment | null;
  attachments?: Attachment[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  transactionTitle?: string;
  transactionNumber?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  attachment,
  attachments = [],
  currentIndex = 0,
  onIndexChange,
  transactionTitle,
  transactionNumber,
  onClose,
}) => {
  const [internalIndex, setInternalIndex] = useState<number>(currentIndex);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Touch swipe refs
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Sync internal index with currentIndex prop
  useEffect(() => {
    if (typeof currentIndex === 'number' && currentIndex >= 0) {
      setInternalIndex(currentIndex);
    }
  }, [currentIndex]);

  // Lock body scroll cleanly on mount, and restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  // Safe close handler that guarantees restoring body overflow
  const handleSafeClose = useCallback(() => {
    document.body.style.overflow = '';
    onClose();
  }, [onClose]);

  // Handle active attachment selection
  const activeAttachment = (attachments.length > 0 && attachments[internalIndex])
    ? attachments[internalIndex]
    : attachment;

  // Always compute safe previewUrl with fallback - NEVER return null
  const previewUrl = activeAttachment
    ? (activeAttachment.previewUrl || getAttachmentPreviewUrl(activeAttachment, {
        number: transactionNumber,
        subject: transactionTitle,
      }))
    : '';

  const handleNext = useCallback(() => {
    if (attachments.length <= 1) return;
    const nextIdx = (internalIndex + 1) % attachments.length;
    setInternalIndex(nextIdx);
    onIndexChange?.(nextIdx);
    setZoom(1);
    setRotation(0);
  }, [attachments.length, internalIndex, onIndexChange]);

  const handlePrev = useCallback(() => {
    if (attachments.length <= 1) return;
    const prevIdx = (internalIndex - 1 + attachments.length) % attachments.length;
    setInternalIndex(prevIdx);
    onIndexChange?.(prevIdx);
    setZoom(1);
    setRotation(0);
  }, [attachments.length, internalIndex, onIndexChange]);

  // Mobile Touch Swipe Handlers (Swipe left/right to browse attachments)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || zoom !== 1) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Must be predominantly horizontal swipe and exceed 45px threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (attachments.length > 1) {
        // In Arabic RTL: swiping right goes to previous, swiping left goes to next
        if (deltaX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  };

  // Register Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSafeClose();
      } else if (e.key === 'ArrowRight' && attachments.length > 1) {
        handlePrev();
      } else if (e.key === 'ArrowLeft' && attachments.length > 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSafeClose, handlePrev, handleNext, attachments.length]);

  if (!activeAttachment || !previewUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = activeAttachment.name || 'document_image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Instant Print
  const handlePrint = () => {
    if (!previewUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="utf-8">
            <title>${activeAttachment.name || 'طباعة كتاب رسمي'}</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; font-family: sans-serif; }
              img { max-width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${previewUrl}" onload="setTimeout(function(){ window.print(); }, 250);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Quick Share via Web Share API or Clipboard
  const handleShare = async () => {
    const title = activeAttachment.name || 'وثيقة رسمية';
    const text = `معاملة رسمية: ${transactionNumber ? `العدد: ${transactionNumber}` : ''} ${transactionTitle ? `- ${transactionTitle}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9000] w-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-stone-950/95 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 text-white animate-fadeIn select-none"
      dir="rtl"
    >
      {/* Toast feedback for copied link */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100000] px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-2xl text-xs font-bold animate-bounce">
          تم نسخ بيانات المعاملة للمشاركة بنجاح!
        </div>
      )}

      {/* FIXED TOP EXIT BUTTON - ALWAYS VISIBLE, NEVER SCROLLS AWAY */}
      <button
        type="button"
        id="btn-lightbox-fixed-exit"
        onClick={handleSafeClose}
        className="fixed top-2.5 left-2.5 sm:top-4 sm:left-4 z-[99999] inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-2xl border-2 border-white/90 transition-transform active:scale-95 cursor-pointer select-none"
        title="خروج من معاينة الصورة والعودة للسجل (Esc)"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        <span>خروج ✕</span>
      </button>

      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 border-b border-stone-800/90 pb-2 pt-1 px-1 shrink-0 pl-24 sm:pl-28">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          {transactionNumber && (
            <span className="px-2 sm:px-2.5 py-1 rounded bg-stone-800 text-amber-300 text-xs font-mono font-bold border border-stone-700 shrink-0">
              العدد: {transactionNumber}
            </span>
          )}
          <span className="px-2 py-0.5 sm:py-1 rounded bg-amber-400 text-stone-950 text-xs font-bold shrink-0">
            {activeAttachment.type}
          </span>
          <div className="truncate hidden xs:block sm:block">
            <h3 className="text-xs sm:text-sm font-bold text-stone-100 truncate max-w-[140px] sm:max-w-md">
              {activeAttachment.name}
            </h3>
          </div>
        </div>

        {/* Action Buttons (Zoom, Rotate, Reset, Download, Share, Print) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer border border-stone-700"
            title="تكبير (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer border border-stone-700"
            title="تصغير (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer border border-stone-700"
            title="تدوير 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          {(zoom !== 1 || rotation !== 0) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer border border-amber-500/40"
              title="إعادة ضبط العرض"
            >
              إعادة ضبط
            </button>
          )}

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer border border-stone-700"
            title="طباعة الوثيقة مباشرة"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Quick Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer border border-stone-700"
            title="مشاركة الوثيقة (واتساب / بريد / رابط)"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer border border-stone-700"
            title="تحميل الصورة"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">تحميل</span>
          </button>
        </div>
      </div>

      {/* Main Image Stage with Touch Swipe on Mobile */}
      <div 
        className="flex-1 flex items-center justify-center p-1 sm:p-4 overflow-hidden relative touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // If clicked outside the image itself, close
          if (e.target === e.currentTarget) {
            handleSafeClose();
          }
        }}
      >
        {/* Right Arrow: in Arabic RTL, right is previous */}
        {attachments.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500 active:text-stone-950 text-white border border-stone-700 shadow-2xl transition-all active:scale-90 cursor-pointer"
            title="المرفق السابق (أو اسحب يميناً)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* The Scaled / Rotated Image */}
        <div 
          className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={previewUrl}
            alt={activeAttachment.name}
            className="max-h-[calc(100dvh-150px)] max-w-[calc(100vw-36px)] object-contain rounded-lg shadow-2xl border border-stone-800 bg-white"
          />
        </div>

        {/* Left Arrow: in Arabic RTL, left is next */}
        {attachments.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-stone-900/90 hover:bg-stone-800 active:bg-amber-500 active:text-stone-950 text-white border border-stone-700 shadow-2xl transition-all active:scale-90 cursor-pointer"
            title="المرفق التالي (أو اسحب يساراً)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      {/* Bottom Footer with Attachments Strip & Info */}
      <div 
        className="border-t border-stone-800/90 pt-2 pb-1.5 px-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 shrink-0 bg-stone-950/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Attachments Switcher Strip if multiple attachments */}
        {attachments.length > 1 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            <span className="text-[11px] font-bold text-amber-300 ml-1 shrink-0">
              المرفقات ({internalIndex + 1}/{attachments.length}):
            </span>
            {attachments.map((att, idx) => (
              <button
                key={att.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInternalIndex(idx);
                  onIndexChange?.(idx);
                  setZoom(1);
                  setRotation(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                  idx === internalIndex
                    ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-sm scale-105'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate max-w-[130px]">{att.name}</span>
                <span className="text-[10px] opacity-75">({idx + 1})</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-200">{activeAttachment.name}</span>
            {activeAttachment.fileSize && <span>• الحجم: {activeAttachment.fileSize}</span>}
            {activeAttachment.uploadDate && <span>• تاريخ الرفع: {activeAttachment.uploadDate}</span>}
          </div>
        )}

        <div className="flex items-center gap-3 text-stone-400 text-[11px]">
          {attachments.length > 1 && (
            <span className="sm:hidden text-amber-300/90 font-medium">👈 اسحب يميناً أو يساراً للتنقل 👉</span>
          )}
          <span className="hidden sm:inline">يمكنك استخدام مفاتيح الأسهم أو السحب للتنقل و <strong>Esc</strong> للخروج</span>
        </div>
      </div>
    </div>
  );
};
