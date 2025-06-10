const FivePPanel = {
  init(data, filterManager = window.filterManagerInstance) {
    this.data = data || [];
    this.filterManager = filterManager;
    this.images = Array.from(document.querySelectorAll('#fivepCard img'));
    this.footerEl = document.getElementById('fivepFooter');
    this.activeP = null;

    this.images.forEach(img => {
      img.addEventListener('click', () => {
        const label = img.getAttribute('data-label') || img.alt || '';
        if (this.footerEl) {
          this.footerEl.textContent = label;
        }
        this.toggleP(label);
      });
    });

    this.highlightForData(this.data);
  },

  extractPSet(dataset) {
    const set = new Set();
    dataset.forEach(ind => {
      const p1 = DataUtils.getFieldValue(ind, '5P1', '').trim();
      const p2 = DataUtils.getFieldValue(ind, '5P2', '').trim();
      if (p1) set.add(p1);
      if (p2) set.add(p2);
    });
    return set;
  },

  highlightForData(dataset) {
    const set = this.extractPSet(dataset);
    this.images.forEach(img => {
      const label = img.getAttribute('data-label') || img.alt || '';
      if (set.has(label)) {
        img.classList.add('encendido');
        img.classList.remove('apagado');
      } else {
        img.classList.remove('encendido');
        img.classList.add('apagado');
      }
      if (this.activeP === label) {
        img.classList.add('encendido');
      } else if (this.activeP) {
        img.classList.add('dimmed');
      } else {
        img.classList.remove('dimmed');
      }
    });

    if (this.activeP && !set.has(this.activeP)) {
      const pToClear = this.activeP;
      this.activeP = null;
      setTimeout(() => {
        if (this.filterManager) {
          this.filterManager.handleFilterChange('fivep', '');
        }
        if (this.footerEl) {
          this.footerEl.textContent = pToClear;
        }
      }, 0);
    }
  },

  toggleP(label) {
    if (this.activeP === label) {
      this.activeP = null;
      if (this.filterManager) {
        this.filterManager.handleFilterChange('fivep', '');
      }
    } else {
      this.activeP = label;
      if (this.filterManager) {
        this.filterManager.handleFilterChange('fivep', label);
      }
    }
    this.updateSelectedStyles();
  },

  updateSelectedStyles() {
    this.images.forEach(img => {
      const label = img.getAttribute('data-label') || img.alt || '';
      if (this.activeP === label) {
        img.classList.add('encendido');
        img.classList.remove('apagado');
        img.classList.remove('dimmed');
      } else if (this.activeP) {
        img.classList.add('dimmed');
      } else {
        img.classList.remove('dimmed');
      }
    });
  }
};

window.FivePPanel = FivePPanel;
