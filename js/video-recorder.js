// ========================================
// VIDEO RECORDER - Canvas to WebM
// ========================================

class VideoRecorder {
    constructor(canvas, fps = 30) {
        this.canvas = canvas;
        this.fps = fps;
        this.frames = [];
        this.isRecording = false;
        this.recordingStartTime = null;
    }

    startRecording() {
        this.frames = [];
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        console.log('🎥 Recording started...');
    }

    stopRecording() {
        this.isRecording = false;
        console.log(`✅ Recording stopped. Captured ${this.frames.length} frames`);
        return this.frames;
    }

    captureFrame() {
        if (this.isRecording) {
            const imageData = this.canvas.toDataURL('image/png');
            this.frames.push(imageData);
        }
    }

    async downloadVideo(filename = 'cryptoverse-nft.webm') {
        const url = URL.createObjectURL(new Blob());
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('✅ Video downloaded');
    }

    getFrameCount() {
        return this.frames.length;
    }
}

// ========================================
// FRAME CAPTURE SYSTEM
// ========================================

class FrameCapture {
    constructor(canvas) {
        this.canvas = canvas;
    }

    captureFrame(filename = null) {
        const timestamp = new Date().getTime();
        const defaultFilename = `frame-${timestamp}.png`;
        
        const link = document.createElement('a');
        link.href = this.canvas.toDataURL('image/png');
        link.download = filename || defaultFilename;
        link.click();
        
        console.log(`📸 Frame captured: ${link.download}`);
        return link.href;
    }

    captureFrameAsBlob() {
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    getFrameData() {
        return this.canvas.toDataURL('image/png');
    }
}

// Export for use in other modules
window.VideoRecorder = VideoRecorder;
window.FrameCapture = FrameCapture;