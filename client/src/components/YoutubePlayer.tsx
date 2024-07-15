import { YoutubePlayerProps } from 'typing/shared';
import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube';
import { getYoutubeVideoId } from 'utils/utils';

export default function YoutubePlayer({
  videoUrl,
  onPlayerReady,
  onPlayerStateChange,
  onPlayerError,
  onPlay,
}: YoutubePlayerProps) {
  const options = {
    frameborder: 1,
    allowfullscreen: true,
    playerVars: {
      autoplay: 1,
      controls: 0,
    },
  };

  return (
    <YouTube
      videoId={getYoutubeVideoId(videoUrl) || ''}
      opts={options}
      onReady={(data: YouTubeEvent) => onPlayerReady(data)}
      className="video-container pb-[34.25%] relative pointer-events-none"
      onStateChange={(event: YouTubeEvent) => onPlayerStateChange(event)}
      onError={(error: YouTubeEvent) => onPlayerError(error)}
      onPlay={onPlay}
      iframeClassName="absolute top-0 left-0 w-full h-full"
    />
  );
}
