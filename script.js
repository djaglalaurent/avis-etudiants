// Gestion de l'authentification admin
let isAdminAuthenticated = false;
const ADMIN_PASSWORD = "admin123"; // Changez ce mot de passe !

// Variables pour les filtres
let filtresActifs = {
    domaine: '',
    note: '',
    reponse: ''
};

// Fonction pour afficher l'onglet admin avec authentification
function showAdminTab() {
    if (!isAdminAuthenticated) {
        showPasswordModal();
    } else {
        showTab('admin');
    }
}

// Fonction pour afficher la modale de mot de passe
function showPasswordModal() {
    // Créer la modale
    const modal = document.createElement('div');
    modal.className = 'password-modal';
    modal.innerHTML = `
        <div class="password-modal-content">
            <h3>🔐 Accès Administrateur</h3>
            <p style="margin-bottom: 20px; color: #666;">Veuillez entrer le mot de passe pour accéder au tableau de bord</p>
            <div class="form-group">
                <label for="adminPassword">Mot de passe :</label>
                <input type="password" id="adminPassword" placeholder="Entrez le mot de passe" autocomplete="off">
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="attemptLogin()" class="submit-btn" style="flex: 1;">Se connecter</button>
                <button onclick="closePasswordModal()" class="export-btn" style="background: #6c757d; flex: 1;">Annuler</button>
            </div>
            <p id="passwordError" style="color: #dc3545; margin-top: 15px; display: none;">❌ Mot de passe incorrect</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus sur le champ password
    setTimeout(() => {
        document.getElementById('adminPassword').focus();
    }, 100);
    
    // Entrée pour soumettre
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });
}

// Fonction pour fermer la modale
function closePasswordModal() {
    const modal = document.querySelector('.password-modal');
    if (modal) {
        modal.remove();
    }
    showTab('formulaire');
}

// Fonction pour tenter la connexion
function attemptLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const errorElement = document.getElementById('passwordError');
    const password = passwordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminAuthenticated = true;
        closePasswordModal();
        showTab('admin');
        
        // Réinitialiser le bouton admin
        document.querySelector('.tab[onclick="showAdminTab()"]').textContent = "📊 Tableau de bord";
    } else {
        errorElement.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
        
        // Animation d'erreur
        passwordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
}

// Gestion des onglets
function showTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Désactiver tous les boutons d'onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Afficher l'onglet sélectionné
    document.getElementById(tabName).classList.add('active');
    
    // Activer le bouton correspondant
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Si c'est l'onglet admin, mettre à jour les données
    if (tabName === 'admin' && isAdminAuthenticated) {
        updateAdminPanel();
    }
}

// Gestion du formulaire
document.getElementById('avisForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
        id: Date.now(), // ID unique
        email: formData.get('email') || 'Anonyme',
        domaine: formData.get('domaine'),
        note: parseInt(formData.get('note')),
        points_positifs: formData.get('points_positifs'),
        points_amelioration: formData.get('points_amelioration'),
        questions: formData.get('questions'),
        date: new Date().toLocaleString('fr-FR'),
        reponse: '', // Nouveau champ pour les réponses
        dateReponse: '' // Date de la réponse
    };
    
    // Validation des données
    if (!data.domaine || !data.note) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
    }
    
    // Sauvegarder les données
    saveAvis(data);
    
    // Afficher la confirmation
    showConfirmation(data);
    
    // Réinitialiser le formulaire
    this.reset();
});

function saveAvis(avis) {
    const existingData = JSON.parse(localStorage.getItem('avisEtudiants') || '[]');
    existingData.push(avis);
    localStorage.setItem('avisEtudiants', JSON.stringify(existingData));
    console.log('✅ Avis sauvegardé. Total:', existingData.length);
}

function showConfirmation(data) {
    document.getElementById('dataPreview').innerHTML = `
        <p><strong>Domaine :</strong> ${data.domaine}</p>
        <p><strong>Note :</strong> ${data.note}/10</p>
        <p><strong>Points positifs :</strong> ${data.points_positifs || 'Aucun'}</p>
        <p><strong>À améliorer :</strong> ${data.points_amelioration || 'Aucun'}</p>
        <p><strong>Questions :</strong> ${data.questions || 'Aucune'}</p>
        <p><strong>Date :</strong> ${data.date}</p>
    `;
    
    document.getElementById('avisForm').classList.add('hidden');
    document.getElementById('confirmation').classList.remove('hidden');
}

// Fonctions admin
function updateAdminPanel() {
    let avis = JSON.parse(localStorage.getItem('avisEtudiants') || '[]');
    
    // Appliquer les filtres
    avis = appliquerFiltresSurDonnees(avis);
    
    // Mettre à jour les statistiques
    updateStats(avis);
    
    // Mettre à jour la liste des avis
    updateAvisList(avis);
}

function updateStats(avis) {
    const statsGrid = document.getElementById('statsGrid');
    
    if (avis.length === 0) {
        statsGrid.innerHTML = '<div class="stat-card"><div class="stat-number">0</div><div class="stat-label">Aucune donnée disponible</div></div>';
        return;
    }
    
    const total = avis.length;
    const notes = avis.filter(a => a.note).map(a => a.note);
    const moyenne = notes.length > 0 ? (notes.reduce((sum, note) => sum + note, 0) / notes.length).toFixed(1) : 0;
    
    // Compter par domaine
    const domaines = {};
    avis.forEach(a => {
        domaines[a.domaine] = (domaines[a.domaine] || 0) + 1;
    });
    
    const domainePopulaire = Object.keys(domaines).reduce((a, b) => domaines[a] > domaines[b] ? a : b, 'Aucun');
    const pourcentagePositif = avis.filter(a => a.note >= 7).length / total * 100;
    
    // Compter les avis avec réponses
    const avisAvecReponse = avis.filter(a => a.reponse && a.reponse.trim() !== '').length;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${total}</div>
            <div class="stat-label">Avis reçus</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${moyenne}/10</div>
            <div class="stat-label">Note moyenne</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(pourcentagePositif)}%</div>
            <div class="stat-label">Satisfaction</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${avisAvecReponse}</div>
            <div class="stat-label">Avis traités</div>
        </div>
    `;
}

function updateAvisList(avis) {
    const avisList = document.getElementById('avisList');
    
    if (avis.length === 0) {
        avisList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Aucun avis correspondant aux filtres</p>';
        return;
    }
    
    // Trier par date (du plus récent au plus ancien)
    const avisTries = avis.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    avisList.innerHTML = avisTries.map(avis => {
        const aReponse = avis.reponse && avis.reponse.trim() !== '';
        const noteCritique = avis.note <= 3;
        
        return `
        <div class="avis-item" data-a-reponse="${aReponse}" data-note-critique="${noteCritique}">
            <strong>${avis.domaine}</strong> - Note: ${avis.note}/10
            <br><small>📅 ${avis.date} - 📧 ${avis.email}</small>
            ${avis.points_positifs ? `<br>✅ <em>${avis.points_positifs}</em>` : ''}
            ${avis.points_amelioration ? `<br>🔧 <em>${avis.points_amelioration}</em>` : ''}
            ${avis.questions ? `<br>❓ <em>${avis.questions}</em>` : ''}
            
            <div class="reponse-section">
                <textarea class="reponse-input" placeholder="Répondre à cet avis...">${avis.reponse || ''}</textarea>
                <button onclick="envoyerReponse(${avis.id}, this)" class="export-btn" style="background: #17a2b8; margin: 5px 0;">
                    ${avis.reponse ? '✏️ Modifier la réponse' : '📤 Répondre'}
                </button>
                ${aReponse ? `
                    <div class="reponse-affichage">
                        <strong>📝 Votre réponse :</strong>
                        <p>${avis.reponse}</p>
                        <small>Répondu le ${avis.dateReponse}</small>
                    </div>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

// NOUVEAU : Système de réponses
function envoyerReponse(avisId, bouton) {
    const reponseSection = bouton.parentElement;
    const reponseInput = reponseSection.querySelector('.reponse-input');
    const reponse = reponseInput.value.trim();
    
    if (!reponse) {
        alert("Veuillez écrire une réponse avant d'envoyer");
        return;
    }
    
    const avis = JSON.parse(localStorage.getItem('avisEtudiants'));
    const avisIndex = avis.findIndex(a => a.id === avisId);
    
    if (avisIndex !== -1) {
        avis[avisIndex].reponse = reponse;
        avis[avisIndex].dateReponse = new Date().toLocaleString('fr-FR');
        localStorage.setItem('avisEtudiants', JSON.stringify(avis));
        
        // Mettre à jour l'affichage
        updateAdminPanel();
        alert("✅ Réponse enregistrée !");
    }
}

// NOUVEAU : Système de filtres
function appliquerFiltres() {
    // Récupérer les valeurs des filtres
    filtresActifs = {
        domaine: document.getElementById('filterDomaine').value,
        note: document.getElementById('filterNote').value,
        reponse: document.getElementById('filterReponse').value
    };
    
    // Mettre à jour l'affichage
    updateAdminPanel();
}

function appliquerFiltresSurDonnees(avis) {
    return avis.filter(avis => {
        // Filtre par domaine
        if (filtresActifs.domaine && avis.domaine !== filtresActifs.domaine) {
            return false;
        }
        
        // Filtre par note
        if (filtresActifs.note) {
            const [min, max] = filtresActifs.note.split('-').map(Number);
            if (avis.note < min || avis.note > max) {
                return false;
            }
        }
        
        // Filtre par réponse
        if (filtresActifs.reponse === 'avec' && (!avis.reponse || avis.reponse.trim() === '')) {
            return false;
        }
        if (filtresActifs.reponse === 'sans' && avis.reponse && avis.reponse.trim() !== '') {
            return false;
        }
        
        return true;
    });
}

function reinitialiserFiltres() {
    document.getElementById('filterDomaine').value = '';
    document.getElementById('filterNote').value = '';
    document.getElementById('filterReponse').value = '';
    
    filtresActifs = {
        domaine: '',
        note: '',
        reponse: ''
    };
    
    updateAdminPanel();
}

// NOUVEAU : Génération de rapport
function genererRapport() {
    if (!isAdminAuthenticated) {
        alert("❌ Accès non autorisé");
        return;
    }
    
    const avis = JSON.parse(localStorage.getItem('avisEtudiants') || '[]');
    
    if (avis.length === 0) {
        alert("Aucune donnée pour générer un rapport");
        return;
    }
    
    const maintenant = new Date();
    const dateRapport = maintenant.toLocaleDateString('fr-FR');
    const heureRapport = maintenant.toLocaleTimeString('fr-FR');
    
    // Calculs pour le rapport
    const totalAvis = avis.length;
    const notes = avis.filter(a => a.note).map(a => a.note);
    const moyenne = notes.length > 0 ? (notes.reduce((sum, note) => sum + note, 0) / notes.length).toFixed(1) : 0;
    const avisPositifs = avis.filter(a => a.note >= 7).length;
    const avisAvecReponse = avis.filter(a => a.reponse && a.reponse.trim() !== '').length;
    
    // Compter par domaine
    const domaines = {};
    avis.forEach(a => {
        domaines[a.domaine] = (domaines[a.domaine] || 0) + 1;
    });
    
    // Extraire les suggestions populaires
    const suggestions = avis
        .filter(a => a.points_amelioration && a.points_amelioration.trim() !== '')
        .map(a => a.points_amelioration)
        .slice(0, 5);
    
    const rapport = `
RAPPORT DES AVIS ÉTUDIANTS
===========================
Généré le : ${dateRapport} à ${heureRapport}

📊 STATISTIQUES GÉNÉRALES
• Total des avis : ${totalAvis}
• Note moyenne : ${moyenne}/10
• Taux de satisfaction : ${Math.round((avisPositifs / totalAvis) * 100)}%
• Avis traités : ${avisAvecReponse} (${Math.round((avisAvecReponse / totalAvis) * 100)}%)

🎯 RÉPARTITION PAR DOMAINE
${Object.entries(domaines).map(([domaine, count]) => `• ${domaine} : ${count} avis (${Math.round((count / totalAvis) * 100)}%)`).join('\n')}

💡 TOP 5 DES SUGGESTIONS
${suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

🚨 AVIS CRITIQUES (1-3/10)
${avis.filter(a => a.note <= 3).length} avis nécessitent une attention particulière

📈 RECOMMANDATIONS
• Traiter les ${avis.filter(a => !a.reponse || a.reponse.trim() === '').length} avis sans réponse
• Se concentrer sur le domaine "${Object.keys(domaines).reduce((a, b) => domaines[a] > domaines[b] ? a : b)}"
    `;
    
    // Créer et télécharger le rapport
    const blob = new Blob([rapport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-avis-${maintenant.toISOString().split('T')[0]}.txt`;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    alert(`📄 Rapport généré avec ${totalAvis} avis analysés !`);
}

// Export des données
function exportJSON() {
    if (!isAdminAuthenticated) {
        alert("❌ Accès non autorisé");
        return;
    }
    
    let data = JSON.parse(localStorage.getItem('avisEtudiants') || '[]');
    
    // Appliquer les filtres à l'export
    data = appliquerFiltresSurDonnees(data);
    
    if (data.length === 0) {
        alert("Aucune donnée à exporter");
        return;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avis-etudiants-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    alert(`✅ ${data.length} avis exportés au format JSON !`);
}

function exportCSV() {
    if (!isAdminAuthenticated) {
        alert("❌ Accès non autorisé");
        return;
    }
    
    let data = JSON.parse(localStorage.getItem('avisEtudiants') || '[]');
    
    // Appliquer les filtres à l'export
    data = appliquerFiltresSurDonnees(data);
    
    if (data.length === 0) {
        alert("Aucune donnée à exporter");
        return;
    }
    
    let csv = 'Email,Domaine,Note,Points Positifs,Points Amélioration,Questions,Réponse,Date Réponse,Date\n';
    
    data.forEach(avis => {
        csv += `"${avis.email}","${avis.domaine}","${avis.note}","${(avis.points_positifs || '').replace(/"/g, '""')}","${(avis.points_amelioration || '').replace(/"/g, '""')}","${(avis.questions || '').replace(/"/g, '""')}","${(avis.reponse || '').replace(/"/g, '""')}","${avis.dateReponse || ''}","${avis.date}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avis-etudiants-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    alert(`✅ ${data.length} avis exportés au format CSV !`);
}

function clearData() {
    if (!isAdminAuthenticated) {
        alert("❌ Accès non autorisé");
        return;
    }
    
    if (confirm('⚠️ Êtes-vous sûr de vouloir effacer TOUTES les données ?\nCette action est irréversible.')) {
        // Effacer les données ET désactiver la recréation automatique
        localStorage.removeItem('avisEtudiants');
        localStorage.setItem('demoDataLoaded', 'true'); // Marquer que les données demo ont été chargées
        
        // Réinitialiser les filtres
        reinitialiserFiltres();
        
        // Mettre à jour l'affichage
        updateAdminPanel();
        alert('🗑️ Toutes les données ont été effacées.');
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Plateforme Avis Étudiants initialisée');
    
    // Vérifier si les données de démonstration ont déjà été chargées
    const demoAlreadyLoaded = localStorage.getItem('demoDataLoaded');
    const existingData = JSON.parse(localStorage.getItem('avisEtudiants') || '[]');
    
    // Charger les données de démonstration UNIQUEMENT au tout premier lancement
    if (existingData.length === 0 && !demoAlreadyLoaded) {
        const demoData = [
            {
                id: 1,
                email: "demo@email.com",
                domaine: "formations",
                note: 8,
                points_positifs: "Contenu très intéressant et formateur compétent",
                points_amelioration: "Plus d'exercices pratiques serait apprécié",
                questions: "",
                date: new Date().toLocaleString('fr-FR'),
                reponse: "Merci pour votre retour ! Nous programmons plus d'exercices pratiques pour la prochaine session.",
                dateReponse: new Date().toLocaleString('fr-FR')
            },
            {
                id: 2,
                email: "etudiant@campus.edu",
                domaine: "evenements",
                note: 7,
                points_positifs: "Bonne ambiance et organisation",
                points_amelioration: "Communication à améliorer",
                questions: "Quand le prochain événement ?",
                date: new Date().toLocaleString('fr-FR'),
                reponse: "",
                dateReponse: ""
            },
            {
                id: 3,
                email: "anonyme",
                domaine: "soutien",
                note: 2,
                points_positifs: "Aucun",
                points_amelioration: "Réponse très lente, délais trop longs",
                questions: "Pourquoi ça prend autant de temps ?",
                date: new Date().toLocaleString('fr-FR'),
                reponse: "",
                dateReponse: ""
            }
        ];
        localStorage.setItem('avisEtudiants', JSON.stringify(demoData));
        localStorage.setItem('demoDataLoaded', 'true'); // Marquer comme chargé
        console.log('📊 Données de démonstration chargées');
    }
    
    // S'assurer que le formulaire est visible au départ
    showTab('formulaire');
});

// Protection contre la navigation directe vers l'admin
window.addEventListener('load', function() {
    // Si quelqu'un essaie d'accéder directement à l'admin sans être authentifié
    if (window.location.hash === '#admin' && !isAdminAuthenticated) {
        showTab('formulaire');
    }
});
