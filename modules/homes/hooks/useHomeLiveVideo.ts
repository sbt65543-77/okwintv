"use client";

import { useEffect, useState } from "react";
import { getHomeLivePlaybackUrl } from "@/helpers/livePlayback";
import type { HomeLiveVideoResponse } from "@/models/match";
import { getHomeLiveVideo } from "@/services/matches";

export const useHomeLiveVideo = () => {
  const [data, setData] = useState<HomeLiveVideoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadHomeLiveVideo() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getHomeLiveVideo();
        if (isActive) {
          setData(response);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load live video",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadHomeLiveVideo();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    videoUrl: getHomeLivePlaybackUrl(data),
  };
};
