document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const colorSelect = document.getElementById('color-select');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('notes-container');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-btn');
    const noteCountEl = document.getElementById('note-count');
    const wordCountEl = document.getElementById('word-count');

    let notes = JSON.parse(localStorage.getItem('claude-notes-pro')) || [];

    const updateStats = () => {
        noteCountEl.textContent = notes.length;
        const totalWords = notes.reduce((sum, note) => {
            return sum + (note.text.trim() ? note.text.trim().split(/\s+/).length : 0);
        }, 0);
        wordCountEl.textContent = totalWords;
    };

    const saveNotes = () => {
        localStorage.setItem('claude-notes-pro', JSON.stringify(notes));
        updateStats();
    };

    const createNoteElement = (note) => {
        const noteDiv = document.createElement('div');
        noteDiv.className = `note ${note.color}`;
        noteDiv.innerHTML = `
            <div class="note-content">${escapeHTML(note.text)}</div>
            <div class="note-footer">
                <span class="note-date">${note.date}</span>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            </div>
        `;

        noteDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            notes = notes.filter(n => n.id != id);
            saveNotes();
            renderNotes();
        });

        return noteDiv;
    };

    const renderNotes = (filter = '') => {
        notesContainer.innerHTML = '';
        const filteredNotes = notes.filter(n =>
            n.text.toLowerCase().includes(filter.toLowerCase())
        );

        filteredNotes.sort((a, b) => b.id - a.id).forEach(note => {
            notesContainer.appendChild(createNoteElement(note));
        });
        updateStats();
    };

    const addNote = () => {
        const text = noteInput.value.trim();
        if (!text) return;

        const newNote = {
            id: Date.now(),
            text: text,
            color: colorSelect.value,
            date: new Date().toLocaleString()
        };

        notes.push(newNote);
        saveNotes();
        renderNotes();
        noteInput.value = '';
        noteInput.focus();
    };

    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Events
    addNoteBtn.addEventListener('click', addNote);

    noteInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') addNote();
    });

    searchInput.addEventListener('input', (e) => {
        renderNotes(e.target.value);
    });

    exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initial Render
    renderNotes();
});
