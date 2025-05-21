document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('notes-container');

    // Load notes from local storage
    loadNotes();

    addNoteBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        if (noteText !== '') {
            addNote(noteText);
            noteInput.value = ''; // Clear input field
        }
    });

    function addNote(text, isLoad = false) {
        const noteId = `note-${Date.now()}`;
        const noteElement = createNoteElement(noteId, text);
        notesContainer.appendChild(noteElement);

        if (!isLoad) {
            saveNoteToLocalStorage(noteId, text);
        }
    }

    function createNoteElement(id, text) {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.setAttribute('id', id);

        const noteText = document.createElement('p');
        noteText.textContent = text;

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            deleteNote(id);
        });

        noteDiv.appendChild(noteText);
        noteDiv.appendChild(deleteBtn);

        return noteDiv;
    }

    function saveNoteToLocalStorage(id, text) {
        const notes = getNotesFromLocalStorage();
        notes[id] = text;
        localStorage.setItem('simple-notes', JSON.stringify(notes));
    }

    function getNotesFromLocalStorage() {
        const notesJSON = localStorage.getItem('simple-notes');
        return notesJSON ? JSON.parse(notesJSON) : {};
    }

    function loadNotes() {
        const notes = getNotesFromLocalStorage();
        for (const id in notes) {
            if (notes.hasOwnProperty(id)) {
                addNote(notes[id], true /* isLoad */);
            }
        }
    }

    function deleteNote(id) {
        const noteElement = document.getElementById(id);
        if (noteElement) {
            notesContainer.removeChild(noteElement);
            removeNoteFromLocalStorage(id);
        }
    }

    function removeNoteFromLocalStorage(id) {
        const notes = getNotesFromLocalStorage();
        delete notes[id];
        localStorage.setItem('simple-notes', JSON.stringify(notes));
    }
});
