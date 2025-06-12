const FiveEPDOTPanel = {
  init(data, filterManager = window.filterManagerInstance) {
    this.data = data || [];
    this.filterManager = filterManager;
    this.images = Array.from(document.querySelectorAll('#fiveepdotCard img'));
    this.footerEl = document.getElementById('fiveepdotFooter');
    this.activeE = null;

    this.images.forEach(img => {
      img.addEventListener('click', () => {
        const label = img.getAttribute('data-label') || img.alt || '';
        if (this.footerEl) {
          this.footerEl.textContent = label;
        }
        this.toggleE(label);
      });
    });

    this.highlightForData(this.data);
  },

  normalize(str) {
    return str.toLowerCase().replace(/[-\s]+/g, '');
  },

  extractESet(dataset) {
    const set = new Set();
    dataset.forEach(ind => {
      const eje = DataUtils.getFieldValue(ind, 'epdot', '').trim();
      if (eje) set.add(eje);
    });
    return set;
  },

  highlightForData(dataset) {
    const set = this.extractESet(dataset);
    this.images.forEach(img => {
      const label = img.getAttribute('data-label') || img.alt || '';
      let match = false;
      set.forEach(e => {
        if (this.normalize(e) === this.normalize(label)) match = true;
      });
      if (match) {
        img.classList.add('encendido');
        img.classList.remove('apagado');
      } else {
        img.classList.remove('encendido');
        img.classList.add('apagado');
      }
      if (this.activeE === label) {
        img.classList.add('encendido');
      } else if (this.activeE) {
        img.classList.add('dimmed');
      } else {
        img.classList.remove('dimmed');
      }
    });

    if (this.activeE) {
      let activeMatch = false;
      set.forEach(e => {
        if (this.normalize(e) === this.normalize(this.activeE)) activeMatch = true;
      });
      if (!activeMatch) {
        const eToClear = this.activeE;
        this.activeE = null;
        setTimeout(() => {
          if (this.filterManager) {
            this.filterManager.handleFilterChange('epdot', '');
          }
          if (this.footerEl) {
            this.footerEl.textContent = eToClear;
          }
        }, 0);
      }
    }
  },

  toggleE(label) {
    if (this.activeE === label) {
      this.activeE = null;
      if (this.filterManager) {
        this.filterManager.handleFilterChange('epdot', '');
      }
    } else {
      this.activeE = label;
      if (this.filterManager) {
        this.filterManager.handleFilterChange('epdot', label);
      }
    }
    this.updateSelectedStyles();
  },

  updateSelectedStyles() {
    this.images.forEach(img => {
      const label = img.getAttribute('data-label') || img.alt || '';
      if (this.activeE === label) {
        img.classList.add('encendido');
        img.classList.remove('apagado');
        img.classList.remove('dimmed');
      } else if (this.activeE) {
        img.classList.add('dimmed');
      } else {
        img.classList.remove('dimmed');
      }
    });
  }
};

window.FiveEPDOTPanel = FiveEPDOTPanel;
