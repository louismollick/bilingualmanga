import { useEffect } from 'react';

const useKeyPress = (handlers: Record<string, () => void> = {}, dependencies = []) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.repeat) {
        handlers[event.code]?.();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers, ...dependencies]);
};

export default useKeyPress;