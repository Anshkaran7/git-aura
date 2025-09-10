import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PerformanceIndicatorProps {
  itemCount: number;
  isVirtualized?: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  itemCount,
  isVirtualized = true,
}) => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<string>("");

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate render time measurement
    const measureRender = () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRender);

    // Memory usage estimation (simplified)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      setMemoryUsage(`${usedMB}MB`);
    }
  }, [itemCount]);

  if (!isVirtualized && itemCount < 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2 border border-border/30"
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isVirtualized ? 'bg-green-500' : 'bg-orange-500'}`} />
        <span>{isVirtualized ? 'Virtual Scrolling' : 'Standard Rendering'}</span>
      </div>
      
      {renderTime > 0 && (
        <div className="flex items-center gap-1">
          <span>Render:</span>
          <span className="font-mono">{renderTime.toFixed(1)}ms</span>
        </div>
      )}
      
      {memoryUsage && (
        <div className="flex items-center gap-1">
          <span>Memory:</span>
          <span className="font-mono">{memoryUsage}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        <span>Items:</span>
        <span className="font-mono">{itemCount.toLocaleString()}</span>
      </div>
    </motion.div>
  );
};
