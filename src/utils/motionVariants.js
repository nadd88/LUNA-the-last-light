/**
 * LUNA - THE LAST LIGHT
 * Centralized Animation Variants & Motion Tokens
 * Standardized across screens, modals, cards, and interactive buttons.
 */

// Respect reduced motion preferences
export const transitionDefaults = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1] // Apple/NASA-like spring-damped cubic bezier
};

// Page transition variants for AnimatePresence mode="wait"
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.995,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.995,
    filter: 'blur(4px)',
    transition: {
      duration: 0.22,
      ease: [0.7, 0, 0.84, 0]
    }
  }
};

// Cinematic descent transition specifically for Mission Control -> Surface Ops
export const descentPageVariants = {
  initial: {
    opacity: 0,
    scale: 1.04,
    filter: 'brightness(1.5) blur(6px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'brightness(1) blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.25
    }
  }
};

// Modal dialog backdrop & card variants
export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const modalContentVariants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 16
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: [0.7, 0, 0.84, 0]
    }
  }
};

// Staggered list / cards container
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

// Child item for staggered containers
export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Interactive button micro-animations
export const buttonHoverTap = {
  whileHover: {
    scale: 1.02,
    y: -1,
    transition: { duration: 0.15, ease: 'easeOut' }
  },
  whileTap: {
    scale: 0.98,
    y: 0,
    transition: { duration: 0.08, ease: 'easeIn' }
  }
};

export const subtleButtonHoverTap = {
  whileHover: {
    scale: 1.015,
    transition: { duration: 0.15 }
  },
  whileTap: {
    scale: 0.985,
    transition: { duration: 0.08 }
  }
};
