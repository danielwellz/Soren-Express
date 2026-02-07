import React from 'react';

type MotionComponentProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

function createMotionTag(tagName: keyof JSX.IntrinsicElements) {
  return React.forwardRef<HTMLElement, MotionComponentProps>((props, ref) => {
    const {
      children,
      animate,
      exit,
      initial,
      layout,
      layoutId,
      transition,
      variants,
      whileHover,
      whileInView,
      whileTap,
      ...rest
    } = props as MotionComponentProps & Record<string, unknown>;

    return React.createElement(tagName, { ...rest, ref }, children);
  });
}

export const motion = new Proxy(
  {},
  {
    get: (_target, key) => {
      if (typeof key !== 'string') {
        return createMotionTag('div');
      }
      return createMotionTag(key as keyof JSX.IntrinsicElements);
    },
  },
) as Record<string, React.ComponentType<MotionComponentProps>>;

export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function MotionConfig({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useReducedMotion() {
  return true;
}
