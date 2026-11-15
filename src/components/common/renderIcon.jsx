import React, { isValidElement, cloneElement } from 'react';

/**
 * Renders an icon safely whether it is passed as:
 * 1. A JSX element (e.g. <Rocket className="w-4 h-4" />)
 * 2. A component reference (function, class, or forwardRef/memo object with $$typeof)
 * Returns null for anything else.
 *
 * @param {React.ReactNode | React.ComponentType} icon
 * @param {Object} defaultProps Optional props to pass to the icon (e.g. { className, 'aria-hidden': true })
 * @returns {React.ReactElement | null}
 */
export function renderIcon(icon, defaultProps = {}) {
  if (!icon) return null;

  // 1. If it's already a valid React Element:
  if (isValidElement(icon)) {
    if (!defaultProps || Object.keys(defaultProps).length === 0) {
      return icon;
    }
    const mergedProps = { ...defaultProps, ...icon.props };
    if (defaultProps.className && icon.props.className) {
      mergedProps.className = `${defaultProps.className} ${icon.props.className}`.trim();
    }
    return cloneElement(icon, mergedProps);
  }

  // 2. If it's a component (function, class, forwardRef or memo object with $$typeof):
  const isComponent =
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && Boolean(icon.$$typeof));

  if (isComponent) {
    const IconComponent = icon;
    return <IconComponent {...defaultProps} />;
  }

  // 3. Anything else returns null
  return null;
}

export default renderIcon;
