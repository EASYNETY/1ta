// components/hoc/withSafeData.tsx
import React from 'react';
import { safeArray, safeObject } from '@/lib/utils/safe-data';

/**
 * Higher-Order Component that ensures props are safely accessed
 * This HOC wraps a component and ensures that array and object props are never undefined or null
 * 
 * @param Component The component to wrap
 * @param safeProps An object mapping prop names to their safe type ('array' or 'object')
 * @returns A wrapped component with safe props
 */
export function withSafeData<P extends object>(
  Component: React.ComponentType<P>,
  safeProps: Record<string, 'array' | 'object'>
): React.FC<P> {
  const WithSafeData: React.FC<P> = (props) => {
    const safeProps: P = { ...props };

    // Process each prop that needs to be made safe
    Object.entries(safeProps).forEach(([propName, propType]) => {
      const prop = props[propName as keyof P];
      
      if (propType === 'array') {
        // @ts-ignore - We know this is safe
        safeProps[propName as keyof P] = safeArray(prop);
      } else if (propType === 'object') {
        // @ts-ignore - We know this is safe
        safeProps[propName as keyof P] = safeObject(prop);
      }
    });

    return <Component {...safeProps} />;
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithSafeData.displayName = `WithSafeData(${displayName})`;

  return WithSafeData;
}

/**
 * Example usage:
 * 
 * const MyComponent = ({ items, user }) => {
 *   // items is guaranteed to be an array, even if null/undefined was passed
 *   // user is guaranteed to be an object, even if null/undefined was passed
 *   return (
 *     <div>
 *       <h1>{user.name || 'Anonymous'}</h1>
 *       <ul>
 *         {items.map(item => <li key={item.id}>{item.name}</li>)}
 *       </ul>
 *     </div>
 *   );
 * };
 * 
 * export default withSafeData(MyComponent, {
 *   items: 'array',
 *   user: 'object'
 * });
 */
