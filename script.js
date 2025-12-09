// script.js — remplace entièrement ton fichier par celui-ci

document.addEventListener('DOMContentLoaded', () => {
  // Chargement des participants depuis localStorage
  let participants = JSON.parse(localStorage.getItem('participants')) || [];

  // Références DOM
  const form = document.getElementById('picnicForm');
  const conf = document.getElementById('confirmation');
  const adminList = document.getElementById('adminList');
  const searchInput = document.getElementById('searchName');

  // Helper : sauvegarder
  function save() {
    localStorage.setItem('participants', JSON.stringify(participants));
  }

  // Helper : vider l'affichage admin
  function clearAdminList() {
    adminList.innerHTML = '';
  }

  // --- FORMULAIRE : ajout d'un participant (ne montre rien côté admin) ---
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const participant = {
      nom: document.getElementById('nom').value.trim(),
      prenom: document.getElementById('prenom').value.trim(),
      annee: document.getElementById('annee_etude').value,
      filiere: document.getElementById('filiere').value,
      telephone: document.getElementById('telephone').value.trim(),
      montant: document.getElementById('montant').value
    };

    participants.push(participant);
    save();

    form.reset();

    // Affichage confirmation bref
    if (conf) {
      conf.classList.remove('hidden');
      setTimeout(() => conf.classList.add('hidden'), 4000);
    }

    // Ne pas afficher la liste automatiquement après soumission
    clearAdminList();
  });

  // --- Quand on vide le champ de recherche on cache la liste immédiatement ---
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      if (this.value.trim() === '') {
        clearAdminList();
      }
    });
  }

  // --- RENDRE LES MATCHES ---
  function renderMatches(matches) {
    adminList.innerHTML = '';
    if (!matches || matches.length === 0) return;

    matches.forEach(item => {
      const p = item.p;
      const idx = item.index;

      const div = document.createElement('div');
      div.className = 'participant';
      div.innerHTML = `
        <span>${escapeHtml(p.nom)} ${escapeHtml(p.prenom)} - ${escapeHtml(p.annee)} - ${escapeHtml(p.filiere)} - ${escapeHtml(p.telephone)} - ${escapeHtml(p.montant)} CFA</span>
        <button class="delete-btn" data-index="${idx}">Supprimer</button>
      `;
      adminList.appendChild(div);
    });
  }

  // --- Suppression avec délégation d'événements ---
  adminList.addEventListener('click', function (ev) {
    const btn = ev.target.closest('button.delete-btn');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-index'), 10);
    if (Number.isNaN(idx)) return;

    if (!confirm("Voulez-vous vraiment supprimer ce participant ?")) return;

    participants.splice(idx, 1);
    save();

    // Relancer la recherche actuelle si existante
    const currentQuery = searchInput ? searchInput.value.trim() : '';
    if (currentQuery === '') {
      clearAdminList();
    } else {
      performSearchAndRender(currentQuery);
    }
  });

  // --- Recherche déclenchée par le bouton Rechercher ---
  window.searchParticipant = function () {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (query === '') {
      clearAdminList();
      return;
    }
    performSearchAndRender(query);
  };

  // --- Effectue la recherche et affiche les matches ---
  function performSearchAndRender(query) {
    const q = query.toLowerCase();
    const matches = participants
      .map((p, idx) => ({ p, idx }))
      .filter(item => (item.p.nom + ' ' + item.p.prenom).toLowerCase().includes(q))
      .map(it => ({ p: it.p, index: it.idx }));

    if (matches.length === 0) {
      clearAdminList();
      return;
    }

    renderMatches(matches);
  }

  // --- Export JSON ---
  window.exportJSON = function () {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(participants, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'participants.json');
    dlAnchor.click();
  };

  // --- Export CSV ---
  window.exportCSV = function () {
    if (!participants.length) return;
    const headers = ['nom', 'prenom', 'annee', 'filiere', 'telephone', 'montant'];
    const rows = participants.map(p =>
      headers.map(h => `"${(p[h] || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers.join(',') + '\n' + rows);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', csvStr);
    dlAnchor.setAttribute('download', 'participants.csv');
    dlAnchor.click();
  };

  // --- Helper pour affichage sécurisé ---
  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      })[s];
    });
  }

  // Au chargement, s'assurer que la liste admin est vide
  clearAdminList();
});
