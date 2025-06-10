class ProgressLoader {
    constructor(totalItems) {
        this.totalItems = totalItems || 0;
        this.current = 0;
        this.progressBar = DOMUtils.safeQuerySelector('#progressBar');
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
        this.current = Math.min(value, this.totalItems);
        const percent = this.totalItems > 0 ? Math.floor((this.current / this.totalItems) * 100) : 0;
        if (this.progressBar) this.progressBar.style.width = `${percent}%`;
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
    }

    increment() {
        this.setProgress(this.current + 1);
    }

    finish() {
        this.setProgress(this.totalItems);
        if (this.overlay) {
            // Add delay so the loading card remains visible a bit longer
            setTimeout(() => {
                this.overlay.classList.add('fade-out');
                setTimeout(() => {
                    this.overlay.style.display = 'none';
                }, 500);
            }, 1000); // extra 1 seconds to appreciate progress bar
        }
    }
}

window.ProgressLoader = ProgressLoader;

