import { lazy, type ComponentProps, type ComponentType } from 'react';

/**
 * React.lazy with a preload() hook. Once the chunk has loaded, the component renders the module
 * directly, so a render that happens after preload() never suspends (no fallback flash when the
 * live app replaces the prerendered markup).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function preloadable<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  let loaded: T | null = null;
  let pending: Promise<void> | null = null;
  const preload = () => {
    pending ??= factory().then((mod) => {
      loaded = mod.default;
    });
    return pending;
  };
  const Lazy = lazy(() => preload().then(() => ({ default: loaded as T })));
  function Preloadable(props: ComponentProps<T>) {
    const Component = (loaded ?? Lazy) as ComponentType<ComponentProps<T>>;
    return <Component {...props} />;
  }
  return Object.assign(Preloadable, { preload });
}
