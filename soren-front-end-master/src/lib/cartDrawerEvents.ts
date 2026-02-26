const MINI_CART_EVENT = 'soren:open-mini-cart';

export function emitOpenMiniCart() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(MINI_CART_EVENT));
}

export function onMiniCartOpen(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const callback = () => listener();
  window.addEventListener(MINI_CART_EVENT, callback);

  return () => {
    window.removeEventListener(MINI_CART_EVENT, callback);
  };
}
