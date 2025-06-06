// js/themeToggle.js
// Simple theme toggle for dark mode

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('themeToggle');
  if (!button) return;

  button.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = button.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });
});
