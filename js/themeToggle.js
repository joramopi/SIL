// js/themeToggle.js
// Simple theme toggle for dark mode

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('themeToggle');
  if (!button) return;

  button.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
});
