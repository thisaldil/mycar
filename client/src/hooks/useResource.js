import { useCallback, useRef } from 'react';
import { toast } from '../components/common/Toast';
import { useAsync } from './useAsync';

/**
 * List + CRUD state for a REST resource created with createResourceApi().
 * Mutations update local state optimistically after the server confirms.
 */
export function useResource(api, params, { enabled = true, label = 'Record', onChange } = {}) {
  const key = JSON.stringify(params || {});
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { data, loading, error, reload, setData } = useAsync(
    () => enabled ? api.list(params) : Promise.resolve([]),
    [api, key, enabled]
  );
  const items = Array.isArray(data) ? data : data?.items || [];

  const create = useCallback(
    async (values) => {
      const created = await api.create(values);
      setData((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      toast.success(`${label} added`);
      onChangeRef.current?.();
      return created;
    },
    [api, label, setData]
  );

  const update = useCallback(
    async (id, values) => {
      const updated = await api.update(id, values);
      setData((prev) => Array.isArray(prev) ? prev.map((r) => r.id === id ? updated : r) : prev);
      toast.success(`${label} updated`);
      onChangeRef.current?.();
      return updated;
    },
    [api, label, setData]
  );

  const remove = useCallback(
    async (id) => {
      await api.remove(id);
      setData((prev) => Array.isArray(prev) ? prev.filter((r) => r.id !== id) : prev);
      toast.success(`${label} deleted`);
      onChangeRef.current?.();
    },
    [api, label, setData]
  );

  return { items, loading, error, reload, create, update, remove, setItems: setData };
}