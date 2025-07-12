import { useMemo, useCallback, useRef } from 'react';

// 깊은 비교를 위한 유틸리티
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

// 메모이제이션된 값 훅
export function useMemoizedValue<T>(value: T, deps: unknown[]): T {
  const ref = useRef<{ value: T; deps: unknown[] } | undefined>(undefined);
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { value, deps };
  }
  
  return ref.current.value;
}

// 메모이제이션된 콜백 훅
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[]
): T {
  return useCallback(callback, deps);
}

// 조건부 메모이제이션 훅
export function useConditionalMemo<T>(
  factory: () => T,
  condition: boolean,
  deps: unknown[]
): T | undefined {
  return useMemo(() => {
    if (!condition) return undefined;
    return factory();
  }, [condition, ...deps]);
} 