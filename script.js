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

    renderAdminList();
});

// ADMIN PANEL
const adminList = document.getElementById('adminList');

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
        renderAdminList();
    }
}

function searchParticipant(){
    const name = document.getElementById('searchName').value.toLowerCase().trim();
    const filtered = participants.filter(p => (p.nom + ' ' + p.prenom).toLowerCase().includes(name));
    renderAdminList(filtered);
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

// Initial render
renderAdminList();
