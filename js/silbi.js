// Virtual assistant SILB\xed script
const messages = [
  "Mi nombre es SILB\xed.",
  "Me agrada mucho que uses nuestro sitio.",
  "Manab\xed es un territorio inteligente.",
  "Lo que no se mide, no se puede mejorar.",
  "Si tienes el dato, hagamos un dashboard.",
  "La informaci\xf3n es poder si se convierte en acci\xf3n.",
  "\xbfTienes un registro administrativo? \xa1Yo lo digitalizo!",
  "\xa1Juntos, medimos para transformar!"
];

const emoticons = [
  "😊", "😄", "😎", "🤓", "🤖", "🙌", "🧠", "📊"
];

const bubble = document.getElementById("silbi-bubble");
const messageSpan = document.getElementById("silbi-message");
const closeButton = document.getElementById("silbi-close");
const silbi = document.getElementById("silbi-character");
const emote = document.getElementById("silbi-emote");
const sound = document.getElementById("emote-sound");
let index = 0;
let hideTimeout;

function showMessage() {
  messageSpan.textContent = messages[index];
  bubble.classList.add("show");
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    bubble.classList.remove("show");
  }, 6000);
  index = (index + 1) % messages.length;
}
function cycleMessages() {
  showMessage();
  setInterval(showMessage, 8000);
}
function showRandomEmote() {
  const random = emoticons[Math.floor(Math.random() * emoticons.length)];
  emote.textContent = random;
  emote.style.animation = "none";
  void emote.offsetWidth;
  emote.style.animation = "zoomEffect 2s ease-in-out forwards";
  sound.currentTime = 0;
  sound.play();
}
closeButton.addEventListener("click", () => {
  bubble.classList.remove("show");
  clearTimeout(hideTimeout);
});
silbi.addEventListener("click", showRandomEmote);
window.addEventListener("load", cycleMessages);
