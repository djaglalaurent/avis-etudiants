document.addEventListener('DOMContentLoaded', () => {
  let participants = JSON.parse(localStorage.getItem('participants')) || [];

  const form = document.getElementById('picnicForm');
  const conf = document.getElementById('confirmation');
  const adminList = document.getElementById('adminList');
  const searchInput = document.getElementById('searchName');

  function save() {
    localStorage.setItem('participants', JSON.stringify(participants));
  }

  function clearAdminList() {
    adminList.innerHTML = '';
  }

  // --- FORMULAIRE ---
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // récupération de toutes les valeurs
      const nom = document.getElementById('nom')?.value.trim();
      const prenom = document.getElementById('prenom')?.value.trim();
      const filiere = document.getElementById('filiere')?.value;
      const telephone = document.getElementById('telephone')?.value.trim();
      const montant = document.getElementById('montant')?.value;

      // vérification simple avant ajout
      if (!nom || !prenom) {
        alert('Veuillez remplir au moins le nom et le prénom');
        return;
      }

      const participant = { nom, prenom, filiere, telephone, montant };

      participants.push(participant);
      save();

      form.reset();

      // affichage confirmation bref
      if (conf) {
        conf.classList.remove('hidden');
        setTimeout(() => conf.classList.add('hidden'), 4000);
      }

      clearAdminList();
    });
  }

  // --- Recherche ---
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      if (this.value.trim() === '') clearAdminList();
    });
  }

  function renderMatches(matches) {
    adminList.innerHTML = '';
    if (!matches || matches.length === 0) return;

    matches.forEach((item) => {
      const p = item.p;
      const idx = item.index;
      const div = document.createElement('div');
      div.className = 'participant';
      div.innerHTML = `
        <span>${escapeHtml(p.nom)} ${escapeHtml(p.prenom)} - ${escapeHtml(p.filiere)} - ${escapeHtml(p.telephone)} - ${escapeHtml(p.montant)} CFA</span>
        <button class="delete-btn" data-index="${idx}">Supprimer</button>
      `;
      adminList.appendChild(div);
    });
  }

  function performSearchAndRender(query) {
    const q = query.toLowerCase();
    const matches = participants
      .map((p, idx) => ({ p, idx }))
      .filter((item) => (item.p.nom + ' ' + item.p.prenom).toLowerCase().includes(q))
      .map((it) => ({ p: it.p, index: it.idx }));

    if (matches.length === 0) {
      clearAdminList();
      return;
    }

    renderMatches(matches);
  }

  window.searchParticipant = function () {
    const query = searchInput?.value.trim();
    if (!query) return clearAdminList();
    performSearchAndRender(query);
  };

  adminList.addEventListener('click', function (ev) {
    const btn = ev.target.closest('button.delete-btn');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-index'), 10);
    if (Number.isNaN(idx)) return;
    if (!confirm("Voulez-vous vraiment supprimer ce participant ?")) return;

    participants.splice(idx, 1);
    save();

    const currentQuery = searchInput?.value.trim();
    if (!currentQuery) clearAdminList();
    else performSearchAndRender(currentQuery);
  });

  window.exportJSON = function () {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(participants, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'participants.json');
    dlAnchor.click();
  };

  window.exportCSV = function () {
    if (!participants.length) return;
    const headers = ['nom', 'prenom', 'annee', 'telephone', 'montant'];
    const rows = participants.map(p =>
      headers.map(h => `"${(p[h] || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers.join(',') + '\n' + rows);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', csvStr);
    dlAnchor.setAttribute('download', 'participants.csv');
    dlAnchor.click();
  };

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"'`=\/]/g, (s) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }[s]));
  }

  clearAdminList();
});

