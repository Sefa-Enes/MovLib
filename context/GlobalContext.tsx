import { MediaItem } from "@/interface/interfaces";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface MediaContextType {
  mediaObject: MediaItem | undefined;
  setMediaObject: (item: MediaItem | undefined) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMediaContext = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMediaContext must be used within a MediaProvider");
  }
  return context;
};

interface MediaProviderProps {
  children: ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [mediaObject, setMediaObject] = useState<MediaItem | undefined>(
    undefined
  );

  return (
    <MediaContext.Provider value={{ mediaObject, setMediaObject }}>
      {children}
    </MediaContext.Provider>
  );
};
