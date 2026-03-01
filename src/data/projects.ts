import { Project } from '@/components/type/projectType';
import { media2 } from '@/data/media';
import { partner } from '@/data/partner';
import { useEvent } from '@/hooks/useEvent';
import { useMemo } from 'react';


export const getProjectById = (uuid: string): Project | undefined => {
  // ---- React Query: cukup panggil hook yang sudah dipisah
  const { data: apiMenus = [], isLoading, error } = useEvent();

  // Derived links
  const event = useMemo(() => apiMenus, [apiMenus]);
  return event.find((p) => p.uuid === uuid);
};

export const getProjectIndex = (uuid: string): number => {
  // ---- React Query: cukup panggil hook yang sudah dipisah
  const { data: apiMenus = [], isLoading, error } = useEvent();

  // Derived links
  const event = useMemo(() => apiMenus, [apiMenus]);
  return event.findIndex((p) => p.uuid === uuid);
};
