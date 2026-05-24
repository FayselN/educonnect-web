import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

export const usePolling = (fetchFn, interval = 5000, dependencies = []) => {
  const dispatch = useDispatch();
  const savedFetchFn = useRef();

  useEffect(() => {
    savedFetchFn.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    // Initial fetch
    savedFetchFn.current(dispatch);

    const id = setInterval(() => {
      savedFetchFn.current(dispatch);
    }, interval);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, interval, ...dependencies]);
};
