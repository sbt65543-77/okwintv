import type { HomeLiveVideoItem, HomeLiveVideoResponse } from "@/models/match";

type HomeLivePlaybackSource = HomeLiveVideoItem | HomeLiveVideoResponse | null | undefined;

export const getHomeLivePlaybackUrl = (
  source: HomeLivePlaybackSource,
): string | undefined => {
  if (!source) {
    return undefined;
  }

  if (source.channel?.isLink) {
    return source.channel.live?.videoUrl || source.videoUrl || undefined;
  }

  return (
    source.channel?.live?.videoUrl ||
    source.channel?.live?.authorizedPlaybackUrl ||
    source.videoUrl ||
    source.authorizedPlaybackUrl ||
    undefined
  );
};
