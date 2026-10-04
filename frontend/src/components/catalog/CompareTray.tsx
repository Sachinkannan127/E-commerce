"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight, Scale, Trash2 } from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const CompareTray: React.FC = () => {
  const { items, removeFromCompare, clearCompare } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 shadow-2xl rounded-2xl p-4 transition-all"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                Compare Products
                <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary-foreground font-mono rounded-full">
                  {items.length}/4
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Compare features, prices & specifications side-by-side
              </p>
            </div>
          </div>

          {/* Product Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {items.map((prod) => (
              <div
                key={prod.id}
                className="relative group w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 p-1 flex-shrink-0 flex items-center justify-center"
              >
                {prod.primary_image ? (
                  <Image
                    src={prod.primary_image}
                    alt={prod.title}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full rounded"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 text-center line-clamp-2">
                    {prod.title}
                  </span>
                )}
                <button
                  onClick={() => removeFromCompare(prod.id)}
                  aria-label="Remove from comparison"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: 4 - items.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs flex-shrink-0"
              >
                +
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-9"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
            <Link href="/compare">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-9 shadow-md flex items-center gap-1.5 px-4"
              >
                Compare Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
