import { useRef, useState, useCallback } from 'react';

interface LivePreviewOptions {
  pitch: number;
  speed: number;
  reverb: number;
  voiceModel: string;
}

export const useLiveVoicePreview = () => {
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const pitchShifterRef = useRef<AudioWorkletNode | null>(null);

  const connectLivePreview = useCallback((stream: MediaStream, options: LivePreviewOptions) => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Gain node
      const gain = ctx.createGain();
      gain.gain.value = 1.0;
      gainRef.current = gain;

      // Calculate pitch ratio from voice model
      let pitchRate = 0.5 + (options.pitch / 100); // 0.5 to 1.5
      switch (options.voiceModel) {
        case 'deep': pitchRate *= 0.7; break;
        case 'high': pitchRate *= 1.4; break;
        case 'whisper': pitchRate *= 0.95; break;
      }

      // For live monitoring, we use a delay-based pitch shifting approximation
      // True pitch shifting needs AudioWorklet, so we simulate with delay modulation
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = Math.abs(1 - pitchRate) * 0.02; // subtle delay for effect
      delayRef.current = delay;

      let lastNode: AudioNode = source;
      source.connect(gain);
      lastNode = gain;

      // Robot distortion
      if (options.voiceModel === 'robot') {
        const distortion = ctx.createWaveShaper();
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + 10) * x * 20 * deg) / (Math.PI + 10 * Math.abs(x));
        }
        distortion.curve = curve;
        distortion.oversample = '4x';
        distortionRef.current = distortion;
        lastNode.connect(distortion);
        lastNode = distortion;
      }

      // Reverb
      const reverbMix = options.reverb / 100;
      const additionalReverb = options.voiceModel === 'echo' ? 0.5 : 0;
      const totalReverb = Math.min(1, reverbMix + additionalReverb);

      if (totalReverb > 0) {
        const impulseLen = 2 + totalReverb * 3;
        const impulseDecay = 2 + totalReverb * 2;
        const impulseBuffer = ctx.createBuffer(2, ctx.sampleRate * impulseLen, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = impulseBuffer.getChannelData(ch);
          for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, impulseDecay);
          }
        }

        const convolver = ctx.createConvolver();
        convolver.buffer = impulseBuffer;
        convolverRef.current = convolver;

        const wet = ctx.createGain();
        wet.gain.value = totalReverb * 0.6;
        wetGainRef.current = wet;

        const dry = ctx.createGain();
        dry.gain.value = 1 - totalReverb * 0.3;
        dryGainRef.current = dry;

        lastNode.connect(convolver);
        convolver.connect(wet);
        wet.connect(ctx.destination);

        lastNode.connect(dry);
        dry.connect(ctx.destination);
      } else {
        lastNode.connect(delay);
        delay.connect(ctx.destination);
      }

      setIsLiveMonitoring(true);
    } catch (err) {
      console.error('Live preview error:', err);
    }
  }, []);

  const disconnectLivePreview = useCallback(() => {
    try {
      sourceRef.current?.disconnect();
      gainRef.current?.disconnect();
      delayRef.current?.disconnect();
      convolverRef.current?.disconnect();
      distortionRef.current?.disconnect();
      dryGainRef.current?.disconnect();
      wetGainRef.current?.disconnect();
      audioCtxRef.current?.close();
    } catch {
      // ignore
    }
    audioCtxRef.current = null;
    setIsLiveMonitoring(false);
  }, []);

  const updateOptions = useCallback((options: LivePreviewOptions) => {
    if (!audioCtxRef.current) return;

    // Update gain
    if (gainRef.current) {
      gainRef.current.gain.value = 1.0;
    }

    // Update delay for pitch simulation
    if (delayRef.current) {
      let pitchRate = 0.5 + (options.pitch / 100);
      switch (options.voiceModel) {
        case 'deep': pitchRate *= 0.7; break;
        case 'high': pitchRate *= 1.4; break;
        case 'whisper': pitchRate *= 0.95; break;
      }
      delayRef.current.delayTime.value = Math.abs(1 - pitchRate) * 0.02;
    }

    // Update reverb mix
    const reverbMix = options.reverb / 100;
    const additionalReverb = options.voiceModel === 'echo' ? 0.5 : 0;
    const totalReverb = Math.min(1, reverbMix + additionalReverb);
    if (wetGainRef.current) wetGainRef.current.gain.value = totalReverb * 0.6;
    if (dryGainRef.current) dryGainRef.current.gain.value = 1 - totalReverb * 0.3;
  }, []);

  return {
    isLiveMonitoring,
    connectLivePreview,
    disconnectLivePreview,
    updateOptions,
  };
};
