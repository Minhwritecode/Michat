export function createPeerConnection({ onTrack, onIceCandidate }) {
    const pc = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ]
    });

    pc.ontrack = (event) => {
        if (onTrack) onTrack(event);
    };

    pc.onicecandidate = (event) => {
        if (event.candidate && onIceCandidate) {
            onIceCandidate(event.candidate);
        }
    };

    pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
    };

    return pc;
}

export async function getUserMedia(constraints) {
    try {
        return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
        console.error("Error accessing media devices:", error);
        throw error;
    }
}

export function stopStream(stream) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
} 