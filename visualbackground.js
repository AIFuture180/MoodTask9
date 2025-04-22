// Add this to your HTML file (index.html) in the head section
// <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

// Create a new file called visualBackground.js with this content:

class MeditationVisual {
  constructor(containerId, audioElement) {
    this.container = document.getElementById(containerId);
    this.audio = audioElement;
    
    // Set up scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    
    // Audio analyzer
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    // Connect audio
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    
    // Create data array for frequency analysis
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Setup visualization elements
    this.setupParticles();
    
    // Position camera
    this.camera.position.z = 30;
    
    // Handle resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start animation
    this.animate();
  }
  
  setupParticles() {
    // Create particle system for a calm, meditative visual
    this.particles = new THREE.Group();
    this.scene.add(this.particles);
    
    // Create particles with different colors based on themes
    const particleCount = 300;
    const themes = {
      'Chinese music': 0xff0000, // Red theme
      'Light Rain': 0x00aaff,    // Blue theme
      'Spring Day Forest': 0x00ff44, // Green theme
      'Waves Crashing': 0x0066ff // Dark blue theme
    };
    
    // Get current theme based on audio filename
    let currentTheme = 0x6666ff; // Default purple theme
    for (const [key, color] of Object.entries(themes)) {
      if (this.audio.src.includes(key.replace(/\s+/g, ''))) {
        currentTheme = color;
        break;
      }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: currentTheme,
        transparent: true,
        opacity: 0.7
      });
      
      const particle = new THREE.Mesh(geometry, material);
      
      // Position particles in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 15;
      
      particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
      particle.position.y = radius * Math.sin(theta) * Math.sin(phi);
      particle.position.z = radius * Math.cos(theta);
      
      // Add some properties for animation
      particle.userData = {
        theta: theta,
        phi: phi,
        radius: radius,
        speed: 0.002 + Math.random() * 0.003,
        amplitude: 0.2 + Math.random() * 0.5
      };
      
      this.particles.add(particle);
    }
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Average frequency value (0-255)
    let avg = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      avg += this.dataArray[i];
    }
    avg /= this.dataArray.length;
    
    // Normalize to 0-1
    const intensity = avg / 255;
    
    // Update particles based on audio
    this.particles.children.forEach((p, i) => {
      const { theta, phi, radius, speed, amplitude } = p.userData;
      
      // Slightly update position based on audio intensity
      const offset = Math.sin(Date.now() * speed) * amplitude * (intensity + 0.2);
      
      p.position.x = radius * Math.sin(theta + offset) * Math.cos(phi);
      p.position.y = radius * Math.sin(theta + offset) * Math.sin(phi);
      p.position.z = radius * Math.cos(theta + offset);
      
      // Scale size based on audio intensity
      const scale = 0.8 + intensity * 0.5;
      p.scale.set(scale, scale, scale);
      
      // Update opacity based on intensity and position
      p.material.opacity = 0.3 + intensity * 0.4;
    });
    
    // Rotate the entire particle system slowly
    this.particles.rotation.y += 0.002;
    
    this.renderer.render(this.scene, this.camera);
  }
  
  // Method to update theme based on audio track
  updateTheme() {
    const themes = {
      'Chinese music': 0xff0000, // Red theme
      'Light Rain': 0x00aaff,    // Blue theme
      'Spring Day Forest': 0x00ff44, // Green theme
      'Waves Crashing': 0x0066ff // Dark blue theme
    };
    
    // Get current theme based on audio filename
    let currentTheme = 0x6666ff; // Default purple theme
    for (const [key, color] of Object.entries(themes)) {
      if (this.audio.src.includes(key.replace(/\s+/g, ''))) {
        currentTheme = color;
        break;
      }
    }
    
    // Update all particles to the new theme color
    this.particles.children.forEach(p => {
      p.material.color.setHex(currentTheme);
    });
  }
}
