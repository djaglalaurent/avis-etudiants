// Gestion des tabs (si besoin plus tard)
function showTab(tabName){
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab');
    tabs.forEach(t=>t.classList.remove('active'));
    tabButtons.forEach(b=>b.classList.remove('active'));
    const tab = document.getElementById(tabName);
    if(tab) tab.classList.add('active');
}

// Stockage participants
let participants = JSON.parse(localStorage.getItem('participants')) || [];

// FORMULAIRE
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

    form.reset();

    const conf = document.getElementById('confirmation');
    conf.classList.remove('hidden');
    setTimeout(()=> conf.classList.add('hidden'), 4000);

    // ✅ IMPORTANT : on n’affiche RIEN après soumission
    adminList.innerHTML = '';
});

// ADMIN PANEL
const adminList = document.getElementById('adminList');
const searchInput = document.getElementById('searchName');

// ✅ Quand on vide le champ de recherche → la liste disparaît automatiquement
searchInput.addEventListener('input', function () {
    if (this.value.trim() === '') {
        adminList.innerHTML = '';
    }
});

// ❌ On garde la fonction mais elle ne s’utilise PLUS au chargement
function renderAdminList(filtered = null){
    const list = filtered || participants;
    adminList.innerHTML = '';
    list.forEach((p,i)=>{
        const div = document.createElement('div');
        div.className = 'participant';
        div.innerHTML = `
            <span>${p.nom} ${p.prenom} - ${p.annee} - ${p.filiere} - ${p.telephone} - ${p.montant} CFA</span>
            <button onclick="deleteParticipant(${i})">Supprimer</button>
        `;
        adminList.appendChild(div);
    });
}

function deleteParticipant(index){
    if(confirm("Voulez-vous vraiment supprimer ce participant ?")){
        participants.splice(index,1);
        localStorage.setItem('participants', JSON.stringify(participants));
        adminList.innerHTML = ''; // ✅ on vide après suppression
    }
}

// ✅ RECHERCHE : affiche seulement si on clique sur Rechercher
function searchParticipant(){
    const name = searchInput.value.trim().toLowerCase();

    // ✅ Si champ vide → on vide tout
    if(name === ''){
        adminList.innerHTML = '';
        return;
    }

    const matches = participants
        .map((p, index) => ({ p, index }))
        .filter(item => 
            (item.p.nom + ' ' + item.p.prenom)
            .toLowerCase()
            .includes(name)
        );

    // ✅ Aucun résultat → on n'affiche rien
    if(matches.length === 0){
        adminList.innerHTML = '';
        return;
    }

    adminList.innerHTML = '';

    matches.forEach(item => {
        const p = item.p;
        const i = item.index;

        const div = document.createElement('div');
        div.className = 'participant';
        div.innerHTML = `
            <span>${p.nom} ${p.prenom} - ${p.annee} - ${p.filiere} - ${p.telephone} - ${p.montant} CFA</span>
            <button onclick="deleteParticipant(${i})">Supprimer</button>
        `;
        adminList.appendChild(div);
    });
}

// Export JSON
function exportJSON(){
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(participants));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download","participants.json");
    dlAnchor.click();
}

// Export CSV
function exportCSV(){
    if(!participants.length) return;
    const headers = Object.keys(participants[0]).join(',');
    const rows = participants.map(p=>Object.values(p).join(',')).join('\n');
    const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + '\n' + rows);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", csvStr);
    dlAnchor.setAttribute("download","participants.csv");
    dlAnchor.click();
}

// ✅ AUCUN affichage automatique AU CHARGEMENT
adminList.innerHTML = '';
