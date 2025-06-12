// js/componentInfo.js

// Muestra información adicional sobre los componentes

document.addEventListener('DOMContentLoaded', () => {
  const configs = [
    { btn: '#componentInfoBtn', overlay: 'componentInfoOverlay', close: 'componentInfoClose' },
    { btn: '#directionInfoBtn', overlay: 'directionInfoOverlay', close: 'directionInfoClose' },
    { btn: '#themeInfoBtn', overlay: 'themeInfoOverlay', close: 'themeInfoClose' }
  ];

  configs.forEach(cfg => {
    const buttons = document.querySelectorAll(cfg.btn);
    const overlay = document.getElementById(cfg.overlay);
    const closeBtn = document.getElementById(cfg.close);

    if (!overlay || !closeBtn || buttons.length === 0) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.style.display = 'flex';
      });
    });

    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  });

  document.querySelectorAll('.component-info-btn').forEach(btn => {
    const target = btn.dataset.target || 'componentInfoOverlay';
    const overlay = document.getElementById(target);
    if (!overlay) return;
    const closeBtn = overlay.querySelector('.info-close');
    if (!closeBtn) return;
    btn.addEventListener('click', () => {
      overlay.style.display = 'flex';
    });
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  });
});
