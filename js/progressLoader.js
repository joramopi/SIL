class ProgressLoader {
    constructor(duration = 12000) {
        this.duration = duration;
        this.progress = 0;
        this.animationFrame = null;
        this.progressBar = DOMUtils.safeQuerySelector('#progressBar');
        this.ringBar = DOMUtils.safeQuerySelector('.ring-bar');
        this.percentage = DOMUtils.safeQuerySelector('#percentage');
        this.loadingText = DOMUtils.safeQuerySelector('#loadingText');
        this.overlay = DOMUtils.safeQuerySelector('#progressOverlay');
        this.messages = [
            'Iniciando sistema',
            'Cargando componentes',
            'Conectando base de datos',
            'Verificando permisos',
            'Configurando interfaz',
            'Optimizando rendimiento',
            'Preparando dashboard',
            'Finalizando carga'
        ];
        if (this.ringBar) {
            this.ringTotal = this.ringBar.getTotalLength();
            this.ringBar.style.strokeDasharray = this.ringTotal;
            this.ringBar.style.strokeDashoffset = this.ringTotal;
        }
        this.setProgress(0);
        this.createParticles();
    }

    createParticles() {
        const particlesContainer = DOMUtils.safeQuerySelector('#particles');
        if (!particlesContainer) return;
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            const leftPosition = Math.random() * 100;
            const animationDelay = Math.random() * 6;
            const animationDuration = Math.random() * 3 + 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${leftPosition}%`;
            particle.style.animationDelay = `${animationDelay}s`;
            particle.style.animationDuration = `${animationDuration}s`;
            particlesContainer.appendChild(particle);
        }
    }

    setProgress(value) {
        const percent = Math.min(Math.floor(value), 100);
        if (this.progressBar) this.progressBar.style.width = `${percent}%`;
        if (this.ringBar) {
            const offset = this.ringTotal * (1 - percent / 100);
            this.ringBar.style.strokeDashoffset = offset;
        }
        if (this.percentage) this.percentage.textContent = `${percent}%`;
        const index = Math.floor((percent / 100) * (this.messages.length - 1));
        const msg = this.messages[index] || this.messages[0];
        if (this.loadingText) {
            if (percent < 100) {
                this.loadingText.innerHTML = `${msg}<span class="dots"></span>`;
            } else {
                this.loadingText.textContent = '¡Completado!';
            }
        }
        this.progress = percent;
    }

    start() {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / this.duration) * 100, 100);

            let adjusted = progress;
            if (progress > 20 && progress < 30) {
                adjusted = 20 + (progress - 20) * 0.3;
            } else if (progress > 60 && progress < 80) {
                adjusted = 60 + (progress - 60) * 0.5;
            }

            this.setProgress(adjusted);

            if (progress < 100) {
                this.animationFrame = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    finish() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.setProgress(100);
        if (this.overlay) {
            // Add delay so the loading card remains visible a bit longer
            setTimeout(() => {
                this.overlay.classList.add('fade-out');
                setTimeout(() => {
                    this.overlay.style.display = 'none';
                }, 500);
            }, 3000); // extra time to read messages
        }
    }

    async revealWhenReady(selector, promise) {
        const section = DOMUtils.safeQuerySelector(selector);
        if (!section) return;
        section.classList.add('hidden-section');
        try {
            await promise;
        } finally {
            section.classList.add('fade-in-section');
            section.classList.remove('hidden-section');
        }
    }
}

window.ProgressLoader = ProgressLoader;

