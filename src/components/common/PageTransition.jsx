import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants } from '../../utils/motionVariants';

/**
 * PageTransition wrapper
 * Ensures full height and flex expansion without page-level overflow.
 */
export default function PageTransition({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={`w-full h-full flex flex-col min-h-0 ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full h-full flex flex-col min-h-0 ${className}`}
    >
      {children}
    </motion.div>
  );
}
