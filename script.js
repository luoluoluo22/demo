document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const elements = {
        noteList: document.getElementById('note-list'),
        newPageBtn: document.getElementById('new-page-btn'),
        noteTitle: document.getElementById('note-title'),
        noteBody: document.getElementById('note-body'),
        searchInput: document.getElementById('search-input'),
        activeEditor: document.getElementById('active-editor'),
        emptyState: document.getElementById('empty-state'),
        saveStatus: document.getElementById('save-status'),
        wordCount: document.getElementById('word-count'),
        noteDate: document.getElementById('note-date'),
        deleteBtn: document.getElementById('delete-current-btn'),
        sidebar: document.getElementById('sidebar'),
        mobileToggle: document.getElementById('mobile-menu-toggle'),
        overlay: document.getElementById('sidebar-overlay'),
        breadcrumb: document.getElementById('current-breadcrumb')
    };

    let notes = JSON.parse(localStorage.getItem('claude-notion-v2')) || [];
    let activeId = null;

    const saveToDisk = () => localStorage.setItem('claude-notion-v2', JSON.stringify(notes));

    const render = (query = '') => {
        elements.noteList.innerHTML = '';
        const filtered = notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()));

        filtered.sort((a,b) => b.at - a.at).forEach(note => {
            const el = document.createElement('div');
            el.className = `note-item ${note.id === activeId ? 'active' : ''}`;
            el.innerHTML = `<span>📄</span> <span>${note.title || 'Untitled'}</span>`;
            el.onclick = () => {
                selectNote(note.id);
                toggleSidebar(false);
            };
            elements.noteList.appendChild(el);
        });
    };

    const selectNote = (id) => {
        activeId = id;
        const note = notes.find(n => n.id === id);
        if (note) {
            elements.emptyState.style.display = 'none';
            elements.activeEditor.style.display = 'flex';
            elements.noteTitle.value = note.title;
            elements.noteBody.value = note.body;
            elements.noteDate.textContent = new Date(note.at).toLocaleDateString();
            elements.breadcrumb.textContent = note.title || 'Untitled';
            updateStats();
            render(elements.searchInput.value);
        }
    };

    const updateStats = () => {
        const words = elements.noteBody.value.trim() ? elements.noteBody.value.trim().split(/\s+/).length : 0;
        elements.wordCount.textContent = `${words} words`;
    };

    const autoSave = () => {
        const note = notes.find(n => n.id === activeId);
        if (note) {
            note.title = elements.noteTitle.value;
            note.body = elements.noteBody.value;
            note.at = Date.now();
            elements.breadcrumb.textContent = note.title || 'Untitled';
            saveToDisk();
            flashStatus();
            render(elements.searchInput.value);
        }
    };

    const flashStatus = () => {
        elements.saveStatus.classList.add('show');
        setTimeout(() => elements.saveStatus.classList.remove('show'), 800);
    };

    const toggleSidebar = (force) => {
        elements.sidebar.classList.toggle('open', force);
        elements.overlay.classList.toggle('show', force);
    };

    // Event Handlers
    elements.newPageBtn.onclick = () => {
        const newNote = { id: Date.now().toString(), title: '', body: '', at: Date.now() };
        notes.push(newNote);
        saveToDisk();
        selectNote(newNote.id);
        if (window.innerWidth <= 768) toggleSidebar(false);
    };

    elements.deleteBtn.onclick = () => {
        if (!confirm('Delete this page?')) return;
        notes = notes.filter(n => n.id !== activeId);
        saveToDisk();
        activeId = null;
        elements.activeEditor.style.display = 'none';
        elements.emptyState.style.display = 'flex';
        render();
    };

    elements.noteTitle.oninput = autoSave;
    elements.noteBody.oninput = () => { autoSave(); updateStats(); };
    elements.searchInput.oninput = (e) => render(e.target.value);
    elements.mobileToggle.onclick = () => toggleSidebar(true);
    elements.overlay.onclick = () => toggleSidebar(false);

    render();
});
