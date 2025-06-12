class SilbiAssistant {
  constructor(options = {}) {
    this.messages = [
      "Mi nombre es SILB\xed.",
      "Me agrada mucho que uses nuestro sitio.",
      "Manab\xed es un territorio inteligente.",
      "Lo que no se mide, no se puede mejorar.",
      "Si tienes el dato, hagamos un dashboard.",
      "La informaci\xf3n es poder si se convierte en acci\xf3n.",
      "\xbfTienes un registro administrativo? \xa1Yo lo digitalizo!",
      "\xa1Juntos, medimos para transformar!",
    ];

    this.emoticons = ["😊", "😄", "😎", "🤓", "🤖", "🙌", "🧠", "📊"];

    this.bubble = document.getElementById("silbi-bubble");
    this.messageSpan = document.getElementById("silbi-message");
    this.closeButton = document.getElementById("silbi-close");
    this.character = document.getElementById("silbi-character");
    this.emote = document.getElementById("silbi-emote");
    this.sound = document.getElementById("emote-sound");

    this.index = 0;
    this.hideTimeout = null;
    this.messageInterval = null;

    this.vibrate = options.vibrate !== false;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.bindEvents();
  }

  bindEvents() {
    this.closeButton.addEventListener("click", () => this.hideBubble());
    this.character.addEventListener("pointerdown", () => this.showRandomEmote());
    this.character.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.showRandomEmote();
      }
    });
  }

  start() {
    if (this.reducedMotion) {
      this.character.style.animation = "none";
    }
    this.showMessage();
    this.messageInterval = setInterval(() => this.showMessage(), 8000);
  }

  showMessage() {
    this.messageSpan.textContent = this.messages[this.index];
    this.showBubble();
    this.index = (this.index + 1) % this.messages.length;
  }

  showBubble() {
    this.bubble.classList.add("show");
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => this.bubble.classList.remove("show"), 6000);
  }

  hideBubble() {
    this.bubble.classList.remove("show");
    clearTimeout(this.hideTimeout);
  }

  showRandomEmote() {
    const random = this.emoticons[Math.floor(Math.random() * this.emoticons.length)];
    this.emote.textContent = random;
    this.emote.style.animation = "none";
    void this.emote.offsetWidth; // restart animation
    this.emote.style.animation = "zoomEffect 2s ease-in-out forwards";
    if (this.vibrate && navigator.vibrate) {
      navigator.vibrate(50);
    }
    if (!this.reducedMotion) {
      this.sound.currentTime = 0;
      this.sound.play();
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const assistant = new SilbiAssistant();
  assistant.start();
  window.SilbiAssistant = assistant;
});
