import { useRef, useState, useCallback, useEffect } from 'react';

interface AudioProcessorOptions {
  pitch: number; // 0-100, 50 = normal
  speed: number; // 0-100, 50 = normal
  reverb: number; // 0-100
  voiceModel: string;
}

interface ConvolverBuffers {
  [key: string]: AudioBuffer;
}

export const useAudioProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbBuffersRef = useRef<ConvolverBuffers>({});
  
  // Create impulse response for reverb
  const createImpulseResponse = useCallback((duration: number, decay: number, reverse: boolean = false) => {
    if (!audioContextRef.current) return null;
    
    const sampleRate = audioContextRef.current.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContextRef.current.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = reverse ? length - i : i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      }
    }
    
    return impulse;
  }, []);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Process audio with effects
  const processAudio = useCallback(async (
    audioBlob: Blob,
    options: AudioProcessorOptions
  ): Promise<Blob | null> => {
    setIsProcessing(true);
    
    try {
      const audioContext = initAudioContext();
      
      // Decode audio data
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Calculate pitch and speed ratios
      const pitchRatio = 0.5 + (options.pitch / 100); // 0.5 to 1.5
      const speedRatio = 0.5 + (options.speed / 100); // 0.5 to 1.5
      const reverbMix = options.reverb / 100;
      
      // Apply voice model presets
      let finalPitchRatio = pitchRatio;
      let additionalReverb = 0;
      
      switch (options.voiceModel) {
        case 'deep':
          finalPitchRatio = pitchRatio * 0.7;
          break;
        case 'high':
          finalPitchRatio = pitchRatio * 1.4;
          break;
        case 'robot':
          // Robot effect will add distortion
          break;
        case 'whisper':
          finalPitchRatio = pitchRatio * 0.95;
          break;
        case 'echo':
          additionalReverb = 0.5;
          break;
        default:
          break;
      }
      
      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        Math.ceil(audioBuffer.length / speedRatio),
        audioBuffer.sampleRate
      );
      
      // Create source node
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speedRatio * finalPitchRatio;
      
      // Create gain node
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = 1.0;
      
      // Create nodes chain
      let lastNode: AudioNode = source;
      source.connect(gainNode);
      lastNode = gainNode;
      
      // Add robot effect (distortion)
      if (options.voiceModel === 'robot') {
        const distortion = offlineContext.createWaveShaper();
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + 10) * x * 20 * deg) / (Math.PI + 10 * Math.abs(x));
        }
        
        distortion.curve = curve;
        distortion.oversample = '4x';
        lastNode.connect(distortion);
        lastNode = distortion;
      }
      
      // Add reverb using convolver
      if (reverbMix > 0 || additionalReverb > 0) {
        const totalReverb = Math.min(1, reverbMix + additionalReverb);
        
        // Create impulse response
        const impulseLength = 2 + totalReverb * 3; // 2-5 seconds
        const impulseDecay = 2 + totalReverb * 2;
        
        const impulseBuffer = offlineContext.createBuffer(
          2,
          offlineContext.sampleRate * impulseLength,
          offlineContext.sampleRate
        );
        
        for (let channel = 0; channel < 2; channel++) {
          const channelData = impulseBuffer.getChannelData(channel);
          for (let i = 0; i < channelData.length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, impulseDecay);
          }
        }
        
        const convolver = offlineContext.createConvolver();
        convolver.buffer = impulseBuffer;
        
        const wetGain = offlineContext.createGain();
        wetGain.gain.value = totalReverb;
        
        const dryGain = offlineContext.createGain();
        dryGain.gain.value = 1 - totalReverb * 0.5;
        
        lastNode.connect(convolver);
        convolver.connect(wetGain);
        wetGain.connect(offlineContext.destination);
        
        lastNode.connect(dryGain);
        dryGain.connect(offlineContext.destination);
      } else {
        lastNode.connect(offlineContext.destination);
      }
      
      // Start and render
      source.start(0);
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to WAV blob
      const wavBlob = audioBufferToWav(renderedBuffer);
      
      // Create URL for playback
      const url = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(url);
      
      return wavBlob;
    } catch (error) {
      console.error('Audio processing error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [initAudioContext]);

  // Play processed audio
  const playProcessedAudio = useCallback(async () => {
    if (!processedAudioUrl) return;
    
    try {
      const audioContext = initAudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const response = await fetch(processedAudioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Stop any playing audio
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1.0;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      sourceNodeRef.current = source;
      gainNodeRef.current = gainNode;
      
      source.onended = () => {
        setIsPlaying(false);
      };
      
      source.start(0);
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback error:', error);
    }
  }, [processedAudioUrl, initAudioContext]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
    }
    setIsPlaying(false);
  }, []);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playProcessedAudio();
    }
  }, [isPlaying, stopPlayback, playProcessedAudio]);

  // Download processed audio
  const downloadProcessedAudio = useCallback((filename: string = 'transformed-voice.wav') => {
    if (!processedAudioUrl) return;
    
    const a = document.createElement('a');
    a.href = processedAudioUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [processedAudioUrl]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch (e) {
          // Ignore
        }
      }
      if (processedAudioUrl) {
        URL.revokeObjectURL(processedAudioUrl);
      }
    };
  }, [processedAudioUrl]);

  return {
    isProcessing,
    processedAudioUrl,
    isPlaying,
    processAudio,
    playProcessedAudio,
    stopPlayback,
    togglePlayback,
    downloadProcessedAudio,
  };
};

// Helper function to convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4); // chunk length

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}
