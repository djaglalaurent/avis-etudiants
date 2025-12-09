// ===== Tabs =====
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[onclick*="${tabId}"]`).classList.add('active');
}

// ===== Participants =====
let participants = [];

// Ajouter un participant
document.getElementById('picnicForm').addEventListener('submit', function(e){
    e.preventDefault();

    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const annee_etude = document.getElementById('annee_etude').value;
    const filiere = document.getElementById('filiere').value;
    const telephone = document.getElementById('telephone').value.trim();
    const montant = document.getElementById('montant').value.trim();

    const participant = {nom, prenom, annee_etude, filiere, telephone, montant};
    participants.push(participant);

    // Afficher confirmation
    document.getElementById('confirmation').classList.remove('hidden');
    document.getElementById('dataPreview').innerHTML = `
        <p><strong>Nom:</strong> ${nom}</p>
        <p><strong>Prénom:</strong> ${prenom}</p>
        <p><strong>Année:</strong> ${annee_etude}</p>
        <p><strong>Filière:</strong> ${filiere}</p>
        <p><strong>WhatsApp:</strong> ${telephone}</p>
        <p><strong>Montant:</strong> ${montant} CFA</p>
    `;

    // Reset form
    this.reset();

    // Mettre à jour la liste admin
    renderParticipants();
});

// ===== Render participants admin =====
function renderParticipants() {
    const list = document.getElementById('avisList');
    list.innerHTML = '';

    participants.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'participant';
        div.innerHTML = `
            <span>${p.nom} ${p.prenom} - ${p.annee_etude} - ${p.filiere} - ${p.telephone} - ${p.montant} CFA</span>
            <button class="delete-btn" onclick="deleteParticipant(${i})">Supprimer</button>
        `;
        list.appendChild(div);
    });
}

// ===== Supprimer participant =====
function deleteParticipant(index) {
    if(confirm("Voulez-vous vraiment supprimer ce participant ?")) {
        participants.splice(index,1);
        renderParticipants();
    }
}

// ===== Recherche =====
document.getElementById('searchName').addEventListener('input', function(){
    const query = this.value.toLowerCase();
    const filtered = participants.filter(p => p.nom.toLowerCase().includes(query) || p.prenom.toLowerCase().includes(query));
    const list = document.getElementById('avisList');
    list.innerHTML = '';

    filtered.forEach((p,i) => {
        const div = document.createElement('div');
        div.className = 'participant';
        div.innerHTML = `
            <span>${p.nom} ${p.prenom} - ${p.annee_etude} - ${p.filiere} - ${p.telephone} - ${p.montant} CFA</span>
            <button class="delete-btn" onclick="deleteParticipant(${participants.indexOf(p)})">Supprimer</button>
        `;
        list.appendChild(div);
    });
});

// ===== Export JSON =====
function exportJSON() {
    const dataStr = JSON.stringify(participants, null, 2);
    const blob = new Blob([dataStr], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.json';
    a.click();
}

// ===== Export CSV =====
function exportCSV() {
    if(participants.length===0) return alert("Aucun participant à exporter");
    const header = Object.keys(participants[0]).join(",");
    const rows = participants.map(p => Object.values(p).join(",")).join("\n");
    const csvStr = header + "\n" + rows;
    const blob = new Blob([csvStr], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.csv';
    a.click();
}

// ===== Effacer toutes les données =====
function clearData() {
    if(confirm("Voulez-vous vraiment effacer toutes les données ?")) {
        participants = [];
        renderParticipants();
    }
}
