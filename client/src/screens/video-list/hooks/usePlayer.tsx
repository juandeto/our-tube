import { YouTubePlayer, YouTubeEvent } from 'react-youtube';
import { useState, useRef } from 'react';
import { User } from 'typing/shared';
import { VIDEO_STATUS } from 'utils/constants';
export default function usePlayer({
  usersData,
  onStartPlaying,
  onVideoEnd,
}: {
  usersData: User[] | null;
  onStartPlaying: () => void;
  onVideoEnd: () => void;
}) {
  const [volume, setVolume] = useState<number>(50);

  const [videoData, setVideoData] = useState<Record<string, string | number>>(
    {}
  );

  const player = useRef<YouTubePlayer | null>(null);

  function onPlayerReady(event: YouTubeEvent) {
    // store the player instance
    player.current = event?.target;

    const videoData = player.current.getVideoData();

    const duration = Number(player?.current?.getDuration());

    setVideoData({ ...videoData, duration });
    player.current.setVolume(volume);
  }

  function onPlayerStateChange(event: YouTubeEvent) {
    if (VIDEO_STATUS.ENDED === event.data) {
      if (
        usersData?.length &&
        usersData[usersData.length - 1].url.includes(
          videoData?.video_id as string
        )
      ) {
        // playlist ended
        console.log('video ended');
      }

      onVideoEnd();
    }
  }

  function onPlay(_event: YouTubeEvent) {
    onStartPlaying();
  }

  function onPlayerError(_event: YouTubeEvent) {}

  function handleVolumePlayer(e: string | number) {
    setVolume(Number(e));
    player.current.setVolume(Number(e));
  }

  function updatePlayerTime(currentTime: number) {
    player.current.seekTo(currentTime);

    const duration = Number(player?.current?.getDuration()) - currentTime;

    setVideoData({ ...videoData, duration });
  }

  function handleRepeatVideo() {
    const duration = Number(player?.current?.getDuration());

    setVideoData(() => ({ ...videoData, duration }));

    console.log('videoData: ', videoData);

    player.current.seekTo(0);
    player.current.playVideo();
  }

  return {
    videoData,
    playerExists:
      player.current !== null &&
      VIDEO_STATUS.PLAYING === player.current?.getPlayerState(),
    onPlayerReady,
    onPlayerStateChange,
    onPlay,
    onPlayerError,
    handleVolumePlayer,
    updatePlayerTime,
    volume,
    handleRepeatVideo,
  };
}
