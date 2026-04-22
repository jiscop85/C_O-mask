import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, AudioWaveform, Upload, Play, Pause, Download, 
  Sparkles, Settings2, History, Trash2, Radio, Activity, Waves, 
  Music2, Loader2, CheckCircle2, FileAudio, X, Headphones, HeadphoneOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTransformationHistory } from '@/hooks/useTransformationHistory';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';
import { useLiveVoicePreview } from '@/hooks/useLiveVoicePreview';
import BatchAudioProcessor from '@/components/BatchAudioProcessor';

const voiceModels = [
  { id: 'default', name: 'Natural', namePersian: 'طبیعی', description: 'Your original voice enhanced', icon: '🎤', color: 'from-blue-500 to-cyan-500' },
  { id: 'deep', name: 'Deep Voice', namePersian: 'صدای بم', description: 'Lowered pitch, fuller tone', icon: '🔊', color: 'from-indigo-500 to-purple-500' },
  { id: 'high', name: 'High Voice', namePersian: 'صدای زیر', description: 'Higher pitch, brighter tone', icon: '✨', color: 'from-pink-500 to-rose-500' },
  { id: 'robot', name: 'Robotic', namePersian: 'رباتیک', description: 'Futuristic synthetic voice', icon: '🤖', color: 'from-emerald-500 to-teal-500' },
  { id: 'whisper', name: 'Whisper', namePersian: 'زمزمه', description: 'Soft, intimate whisper', icon: '🌙', color: 'from-violet-500 to-purple-500' },
  { id: 'echo', name: 'Echo Chamber', namePersian: 'اکو', description: 'Spacious reverb effect', icon: '🎭', color: 'from-amber-500 to-orange-500' },
];

const VoiceChanger = () => {
  const { user } = useAuth();
  const { history, addRecord, deleteRecord } = useTransformationHistory();
  const { 
    isProcessing: audioProcessing, 
    processedAudioUrl, 
    isPlaying: audioPlaying, 
    processAudio, 
    togglePlayback, 
    downloadProcessedAudio 
  } = useAudioProcessor();

  const {
    isLiveMonitoring,
    connectLivePreview,
    disconnectLivePreview,
    updateOptions,
  } = useLiveVoicePreview();
  
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState('default');
  const [pitch, setPitch] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [reverb, setReverb] = useState(20);
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(64).fill(0));
  const [recordingTime, setRecordingTime] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showBatchProcessor, setShowBatchProcessor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time audio visualization
  const updateAudioData = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Normalize and smooth the data
      const normalizedData = Array.from(dataArray.slice(0, 64)).map(v => v / 255);
      setAudioData(normalizedData);
    }
    
    if (isRecording) {
      animationRef.current = requestAnimationFrame(updateAudioData);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      mediaStreamRef.current = stream;
      
      // Set up audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setRecordedBlob(blob);
          setHasRecording(true);
          setUploadedFileName(null);
        }
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Connect live voice preview if enabled
      if (livePreviewEnabled) {
        connectLivePreview(stream, { pitch, speed, reverb, voiceModel: selectedModel });
      }
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start visualization
      updateAudioData();
      
      toast.success(livePreviewEnabled ? 'Recording with live preview - listen through your headphones' : 'Recording started - Speak into your microphone');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Disconnect live preview
    disconnectLivePreview();
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    setAudioData(new Array(64).fill(0));
    toast.success('Recording stopped');
  };

  // Update live preview when controls change during recording
  useEffect(() => {
    if (isRecording && isLiveMonitoring) {
      updateOptions({ pitch, speed, reverb, voiceModel: selectedModel });
    }
  }, [pitch, speed, reverb, selectedModel, isRecording, isLiveMonitoring, updateOptions]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = /\.(mp3|wav|ogg|webm|m4a|aac|flac|wma)$/i;
    if (!validExtensions.test(file.name)) {
      toast.error('Please upload a valid audio file (MP3, WAV, OGG, WebM, M4A, AAC, FLAC, WMA)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    // Get audio duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      const duration = Math.floor(audio.duration);
      setRecordingTime(duration);
      URL.revokeObjectURL(audio.src);
    };

    setRecordedBlob(file);
    setHasRecording(true);
    setUploadedFileName(file.name);
    toast.success(`Loaded: ${file.name}`);
  };

  // Clear current audio
  const clearAudio = () => {
    setRecordedBlob(null);
    setHasRecording(false);
    setUploadedFileName(null);
    setRecordingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Audio cleared');
  };

  const processVoice = async () => {
    if (!hasRecording || !recordedBlob) {
      toast.error('Please record audio first');
      return;
    }
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      // Real audio processing with WebAudio API
      const processedBlob = await processAudio(recordedBlob, {
        pitch,
        speed,
        reverb,
        voiceModel: selectedModel,
      });
      
      const processingTime = Date.now() - startTime;
      
      if (processedBlob) {
        // Save to history
        await addRecord({
          transformation_type: 'voice_change',
          source_image_url: null,
          target_image_url: null,
          result_url: null,
          processing_time_ms: processingTime,
          processing_mode: 'client',
          metadata: { 
            model: selectedModel, 
            pitch, 
            speed, 
            reverb,
            duration: recordingTime 
          }
        });
        
        toast.success('Voice transformed successfully! Click Preview to listen.');
      } else {
        toast.error('Failed to process audio');
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    const modelName = voiceModels.find(m => m.id === selectedModel)?.name || 'transformed';
    downloadProcessedAudio(`${modelName.toLowerCase()}-voice.wav`);
    toast.success('Audio downloaded!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const voiceHistory = history.filter(h => h.transformation_type === 'voice_change');

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Animated Background */}
      <div className="mesh-gradient" />
      <div className="grid-overlay" />
      
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1" style={{ background: 'radial-gradient(circle, hsl(38 92% 50% / 0.3) 0%, transparent 70%)' }} />
        <div className="floating-orb orb-2" style={{ background: 'radial-gradient(circle, hsl(280 70% 50% / 0.25) 0%, transparent 70%)' }} />
        <div className="floating-orb orb-3" style={{ background: 'radial-gradient(circle, hsl(180 80% 50% / 0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Music2 className="w-4 h-4 text-accent" />
            <span className="text-sm tech-text text-muted-foreground">RVC POWERED TRANSFORMATION</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            VOICE <span className="text-accent gold-glow">TRANSFORMER</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Transform your voice into any character with real-time processing. 
            Choose from multiple voice models powered by RVC technology.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2" dir="rtl">
            صدای خود را به هر شخصیتی با پردازش لحظه‌ای تبدیل کنید
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Voice Models */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="neon-card p-6">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2 mb-6">
                <AudioWaveform className="w-5 h-5 text-accent" />
                VOICE MODELS
              </h2>

              <div className="space-y-3">
                {voiceModels.map((model, index) => (
                  <motion.button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.3 }}
                    className={`w-full p-4 rounded-xl text-left transition-all relative overflow-hidden group ${
                      selectedModel === model.id
                        ? 'border-2 border-accent/50'
                        : 'border border-border/50 hover:border-accent/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${model.color} opacity-${selectedModel === model.id ? '20' : '0'} group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center text-lg`}>
                        {model.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-foreground">{model.name}</h3>
                          {selectedModel === model.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 rounded-full bg-accent"
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground/70" dir="rtl">{model.namePersian}</p>
                        <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Upload Custom Model */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-file-upload"
                />
                <motion.button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-all flex flex-col items-center gap-2 group"
                  whileHover={{ scale: 1.02, borderColor: 'hsl(var(--accent))' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <FileAudio className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground">Upload Audio File</span>
                  <span className="text-xs text-muted-foreground/70">MP3, WAV, OGG, M4A (max 50MB)</span>
                  <span className="text-xs text-muted-foreground/70" dir="rtl">آپلود فایل صوتی</span>
                </motion.button>
              </div>
            </div>

            {/* Batch Processing Toggle */}
            <motion.button
              onClick={() => setShowBatchProcessor(!showBatchProcessor)}
              className="w-full neon-card p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-3">
                <FileAudio className="w-5 h-5 text-accent" />
                <span className="font-display text-foreground">BATCH PROCESSING</span>
              </div>
              <span className="text-sm text-muted-foreground">Multiple files</span>
            </motion.button>

            {/* History Toggle */}
            <motion.button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full neon-card p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-accent" />
                <span className="font-display text-foreground">HISTORY</span>
              </div>
              <span className="text-sm text-muted-foreground">{voiceHistory.length} items</span>
            </motion.button>
          </motion.div>

          {/* Main Controls */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="neon-card p-8">
              {/* Recording Section */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative">
                  {/* Pulse rings when recording */}
                  {isRecording && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-destructive/50"
                        animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-destructive/50"
                        animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                      />
                    </>
                  )}
                  
                  <motion.button
                    onClick={toggleRecording}
                    className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-gradient-to-br from-destructive to-red-600'
                        : 'bg-gradient-to-br from-accent to-amber-600 hover:shadow-[0_0_50px_hsl(var(--accent)/0.5)]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-2 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
                      {isRecording ? (
                        <MicOff className="w-14 h-14 text-white" />
                      ) : (
                        <Mic className="w-14 h-14 text-white" />
                      )}
                    </div>
                  </motion.button>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-lg text-foreground font-medium">
                    {isRecording ? (
                      <span className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-destructive animate-pulse" />
                        Recording... {formatTime(recordingTime)}
                      </span>
                    ) : hasRecording ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {uploadedFileName ? (
                          <span className="flex items-center gap-2">
                            <FileAudio className="w-4 h-4" />
                            {uploadedFileName.slice(0, 20)}{uploadedFileName.length > 20 ? '...' : ''} ({formatTime(recordingTime)})
                            <button onClick={clearAudio} className="p-1 hover:bg-destructive/20 rounded">
                              <X className="w-3 h-3 text-destructive" />
                            </button>
                          </span>
                        ) : (
                          <>Recording ready ({formatTime(recordingTime)})</>
                        )}
                      </span>
                    ) : (
                      'Click to start recording'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1" dir="rtl">
                    {isRecording ? 'در حال ضبط...' : hasRecording ? 'ضبط آماده است' : 'کلیک کنید تا ضبط شروع شود'}
                  </p>
                </div>

                {/* Live Preview Toggle */}
                <motion.button
                  onClick={() => {
                    setLivePreviewEnabled(!livePreviewEnabled);
                    toast.info(livePreviewEnabled ? 'Live preview disabled' : 'Live preview enabled - use headphones to avoid feedback!');
                  }}
                  className={`mt-4 px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all ${
                    livePreviewEnabled
                      ? 'bg-accent/20 border border-accent/50 text-accent'
                      : 'bg-secondary/50 border border-border/50 text-muted-foreground hover:border-accent/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {livePreviewEnabled ? <Headphones className="w-4 h-4" /> : <HeadphoneOff className="w-4 h-4" />}
                  {livePreviewEnabled ? 'Live Monitor ON' : 'Live Monitor OFF'}
                  {isLiveMonitoring && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </motion.button>
              </div>

              {/* Waveform Visualization */}
              <div className="relative h-32 rounded-2xl bg-gradient-to-br from-secondary via-secondary/50 to-transparent border border-border/50 mb-8 overflow-hidden">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-full border-t border-border/50" style={{ top: `${(i + 1) * 12.5}%` }} />
                  ))}
                </div>
                
                {/* Waveform bars */}
                <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-4">
                  {audioData.map((value, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-full"
                      style={{
                        background: `linear-gradient(180deg, hsl(${38 + i * 2} 92% 50%), hsl(${38 + i * 2} 70% 30%))`,
                        boxShadow: value > 0.3 ? `0 0 10px hsl(${38 + i * 2} 92% 50% / 0.5)` : 'none',
                      }}
                      animate={{
                        height: isRecording ? `${Math.max(10, value * 100)}%` : `${10 + Math.sin(i * 0.3 + Date.now() * 0.001) * 5}%`,
                      }}
                      transition={{ duration: 0.05 }}
                    />
                  ))}
                </div>
                
                {/* Center line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-accent/30" />
                
                {/* Label */}
                <div className="absolute top-3 left-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground tech-text">
                    {isRecording ? 'LIVE AUDIO' : 'WAVEFORM'}
                  </span>
                </div>
              </div>

              {/* Voice Controls */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Pitch */}
                <div className="neon-card p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Waves className="w-4 h-4 text-blue-400" />
                      </div>
                      <label className="text-sm text-foreground tech-text">PITCH</label>
                    </div>
                    <span className="text-lg font-bold text-blue-400 tech-text">{pitch}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, hsl(210 80% 50%) ${pitch}%, hsl(var(--secondary)) ${pitch}%)`
                    }}
                  />
                </div>

                {/* Speed */}
                <div className="neon-card p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-400" />
                      </div>
                      <label className="text-sm text-foreground tech-text">SPEED</label>
                    </div>
                    <span className="text-lg font-bold text-green-400 tech-text">{speed}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, hsl(142 70% 45%) ${speed}%, hsl(var(--secondary)) ${speed}%)`
                    }}
                  />
                </div>

                {/* Reverb */}
                <div className="neon-card p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                      <label className="text-sm text-foreground tech-text">REVERB</label>
                    </div>
                    <span className="text-lg font-bold text-purple-400 tech-text">{reverb}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={reverb}
                    onChange={(e) => setReverb(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, hsl(280 70% 50%) ${reverb}%, hsl(var(--secondary)) ${reverb}%)`
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  onClick={processVoice}
                  disabled={!hasRecording || isProcessing}
                  className="col-span-2 cinema-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <span>{isProcessing ? 'PROCESSING...' : 'TRANSFORM VOICE'}</span>
                </motion.button>
                
                <motion.button
                  onClick={togglePlayback}
                  disabled={!processedAudioUrl}
                  className="px-6 py-4 rounded-xl bg-accent text-accent-foreground flex items-center justify-center gap-2 hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {audioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span className="font-display tracking-wider text-sm">
                    {audioPlaying ? 'PAUSE' : 'PREVIEW'}
                  </span>
                </motion.button>
                
                <motion.button 
                  onClick={handleDownload}
                  disabled={!processedAudioUrl}
                  className="px-6 py-4 rounded-xl bg-secondary text-foreground flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-5 h-5" />
                  <span className="font-display tracking-wider text-sm">SAVE</span>
                </motion.button>
              </div>

              {/* Info Panel */}
              <motion.div 
                className="mt-8 p-6 rounded-2xl holographic border border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground mb-2">POWERED BY RVC TECHNOLOGY</h3>
                    <p className="text-sm text-muted-foreground">
                      Using Retrieval-based Voice Conversion for high-quality real-time voice transformation. 
                      Works with any microphone input. Model: <span className="text-accent">{voiceModels.find(m => m.id === selectedModel)?.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2" dir="rtl">
                      استفاده از فناوری RVC برای تبدیل صدای با کیفیت بالا و لحظه‌ای
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Batch Processor Panel */}
        <AnimatePresence>
          {showBatchProcessor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <BatchAudioProcessor
                settings={{ pitch, speed, reverb, voiceModel: selectedModel }}
                processAudioFn={async (blob, settings) => {
                  const result = await processAudio(blob, settings);
                  return result || null;
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && voiceHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <div className="neon-card p-6">
                <h3 className="font-display text-xl text-foreground mb-4">VOICE TRANSFORMATION HISTORY</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {voiceHistory.slice(0, 9).map((record) => {
                    const metadata = record.metadata as Record<string, unknown>;
                    return (
                      <motion.div
                        key={record.id}
                        className="p-4 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-between"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                            <Music2 className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground capitalize">
                              {(metadata?.model as string) || 'Unknown'} Model
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceChanger;
