import { useCallback, useMemo, useRef } from 'react';

const playTone = (
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  frequencyDrop = 0,
) => {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  if (frequencyDrop > 0) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(80, frequency - frequencyDrop),
      audioContext.currentTime + duration,
    );
  }
  gain.gain.setValueAtTime(gainValue, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

const playNoiseBurst = (
  audioContext: AudioContext,
  duration: number,
  gainValue: number,
  highpassFrequency: number,
) => {
  const bufferSize = Math.max(1, Math.floor(audioContext.sampleRate * duration));
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(highpassFrequency, audioContext.currentTime);
  gain.gain.setValueAtTime(gainValue, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start();
  source.stop(audioContext.currentTime + duration);
};

export const useSoundHooks = (enabled: boolean) => {
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!enabled || typeof window === 'undefined') {
      return null;
    }

    if (!contextRef.current) {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      contextRef.current = new AudioContextCtor();
    }

    if (contextRef.current.state === 'suspended') {
      void contextRef.current.resume();
    }

    return contextRef.current;
  }, [enabled]);

  return useMemo(
    () => ({
      playDice: () => {
        const ctx = getContext();
        if (!ctx) return;
        playNoiseBurst(ctx, 0.07, 0.025, 1200);
        playTone(ctx, 460, 0.06, 'square', 0.028, 170);
        window.setTimeout(() => {
          const next = getContext();
          if (!next) return;
          playNoiseBurst(next, 0.08, 0.02, 900);
          playTone(next, 540, 0.07, 'triangle', 0.024, 190);
        }, 85);
        window.setTimeout(() => {
          const next = getContext();
          if (!next) return;
          playNoiseBurst(next, 0.09, 0.018, 800);
          playTone(next, 390, 0.09, 'square', 0.022, 130);
        }, 180);
      },
      playStep: () => {
        const ctx = getContext();
        if (!ctx) return;
        playTone(ctx, 300, 0.05, 'triangle', 0.018, 35);
        window.setTimeout(() => {
          const next = getContext();
          if (next) playTone(next, 180, 0.035, 'sine', 0.01, 25);
        }, 18);
      },
      playMove: () => {
        const ctx = getContext();
        if (!ctx) return;
        playTone(ctx, 380, 0.09, 'triangle', 0.04, 80);
      },
      playCapture: () => {
        const ctx = getContext();
        if (!ctx) return;
        playTone(ctx, 260, 0.08, 'sawtooth', 0.05, 110);
        playNoiseBurst(ctx, 0.08, 0.03, 700);
        window.setTimeout(() => {
          const next = getContext();
          if (next) playTone(next, 170, 0.12, 'square', 0.04, 55);
        }, 35);
      },
      playWin: () => {
        const ctx = getContext();
        if (!ctx) return;
        playTone(ctx, 520, 0.12, 'triangle', 0.05);
        window.setTimeout(() => {
          const next = getContext();
          if (next) playTone(next, 660, 0.16, 'triangle', 0.05);
        }, 110);
        window.setTimeout(() => {
          const next = getContext();
          if (next) playTone(next, 780, 0.22, 'triangle', 0.05);
        }, 230);
      },
    }),
    [getContext],
  );
};
