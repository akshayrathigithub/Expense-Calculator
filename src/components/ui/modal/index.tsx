import React, { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./modal.module.scss";
import { ModalProps } from "./type";

let openCount = 0;
let zIndexCounter = 1000;

function getNextZIndex() {
  zIndexCounter += 2; // overlay and modal pair
  return zIndexCounter;
}

function lockBodyScroll() {
  openCount += 1;
  if (openCount === 1) {
    const original = document.body.style.overflow;
    document.body.dataset.scrollLock = original || "";
    document.body.style.overflow = "hidden";
  }
}

function unlockBodyScroll() {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    document.body.style.overflow = document.body.dataset.scrollLock || "";
    delete document.body.dataset.scrollLock;
  }
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  closeOnEsc = true,
  closeOnBackdrop = true,
  zIndex,
  className,
  contentClassName,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zRef = useRef<number>(zIndex ?? getNextZIndex());

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  useLayoutEffect(() => {
    if (!open) return;
    // focus the modal container for better keyboard accessibility
    containerRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const overlay = (
    <div
      className={[styles.overlay, className ?? ""].filter(Boolean).join(" ")}
      style={{ zIndex: zRef.current }}
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[styles.content, contentClassName ?? ""]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        ref={containerRef}
        style={{ zIndex: zRef.current + 1 }}
      >
        {title ? (
          <div id="modal-title" className={styles.header}>
            {title}
          </div>
        ) : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
