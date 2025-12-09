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

    // ✅ Message de confirmation uniquement
    const conf = document.getElementById('confirmation');
    conf.classList.remove('hidden');
    setTimeout(()=> conf.classList.add('hidden'), 4000);
});

// ADMIN PANEL
const adminList = document.getElementById('adminList');

// ✅ AFFICHAGE UNIQUEMENT APRÈS RECHERCHE
function renderAdminList(list){
    adminList.innerHTML = '';

    if(list.length === 0){
        adminList.innerHTML = "<p style='color:white;text-align:center;'>Aucun résultat trouvé</p>";
        return;
    }

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
        adminList.innerHTML = ""; // ✅ on vide après suppression
    }
}

function searchParticipant(){
    const name = document.getElementById('searchName').value.toLowerCase().trim();

    if(name === ""){
        alert("Veuillez entrer un nom pour effectuer la recherche.");
        return;
    }

    const filtered = participants.filter(p =>
        (p.nom + ' ' + p.prenom).toLowerCase().includes(name)
    );

    renderAdminList(filtered);
}
