document.addEventListener('DOMContentLoaded', () => {
  const tasks = [
    { text: 'Actualizar indicadores', done: false },
    { text: 'Revisar fuentes de datos', done: true },
    { text: 'Preparar informe mensual', done: false }
  ];

  const list = document.getElementById('taskList');
  if (list) {
    tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.innerHTML = `<label><input type="checkbox" ${t.done ? 'checked' : ''}> ${t.text}</label>`;
      list.appendChild(li);
    });
  }

  renderCalendar();
});

function renderCalendar() {
  const container = document.getElementById('calendarContainer');
  if (!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const table = document.createElement('table');
  table.className = 'calendar-table';

  const caption = document.createElement('caption');
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  caption.textContent = `${monthNames[month]} ${year}`;
  table.appendChild(caption);

  const headerRow = document.createElement('tr');
  ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].forEach(d => {
    const th = document.createElement('th');
    th.textContent = d;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  let row = document.createElement('tr');
  for (let i=0; i<firstDay; i++) {
    row.appendChild(document.createElement('td'));
  }

  for (let day=1; day<=daysInMonth; day++) {
    if (row.children.length === 7) {
      table.appendChild(row);
      row = document.createElement('tr');
    }
    const td = document.createElement('td');
    td.textContent = day;
    row.appendChild(td);
  }

  while (row.children.length < 7) {
    row.appendChild(document.createElement('td'));
  }
  table.appendChild(row);

  container.appendChild(table);
}
