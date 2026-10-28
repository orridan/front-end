/** Code-split routes and the landing page's below-the-fold chunk, all preloadable. */
import { routes } from './content';
import { preloadable } from './lib/preloadable';

export const BelowFold = preloadable(() => import('./sections/BelowFold'));
export const Privacy = preloadable(() => import('./pages/Privacy'));
export const Terms = preloadable(() => import('./pages/Terms'));
export const Cookies = preloadable(() => import('./pages/Cookies'));
export const CheckoutSuccess = preloadable(() => import('./pages/CheckoutSuccess'));
export const NotFound = preloadable(() => import('./pages/NotFound'));

/** Loads every chunk the given path needs on first render. Never rejects. */
export function preloadRoute(pathname: string): Promise<unknown> {
  const path = pathname.replace(/\/+$/, '') || '/';
  const task = (() => {
    switch (path) {
      case routes.home:
        return BelowFold.preload();
      case routes.product:
        return Promise.resolve();
      case routes.privacy:
        return Privacy.preload();
      case routes.terms:
        return Terms.preload();
      case routes.cookies:
        return Cookies.preload();
      case routes.checkoutSuccess:
        return CheckoutSuccess.preload();
      default:
        return NotFound.preload();
    }
  })();
  return task.catch(() => undefined);
}
