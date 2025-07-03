document.addEventListener('DOMContentLoaded', () => {
    // Riferimenti agli elementi DOM
    const deckForm = document.getElementById('deckForm');
    const deckNameInput = document.getElementById('deckNameInput');
    const matchesPlayedInput = document.getElementById('matchesPlayedInput');
    const matchesWonInput = document.getElementById('matchesWonInput');
    const deckTypeSelect = document.getElementById('deckTypeSelect');
    const deckList = document.getElementById('deckList');
    const totalDecksSpan = document.getElementById('totalDecks');
    const totalMatchesPlayedSpan = document.getElementById('totalMatchesPlayed');
    const totalMatchesWonSpan = document.getElementById('totalMatchesWon');
    const overallWinRateSpan = document.getElementById('overallWinRate');
    const briefDeckStats = document.getElementById('briefDeckStats');
    const noDecksAside = document.querySelector('.no-decks-aside');
    const existingDecksDatalist = document.getElementById('existingDecks');

    // Modale e relativi elementi
    const deckDetailsModal = new bootstrap.Modal(document.getElementById('deckDetailsModal'));
    const modalDeckName = document.getElementById('modalDeckName');
    const modalMatchesPlayed = document.getElementById('modalMatchesPlayed');
    const modalMatchesWon = document.getElementById('modalMatchesWon');
    const modalDeckType = document.getElementById('modalDeckType');
    const modalEnergyType = document.getElementById('modalEnergyType');
    const modalWinRate = document.getElementById('modalWinRate');
    const prevDeckButton = document.getElementById('prevDeckButton');
    const nextDeckButton = document.getElementById('nextDeckButton');

    let decks = JSON.parse(localStorage.getItem('decks')) || [];
    let currentDeckIndex = -1; // Per la navigazione nella modale

    // Funzione per calcolare il win rate
    const calculateWinRate = (won, played) => {
        if (played === 0) return '0%';
        return ((won / played) * 100).toFixed(2) + '%';
    };

    // Funzione per salvare i mazzi nel localStorage
    const saveDecks = () => {
        localStorage.setItem('decks', JSON.stringify(decks));
    };

    // Funzione per aggiornare la lista dei mazzi e le statistiche generali
    const updateUI = () => {
        deckList.innerHTML = ''; // Pulisci la lista
        existingDecksDatalist.innerHTML = ''; // Pulisci la datalist

        if (decks.length === 0) {
            noDecksAside.style.display = 'block';
            briefDeckStats.innerHTML = '<p>Seleziona un mazzo dalla lista a lato per vedere le sue statistiche.</p>';
        } else {
            noDecksAside.style.display = 'none';
            decks.forEach((deck, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.textContent = deck.name;
                listItem.dataset.index = index; // Aggiungi l'indice per riferimento
                listItem.addEventListener('click', () => showDeckDetails(index));
                deckList.appendChild(listItem);

                const option = document.createElement('option');
                option.value = deck.name;
                existingDecksDatalist.appendChild(option);
            });
        }

        // Aggiorna le statistiche generali
        const totalPlayed = decks.reduce((sum, deck) => sum + deck.matchesPlayed, 0);
        const totalWon = decks.reduce((sum, deck) => sum + deck.matchesWon, 0);

        totalDecksSpan.textContent = decks.length;
        totalMatchesPlayedSpan.textContent = totalPlayed;
        totalMatchesWonSpan.textContent = totalWon;
        overallWinRateSpan.textContent = calculateWinRate(totalWon, totalPlayed);
    };

    // Funzione per mostrare le statistiche brevi di un mazzo
    const showBriefDeckStats = (index) => {
        if (index === -1 || decks.length === 0) {
            briefDeckStats.innerHTML = '<p>Seleziona un mazzo dalla lista a lato per vedere le sue statistiche.</p>';
            return;
        }
        const deck = decks[index];
        briefDeckStats.innerHTML = `
            <h5>${deck.name}</h5>
            <p>Partite Giocate: ${deck.matchesPlayed}</p>
            <p>Partite Vinte: ${deck.matchesWon}</p>
            <p class="win-rate-brief">Win Rate: ${calculateWinRate(deck.matchesWon, deck.matchesPlayed)}</p>
        `;
    };

    // Funzione per mostrare i dettagli del mazzo nella modale
    const showDeckDetails = (index) => {
        if (index < 0 || index >= decks.length) return; // Controllo limiti

        currentDeckIndex = index;
        const deck = decks[currentDeckIndex];

        modalDeckName.textContent = deck.name;
        modalMatchesPlayed.textContent = deck.matchesPlayed;
        modalMatchesWon.textContent = deck.matchesWon;
        modalDeckType.textContent = deck.type;
        modalEnergyType.textContent = deck.energyType;
        modalWinRate.textContent = calculateWinRate(deck.matchesWon, deck.matchesPlayed);

        // Gestione bottoni Prev/Next
        prevDeckButton.disabled = currentDeckIndex === 0;
        nextDeckButton.disabled = currentDeckIndex === decks.length - 1;

        deckDetailsModal.show();
    };

    // Gestione navigazione Prev/Next nella modale
    prevDeckButton.addEventListener('click', () => {
        if (currentDeckIndex > 0) {
            showDeckDetails(currentDeckIndex - 1);
        }
    });

    nextDeckButton.addEventListener('click', () => {
        if (currentDeckIndex < decks.length - 1) {
            showDeckDetails(currentDeckIndex + 1);
        }
    });


    // Listener per l'invio del form
    deckForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = deckNameInput.value.trim();
        const played = parseInt(matchesPlayedInput.value);
        const won = parseInt(matchesWonInput.value);
        const type = deckTypeSelect.value;
        const energyType = document.querySelector('input[name="energyType"]:checked')?.value || 'Non Specificato';

        if (!name || isNaN(played) || isNaN(won) || played < 0 || won < 0 || won > played || !type) {
            alert('Per favore, compila tutti i campi correttamente. Le partite vinte non possono superare le partite giocate.');
            return;
        }

        const existingDeckIndex = decks.findIndex(deck => deck.name.toLowerCase() === name.toLowerCase());

        if (existingDeckIndex > -1) {
            // Aggiorna mazzo esistente
            decks[existingDeckIndex].matchesPlayed = played;
            decks[existingDeckIndex].matchesWon = won;
            decks[existingDeckIndex].type = type;
            decks[existingDeckIndex].energyType = energyType;
            alert(`Mazzo "${name}" aggiornato con successo!`);
        } else {
            // Aggiungi nuovo mazzo
            decks.push({ name, matchesPlayed: played, matchesWon: won, type, energyType });
            alert(`Mazzo "${name}" aggiunto con successo!`);
        }

        saveDecks();
        updateUI();
        deckForm.reset(); // Resetta il form dopo l'invio
        briefDeckStats.innerHTML = '<p>Seleziona un mazzo dalla lista a lato per vedere le sue statistiche.</p>'; // Pulisci le stat brevi
        // Deseleziona i radio button dopo il reset del form
        document.querySelectorAll('input[name="energyType"]').forEach(radio => radio.checked = false);
    });

    // Listener per la selezione di un mazzo dalla datalist per auto-compilazione
    deckNameInput.addEventListener('input', () => {
        const selectedDeckName = deckNameInput.value;
        const foundDeck = decks.find(deck => deck.name === selectedDeckName);

        if (foundDeck) {
            matchesPlayedInput.value = foundDeck.matchesPlayed;
            matchesWonInput.value = foundDeck.matchesWon;
            deckTypeSelect.value = foundDeck.type;
            // Seleziona il radio button corretto
            document.querySelectorAll('input[name="energyType"]').forEach(radio => {
                if (radio.value === foundDeck.energyType) {
                    radio.checked = true;
                } else {
                    radio.checked = false; // Deseleziona gli altri
                }
            });
            showBriefDeckStats(decks.indexOf(foundDeck)); // Mostra statistiche brevi quando si seleziona
        } else {
            // Resetta i campi se il nome non corrisponde a un mazzo esistente
            matchesPlayedInput.value = 0;
            matchesWonInput.value = 0;
            deckTypeSelect.value = '';
            document.querySelectorAll('input[name="energyType"]').forEach(radio => radio.checked = false);
            briefDeckStats.innerHTML = '<p>Seleziona un mazzo dalla lista a lato per vedere le sue statistiche.</p>';
        }
    });

    // Inizializza l'UI al caricamento della pagina
    updateUI();
});