import React from 'react';

export default function usePoller(fn: () => void, delay: number = 9977) {
  const callback = React.useRef<Function | null>(null);

  const handleCallback = React.useCallback(() => {
    if (callback.current === null) {
      fn();
    }

    callback.current = fn;
  }, [fn]);

  React.useEffect(() => {
    const interval = setInterval(() => fn(), delay);

    return () => clearInterval(interval);
  }, [fn, delay]);

  React.useEffect(() => {
    handleCallback();
  }, [handleCallback]);
}
