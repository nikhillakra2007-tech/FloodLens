import { useQuery } from "@tanstack/react-query";
import { getMapDrains, getMapFloodObservations } from "@/lib/api/map";
import type { MapDrainSegment, MapFloodObservation } from "@/lib/types/map";

export function useMapData(lon: number | undefined, lat: number | undefined) {
  const drainsQuery = useQuery({
    queryKey: ["map-drains", lon, lat],
    queryFn: () => getMapDrains(lon!, lat!),
    enabled: lon !== undefined && lat !== undefined,
  });

  const observationsQuery = useQuery({
    queryKey: ["map-observations", lon, lat],
    queryFn: () => getMapFloodObservations(lon!, lat!),
    enabled: lon !== undefined && lat !== undefined,
  });

  return {
    drains: drainsQuery.data?.drains ?? [],
    observations: observationsQuery.data?.observations ?? [],
    isLoading: drainsQuery.isLoading || observationsQuery.isLoading,
    error: drainsQuery.error ?? observationsQuery.error,
  };
}
