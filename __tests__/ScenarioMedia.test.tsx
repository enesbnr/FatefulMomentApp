import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { AppState, Image, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import ScenarioMedia from '../src/gameplay/ScenarioMedia';

test('inactive media retains images; active media waits for display readiness and falls back on failure', async () => {
  const originalState = AppState.currentState;
  AppState.currentState = 'active';
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(() => { tree = Renderer.create(<ScenarioMedia active={false} />); });
    expect(tree.root.findAllByType(Video)).toHaveLength(0);
    expect(tree.root.findAllByType(Image)).toHaveLength(2);

    await act(() => { tree.update(<ScenarioMedia active />); });
    const video = () => tree.root.findByType(Video);
    expect(video().props.paused).toBe(false);
    expect(video().props.muted).toBe(true);
    expect(video().props.controls).toBe(false);
    expect(video().props.repeat).toBe(true);
    expect(StyleSheet.flatten(video().props.style).opacity).toBe(0);
    await act(() => video().props.onReadyForDisplay());
    expect(StyleSheet.flatten(video().props.style).opacity).not.toBe(0);
    expect(tree.root.findAllByType(Image)).toHaveLength(2);
    await act(() => video().props.onError({}));
    expect(tree.root.findAllByType(Video)).toHaveLength(0);
    expect(tree.root.findAllByType(Image)).toHaveLength(2);

    await act(() => { tree.update(<ScenarioMedia active={false} />); });
    await act(() => { tree.update(<ScenarioMedia active />); });
    expect(tree.root.findAllByType(Video)).toHaveLength(1);
    expect(StyleSheet.flatten(video().props.style).opacity).toBe(0);
  } finally {
    await act(() => tree?.unmount());
    AppState.currentState = originalState;
  }
});
