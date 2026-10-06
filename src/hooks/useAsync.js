import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async function and tracks { data, loading, error }.
 * Stale responses (from earlier calls) are ignored.
 */
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const mounted = useRef(true);
  const callId = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async (...args) => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn(...args);
      if (mounted.current && id === callId.current) setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      if (mounted.current && id === callId.current) setState((s) => ({ ...s, loading: false, error }));
      throw error;
    }
  }, deps);

  useEffect(() => {
    if (immediate) run().catch(() => {});
  }, [run, immediate]);

  const reload = useCallback(() => run().catch(() => {}), [run]);
  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    []
  );

  return { ...state, run, reload, setData };
}