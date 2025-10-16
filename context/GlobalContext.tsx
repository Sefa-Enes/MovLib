import { MediaItem } from "@/interface/interfaces";
import { DiscoverMovieFilters } from "@/utils/queryBuilder";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface MediaContextType {
  mediaObject: MediaItem | undefined;
  setMediaObject: (item: MediaItem | undefined) => void;
  filters: DiscoverMovieFilters | undefined;
  setFilters: (item: DiscoverMovieFilters | undefined) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMediaContext = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMediaContext must be used within a MediaProvider");
  }
  return context;
};

interface MediaProviderProps {
  children: ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [mediaObject, setMediaObject] = useState<MediaItem>();
  const [filters, setFilters] = useState<DiscoverMovieFilters>();

  // ✅ value referansını stabilize et
  const value = useMemo(
    () => ({ mediaObject, setMediaObject, filters, setFilters }),
    [mediaObject, filters]
  );

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
};
