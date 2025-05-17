// This file creates a base64-encoded beep sound that can be used in the browser
// It's more reliable than loading an external file and works in all browsers

// Create a beep sound using the Web Audio API
export function createBeepSound(frequency = 1000, duration = 150, volume = 0.5, type = 'sine') {
  try {
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // Create oscillator
    const oscillator = audioCtx.createOscillator();
    oscillator.type = type; // sine, square, sawtooth, triangle
    oscillator.frequency.value = frequency; // value in hertz
    
    // Create gain node (volume control)
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;
    
    // Connect oscillator to gain node and gain node to audio context destination
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Start and stop the oscillator to create a beep
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
    }, duration);
    
    return true;
  } catch (error) {
    console.error('Error creating beep sound:', error);
    return false;
  }
}

// Pre-defined beep sounds
export const beepSounds = {
  // Standard beep for successful scans
  standard: () => createBeepSound(1000, 150, 0.5, 'sine'),
  
  // Higher pitched beep for successful operations
  success: () => createBeepSound(1800, 200, 0.5, 'sine'),
  
  // Lower pitched beep for errors or warnings
  error: () => createBeepSound(300, 300, 0.5, 'square'),
  
  // Double beep for notifications
  notification: () => {
    createBeepSound(1200, 100, 0.3, 'sine');
    setTimeout(() => createBeepSound(1600, 100, 0.3, 'sine'), 150);
  },
  
  // Short click for UI interactions
  click: () => createBeepSound(800, 30, 0.2, 'sine'),
  
  // Barcode scanner simulation
  scanner: () => createBeepSound(2200, 80, 0.4, 'square')
};

export default beepSounds;
