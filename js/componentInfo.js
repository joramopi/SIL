// js/componentInfo.js

// Muestra información adicional sobre los componentes

document.addEventListener('DOMContentLoaded', () => {
  const infoBtns = document.querySelectorAll('#componentInfoBtn, .component-info-btn');
  const overlay = document.getElementById('componentInfoOverlay');
  const closeBtn = document.getElementById('componentInfoClose');

  if (!overlay || !closeBtn || infoBtns.length === 0) return;

  infoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.style.display = 'flex';
    });
  });

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
});
