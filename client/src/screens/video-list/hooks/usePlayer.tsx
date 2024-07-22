import { YouTubePlayer, YouTubeEvent } from 'react-youtube';
import { useState, useRef } from 'react';
import { User } from 'typing/shared';
import { VIDEO_STATUS, VIDEO_STATUS_TO_STATUS_LIST } from 'utils/constants';
import { UpdateVideoListBody } from 'typing/services';

export default function usePlayer({
  usersData,
  onListEnd,
  onStartPlaying,
  onVideoEnd,
}: {
  usersData: User[] | null;
  onListEnd: (data: UpdateVideoListBody) => void;
  onStartPlaying: () => void;
  onVideoEnd: (newUrl: string) => void;
}) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoData, setVideoData] = useState<Record<string, string>>({});

  const player = useRef<YouTubePlayer | null>(null);

  function onPlayerReady(event: YouTubeEvent) {
    // store the player instance
    player.current = event?.target;

    const videoData = player.current.getVideoData();

    setVideoData(videoData);
  }

  function onPlayerStateChange(event: YouTubeEvent) {
    console.log(
      'currentVideoIndex: ',
      currentVideoIndex,
      'usersData: ',
      usersData
    );
    if (VIDEO_STATUS.ENDED === event.data) {
      if (usersData?.length && currentVideoIndex === usersData?.length - 1) {
        // playlist ended
        console.log('video ended');
        onListEnd({
          status: VIDEO_STATUS_TO_STATUS_LIST[VIDEO_STATUS.ENDED],
        });
        return;
      }

      setCurrentVideoIndex((curr) => curr + 1);
      const newUrl = usersData?.[currentVideoIndex + 1]?.url || '';

      onVideoEnd(newUrl);
    }
  }

  function onPlay(_event: YouTubeEvent) {
    onStartPlaying();
  }

  function onPlayerError(_event: YouTubeEvent) {}

  function handleVolumePlayer(e: string) {
    player.current.setVolume(Number(e));
  }

  function updatePlayerTime(currentTime: number, url: string) {
    console.log('player.current: ', player.current);

    player.current.seekTo(currentTime);
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
  };
}
