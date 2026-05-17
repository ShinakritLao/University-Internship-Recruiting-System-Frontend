import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SIZES = ["sm", "md", "lg", "xl"];

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  footer,
  closeOnBackdrop = true,
  showCloseButton = true,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const s = SIZES.includes(size) ? size : "md";

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="ui-modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => closeOnBackdrop && onClose?.()}
          role="presentation"
        >
          <motion.div
            className={`ui-modal ui-modal--${s}`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
          >
            {(title || showCloseButton) && (
              <div className="ui-modal__header">
                {title && <h3 className="ui-modal__title">{title}</h3>}
                {showCloseButton && (
                  <button
                    type="button"
                    className="ui-modal__close"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="ui-modal__body">{children}</div>
            {footer && <div className="ui-modal__footer">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
