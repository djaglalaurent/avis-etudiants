// script.js (remplacer entièrement)

// Chargement des participants depuis localStorage
let participants = JSON.parse(localStorage.getItem('participants')) || [];

// FORMULAIRE : ajout d'un participant (n'affiche rien côté admin)
const form = document.getElementById('picnicForm');
form.addEventListener('submit', function(e){
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
    localStorage.setItem('participants', JSON.stringify(participants));

    // reset form et confirmation visuelle
    form.reset();
    const conf = document.getElementById('confirmation');
    if(conf){
      conf.classList.remove('hidden');
      setTimeout(()=> conf.classList.add('hidden'), 4000);
    }

    // NE PAS afficher automatiquement la liste côté admin
});

// RÉFÉRENCE DOM admin
const adminList = document.getElementById('adminList');
const searchInput = document.getElementById('searchName');

// Fonction pour rendre la liste à partir d'un tableau d'objets {p,index}
function renderMatches(matches){
    adminList.innerHTML = '';

    // Si pas de matches : ne rien afficher (comportement demandé)
    if(!matches || matches.length === 0) return;

    matches.forEach(item => {
        const p = item.p;
        const idx = item.index; // index réel dans participants
        const div = document.createElement('div');
        div.className = 'participant';
        div.innerHTML = `
            <span>${escapeHtml(p.nom)} ${escapeHtml(p.prenom)} - ${escapeHtml(p.annee)} - ${escapeHtml(p.filiere)} - ${escapeHtml(p.telephone)} - ${escapeHtml(p.montant)} CFA</span>
            <button onclick="deleteParticipant(${idx})">Supprimer</button>
        `;
        adminList.appendChild(div);
    });
}

// Supprimer participant (index réel dans participants)
function deleteParticipant(index){
    if(!Number.isInteger(index) || index < 0 || index >= participants.length) return;
    if(confirm("Voulez-vous vraiment supprimer ce participant ?")){
        participants.splice(index,1);
        localStorage.setItem('participants', JSON.stringify(participants));
        // Après suppression, relancer la recherche actuelle pour rafraîchir l'affichage
        const currentQuery = (searchInput && searchInput.value) ? searchInput.value.trim() : '';
        if(currentQuery === ''){
            adminList.innerHTML = ''; // si champ vide, on doit rester vide
        } else {
            // relancer recherche pour afficher résultat mis à jour (ou vide si plus de correspondances)
            performSearchAndRender(currentQuery);
        }
    }
}

// Recherche déclenchée manuellement (bouton) ou par appel
function searchParticipant(){
    const query = (searchInput && searchInput.value) ? searchInput.value.trim() : '';
    if(query === ''){
        // Champ vide => on n'affiche rien
        adminList.innerHTML = '';
        return;
    }
    performSearchAndRender(query);
}

// Fonction utilitaire : effectuer recherche et appeler renderMatches
function performSearchAndRender(query){
    const q = query.toLowerCase();
    // On récupère les correspondances et leurs index réels dans participants
    const matches = participants
        .map((p, idx) => ({p, idx}))
        .filter(item => {
            const full = (item.p.nom + ' ' + item.p.prenom).toLowerCase();
            return full.includes(q);
        })
        .map(it => ({ p: it.p, index: it.idx }));

    // Si aucun match, on n'affiche rien (comportement demandé)
    if(matches.length === 0){
        adminList.innerHTML = '';
        return;
    }

    renderMatches(matches);
}

// Export JSON (si tu veux garder ces fonctions)
function exportJSON(){
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(participants, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download","participants.json");
    dlAnchor.click();
}

// Export CSV
function exportCSV(){
    if(!participants.length) return;
    const headers = ['nom','prenom','annee','filiere','telephone','montant'];
    const rows = participants.map(p => headers.map(h => `"${(p[h]||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers.join(',') + '\n' + rows);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", csvStr);
    dlAnchor.setAttribute("download","participants.csv");
    dlAnchor.click();
}

// Petit helper pour éviter injection dans le DOM (sécurité basique)
function escapeHtml(text){
    if(!text) return '';
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

// Au chargement de la page, on laisse l'adminList vide (conforme)
adminList.innerHTML = '';
