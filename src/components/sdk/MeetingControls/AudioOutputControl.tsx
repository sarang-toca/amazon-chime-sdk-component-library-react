// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { ControlBarButton } from '../../ui/ControlBar/ControlBarItem';
import { Sound } from '../../ui/icons';
import { useMeetingManager } from '../../../providers/MeetingProvider';
import { useAudioOutputs } from '../../../providers/DevicesProvider';
import { useLocalAudioOutput } from '../../../providers/LocalAudioOutputProvider';
import { isOptionActive } from '../../../utils/device-utils';
import { DeviceType } from '../../../types';
import { PopOverItemProps } from '../../ui/PopOver/PopOverItem';

const AudioOutputControl: React.FC = () => {
  const meetingManager = useMeetingManager();
  const { devices, selectedDevice } = useAudioOutputs();
  const { isAudioOn, toggleAudio } = useLocalAudioOutput();

  const dropdownOptions: PopOverItemProps[] = devices.map(
    (device: DeviceType) => ({
      children: <span>{device.label}</span>,
      checked: isOptionActive(selectedDevice, device.deviceId),
      onClick: (): Promise<void> =>
        meetingManager.selectAudioOutputDevice(device.deviceId)
    })
  );

  return (
    <>
      <ControlBarButton
        icon={<Sound disabled={!isAudioOn} />}
        onClick={toggleAudio}
        label="Audio"
        popOver={dropdownOptions}
      />
    </>
  );
};

export default AudioOutputControl;