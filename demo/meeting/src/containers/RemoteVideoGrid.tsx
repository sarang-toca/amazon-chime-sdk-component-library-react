// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';
import { VideoTileState } from 'amazon-chime-sdk-js';
import {
  useMeetingManager,
  useRoster,
  VideoGrid
} from 'amazon-chime-sdk-component-library-react';

import RemoteVideo from '../components/RemoteVideo';
import { MAX_REMOTE_VIDEOS } from '../constants';

const RemoteVideoGrid: React.FC = () => {
  const meetingManager = useMeetingManager();
  const roster = useRoster();
  const tiles: { [index: number]: number } = {};
  const videoElements: HTMLVideoElement[] = []; // an array of 16 HTMLVideoElement objects
  const [visibleIndices, setVisibleIndices] = useState<{
    [index: string]: { boundAttendeeId: string };
  }>({});

  const acquireTileIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index++) {
      if (tiles[index] === tileId) {
        return index;
      }
    }
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index++) {
      if (!(index in tiles)) {
        tiles[index] = tileId;
        return index;
      }
    }
    throw new Error('no tiles are available');
  };

  const releaseTileIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index++) {
      if (tiles[index] === tileId) {
        delete tiles[index];
        return index;
      }
    }
    return MAX_REMOTE_VIDEOS;
  };

  useEffect(() => {
    const videoTileDidUpdate = (tileState: VideoTileState) => {
      const { boundAttendeeId, localTile, isContent, tileId } = tileState;
      if (!boundAttendeeId || localTile || isContent || !tileId) {
        return;
      }
      const index = acquireTileIndex(tileId);
      meetingManager?.audioVideo?.bindVideoElement(
        tileId,
        videoElements[index]
      );
      setVisibleIndices(previousVisibleIndices => ({
        ...previousVisibleIndices,
        [index]: { boundAttendeeId: boundAttendeeId }
      }));
    };

    const videoTileWasRemoved = (tileId: number) => {
      const index = releaseTileIndex(tileId);
      setVisibleIndices(previousVisibleIndices => ({
        ...previousVisibleIndices,
        [index]: null
      }));
    };
    const observers = { videoTileDidUpdate, videoTileWasRemoved };
    meetingManager?.addObserver(observers);

    return () => {
      meetingManager?.removeObserver(observers);
    };
  }, []);

  const numberOfVisibleIndices = Object.keys(visibleIndices).reduce<number>(
    (result: number, key: string) => result + (visibleIndices[key] ? 1 : 0),
    0
  );

  return (
    <VideoGrid size={numberOfVisibleIndices}>
      {Array.from(Array(MAX_REMOTE_VIDEOS).keys()).map((key, index) => {
        const visibleIndex = visibleIndices && visibleIndices[index];
        let name;

        if (visibleIndex) {
          name = roster[visibleIndex.boundAttendeeId]?.name;
        }

        return (
          <RemoteVideo
            key={key}
            enabled={!!visibleIndex}
            attendeeName={name}
            videoEleRef={useCallback((element: HTMLVideoElement | null) => {
              if (element) {
                videoElements[index] = element;
              }
            }, [])}
          />
        );
      })}
    </VideoGrid>
  );
};

export default RemoteVideoGrid;
