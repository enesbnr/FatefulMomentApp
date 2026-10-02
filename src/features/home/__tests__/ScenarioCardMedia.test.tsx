import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { AppState, Image, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
import ScenarioCardMedia from '../components/ScenarioCardMedia';
import { scenarioMediaFixture as media } from '../testing/fixtures';

test('inactive media retains images; active media waits for display readiness and falls back on failure', async () => {
  const originalState = AppState.currentState;
  AppState.currentState = 'active';
  const onPositionChange = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(() => { tree = Renderer.create(<ScenarioCardMedia active={false} media={media} />); });
    expect(tree.root.findAllByType(Video)).toHaveLength(0);
    expect(tree.root.findAllByType(Image)).toHaveLength(2);
    const viewport = tree.root.findByType(View);
    expect(viewport.props.collapsable).toBe(false);
    expect(StyleSheet.flatten(viewport.props.style)).toMatchObject({
      borderRadius: 16,
      overflow: 'hidden',
    });

    await act(() => {
      tree.update(
        <ScenarioCardMedia
          active
          media={media}
          onPositionChange={onPositionChange}
          resumeAtSeconds={12}
          startAtSeconds={3}
        />,
      );
    });
    const video = () => tree.root.findByType(Video);
    expect(video().props.paused).toBe(false);
    expect(video().props.muted).toBe(true);
    expect(video().props.controls).toBe(false);
    expect(video().props.repeat).toBe(false);
    expect(video().props.progressUpdateInterval).toBe(250);
    expect(StyleSheet.flatten(video().props.style)).toMatchObject({
      borderRadius: 16,
      opacity: 0,
    });
    await act(() => {
      tree.update(
        <ScenarioCardMedia
          active
          media={media}
          muted={false}
          onPositionChange={onPositionChange}
          resumeAtSeconds={12}
          startAtSeconds={3}
        />,
      );
    });
    expect(video().props.muted).toBe(false);
    await act(() => video().props.onReadyForDisplay());
    expect(StyleSheet.flatten(video().props.style).opacity).not.toBe(0);
    await act(() => video().props.onProgress({ currentTime: 13.5 }));
    expect(onPositionChange).toHaveBeenLastCalledWith(13.5);
    await act(() => video().props.onEnd());
    expect(onPositionChange).toHaveBeenLastCalledWith(3);
    expect(tree.root.findAllByType(Image)).toHaveLength(2);
    await act(() => video().props.onError({}));
    expect(tree.root.findAllByType(Video)).toHaveLength(0);
    expect(tree.root.findAllByType(Image)).toHaveLength(2);

    await act(() => { tree.update(<ScenarioCardMedia active={false} media={media} />); });
    await act(() => {
      tree.update(
        <ScenarioCardMedia
          active
          media={media}
          onPositionChange={onPositionChange}
          resumeAtSeconds={12}
          startAtSeconds={3}
        />,
      );
    });
    expect(tree.root.findAllByType(Video)).toHaveLength(1);
    expect(StyleSheet.flatten(video().props.style).opacity).toBe(0);
  } finally {
    await act(() => tree?.unmount());
    AppState.currentState = originalState;
  }
});
