// js/componentInfo.js

// Muestra información adicional sobre los componentes

document.addEventListener('DOMContentLoaded', () => {
  const infoBtn = document.getElementById('componentInfoBtn');
  const overlay = document.getElementById('componentInfoOverlay');
  const closeBtn = document.getElementById('componentInfoClose');

  if (!infoBtn || !overlay || !closeBtn) return;

  infoBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
});
