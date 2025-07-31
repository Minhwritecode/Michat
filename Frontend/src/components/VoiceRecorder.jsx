import { useState, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const VoiceRecorder = ({ onVoiceMessage }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);
    const streamRef = useRef(null);
    const startTimeRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];

            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(blob);
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            };

            mediaRecorder.start();
            setIsRecording(true);
            startTimeRef.current = Date.now();

            toast.success("Recording started");
        } catch (error) {
            console.error("Failed to start recording:", error);
            toast.error("Failed to start recording. Please check microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            streamRef.current?.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            toast.success("Recording stopped");
        }
    };

    const playRecording = () => {
        if (audioBlob && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setDuration(0);
        setIsPlaying(false);
    };

    const sendVoiceMessage = () => {
        if (audioBlob) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onVoiceMessage({
                    file: reader.result,
                    type: 'audio',
                    filename: `voice_message_${Date.now()}.wav`,
                    size: audioBlob.size,
                    duration: duration
                });
                deleteRecording();
            };
            reader.readAsDataURL(audioBlob);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4 bg-base-200 rounded-lg">
            {!audioBlob ? (
                <div className="flex items-center gap-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`btn btn-circle ${isRecording ? 'btn-error' : 'btn-primary'}`}
                    >
                        {isRecording ? <Square size={20} /> : <Mic size={20} />}
                    </button>
                    <div className="flex-1">
                        <div className="text-sm font-medium">
                            {isRecording ? "Recording..." : "Tap to record voice message"}
                        </div>
                        {isRecording && (
                            <div className="text-xs opacity-70">
                                Tap square to stop recording
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <button
                        onClick={playRecording}
                        className="btn btn-circle btn-sm"
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    <div className="flex-1">
                        <div className="text-sm font-medium">Voice Message</div>
                        <div className="text-xs opacity-70">
                            Duration: {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={deleteRecording}
                            className="btn btn-circle btn-sm btn-error"
                            title="Delete recording"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button
                            onClick={sendVoiceMessage}
                            className="btn btn-sm btn-primary"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            {audioBlob && (
                <audio
                    ref={audioRef}
                    src={URL.createObjectURL(audioBlob)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
            )}
        </div>
    );
};

export default VoiceRecorder; 