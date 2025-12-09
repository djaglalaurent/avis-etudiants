let participants = JSON.parse(localStorage.getItem('participants')) || [];

const form = document.getElementById('picnicForm');
const confirmation = document.getElementById('confirmation');
const dataPreview = document.getElementById('dataPreview');
const participantList = document.getElementById('participantList');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const participant = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        annee: document.getElementById('annee_etude').value,
        filiere: document.getElementById('filiere').value,
        telephone: document.getElementById('telephone').value.trim(),
        montant: parseInt(document.getElementById('montant').value)
    };

    participants.push(participant);
    localStorage.setItem('participants', JSON.stringify(participants));

    // Affichage confirmation
    dataPreview.innerHTML = `
        <p><strong>Nom:</strong> ${participant.nom}</p>
        <p><strong>Prénom:</strong> ${participant.prenom}</p>
        <p><strong>Année:</strong> ${participant.annee}</p>
        <p><strong>Filière:</strong> ${participant.filiere}</p>
        <p><strong>Téléphone:</strong> ${participant.telephone}</p>
        <p><strong>Montant payé:</strong> ${participant.montant} CFA</p>
    `;
    confirmation.style.display = 'block';
    form.reset();
    displayParticipants();
});

// Gérer les onglets
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if(tabId === 'formulaire') document.querySelector('.tab:nth-child(1)').classList.add('active');
    if(tabId === 'admin') document.querySelector('.tab:nth-child(2)').classList.add('active');
}

// Affichage participants
function displayParticipants() {
    participantList.innerHTML = '';
    participants.forEach((p, index) => {
        const div = document.createElement('div');
        div.classList.add('participant-item');
        div.innerHTML = `
            <span>${p.nom} ${p.prenom} - ${p.annee} - ${p.filiere}</span>
            <button class="delete-btn" onclick="deleteParticipant(${index})">Supprimer</button>
        `;
        participantList.appendChild(div);
    });
}

// Supprimer participant
function deleteParticipant(index) {
    participants.splice(index,1);
    localStorage.setItem('participants', JSON.stringify(participants));
    displayParticipants();
}

// Rechercher participant
function searchParticipant() {
    const query = document.getElementById('searchName').value.toLowerCase();
    const resultDiv = document.getElementById('resultSearch');
    const filtered = participants.filter(p => p.nom.toLowerCase().includes(query) || p.prenom.toLowerCase().includes(query));

    resultDiv.innerHTML = filtered.length ? 
        filtered.map((p,i) => `<div class="participant-item">${p.nom} ${p.prenom} - ${p.annee} - ${p.filiere} <button class="delete-btn" onclick="deleteParticipant(${i})">Supprimer</button></div>`).join('') :
        `<p>Aucun participant trouvé</p>`;
}

// Export JSON
function exportJSON() {
    const dataStr = JSON.stringify(participants, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.json';
    a.click();
}

// Export CSV
function exportCSV() {
    let csv = 'Nom,Prénom,Année,Filière,Téléphone,Montant\n';
    participants.forEach(p => {
        csv += `${p.nom},${p.prenom},${p.annee},${p.filiere},${p.telephone},${p.montant}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.csv';
    a.click();
}

// Initialisation
displayParticipants();
