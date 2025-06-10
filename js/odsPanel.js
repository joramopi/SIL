const ODSPanel = {
  init(data, filterManager = window.filterManagerInstance) {
    this.data = data || [];
    this.filterManager = filterManager;
    this.items = Array.from(document.querySelectorAll('.ods-item'));
    this.titleEl = document.getElementById('ods-title');
    this.descEl = document.getElementById('ods-description');
    this.activeODS = null;
    this.odsInfo = [
      { num:1, title:'Fin de la Pobreza', desc:'Fin de la pobreza en todas sus formas en todo el mundo.' },
      { num:2, title:'Hambre Cero', desc:'Poner fin al hambre, lograr la seguridad alimentaria y la mejora de la nutrición.' },
      { num:3, title:'Salud y Bienestar', desc:'Garantizar una vida sana y promover el bienestar para todos.' },
      { num:4, title:'Educación de Calidad', desc:'Garantizar una educación inclusiva y equitativa de calidad.' },
      { num:5, title:'Igualdad de Género', desc:'Lograr la igualdad entre los géneros y empoderar a todas las mujeres y niñas.' },
      { num:6, title:'Agua Limpia y Saneamiento', desc:'Garantizar la disponibilidad de agua y su gestión sostenible.' },
      { num:7, title:'Energía Asequible', desc:'Garantizar el acceso a una energía asequible, segura, sostenible y moderna.' },
      { num:8, title:'Trabajo Decente', desc:'Promover el crecimiento económico sostenido y el trabajo decente.' },
      { num:9, title:'Industria e Innovación', desc:'Construir infraestructuras resilientes y fomentar la innovación.' },
      { num:10, title:'Reducción de Desigualdades', desc:'Reducir la desigualdad en y entre los países.' },
      { num:11, title:'Ciudades Sostenibles', desc:'Lograr que las ciudades sean inclusivas, seguras y sostenibles.' },
      { num:12, title:'Producción Responsable', desc:'Garantizar modalidades de consumo y producción sostenibles.' },
      { num:13, title:'Acción por el Clima', desc:'Adoptar medidas urgentes para combatir el cambio climático.' },
      { num:14, title:'Vida Submarina', desc:'Conservar y utilizar sosteniblemente los océanos y mares.' },
      { num:15, title:'Vida Terrestre', desc:'Gestionar sosteniblemente los bosques y luchar contra la desertificación.' },
      { num:16, title:'Paz y Justicia', desc:'Promover sociedades pacíficas e inclusivas.' },
      { num:17, title:'Alianzas', desc:'Fortalecer los medios de implementación y revitalizar la alianza global.' }
    ];
    this.items.forEach(item => {
      item.addEventListener('click', () => {
        const num = parseInt(item.dataset.num, 10);
        this.toggleODS(num);
        this.showInfo(num);
      });
    });
    this.markInactive();
    this.highlightForData(this.data);
  },
  extractODSSet(dataset) {
    const set = new Set();
    dataset.forEach(ind => {
      for (let i = 1; i <= 6; i++) {
        const val = ind[`ODS${i}`];
        if (val) {
          const m = val.match(/ODS\s*(\d+)/i);
          if (m) set.add(parseInt(m[1], 10));
        }
      }
    });
    return set;
  },
  markInactive() {
    const activeSet = this.extractODSSet(this.data);
    this.items.forEach(el => {
      const num = parseInt(el.dataset.num, 10);
      if (!activeSet.has(num)) {
        el.classList.add('inactive');
      } else {
        el.classList.remove('inactive');
      }
    });
  },
  highlightForData(dataset) {
    const set = this.extractODSSet(dataset);
    this.items.forEach(el => {
      const num = parseInt(el.dataset.num, 10);
      if (set.has(num)) {
        el.classList.add('highlight');
        el.classList.remove('inactive');
      } else {
        el.classList.remove('highlight');
        el.classList.add('inactive');
      }
      if (this.activeODS === num) {
        el.classList.add('highlight');
      }
    });

    if (this.activeODS && !set.has(this.activeODS)) {
      const odsToClear = this.activeODS;
      this.activeODS = null;
      // Clear ODS filter asynchronously to avoid recursion
      setTimeout(() => {
        if (this.filterManager) {
          this.filterManager.handleFilterChange('ods', '');
        }
        this.showInfo(odsToClear);
      }, 0);
    }

    this.updateSelectedStyles();
  },

  toggleODS(num) {
    if (this.activeODS === num) {
      this.activeODS = null;
      if (this.filterManager) {
        this.filterManager.handleFilterChange('ods', '');
      }
    } else {
      this.activeODS = num;
      if (this.filterManager) {
        this.filterManager.handleFilterChange('ods', String(num));
      }
    }
    this.updateSelectedStyles();
  },

  updateSelectedStyles() {
    this.items.forEach(el => {
      const num = parseInt(el.dataset.num, 10);
      if (this.activeODS === num) {
        el.classList.add('highlight');
        el.classList.remove('dimmed');
      } else {
        el.classList.remove('highlight');
        if (this.activeODS !== null) {
          el.classList.add('dimmed');
        } else {
          el.classList.remove('dimmed');
        }
      }
    });
  },
  showInfo(num) {
    const ods = this.odsInfo.find(o => o.num === num);
    if (ods) {
      if (this.titleEl) this.titleEl.textContent = `ODS ${ods.num}: ${ods.title}`;
      if (this.descEl) this.descEl.textContent = ods.desc;
    }
  }
};

window.ODSPanel = ODSPanel;
