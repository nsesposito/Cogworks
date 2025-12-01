import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import './Notes.css';

function Notes() {
    const [notes, setNotes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const response = await axios.get(`${API_URL}/notes`);
            setNotes(response.data.notes);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            return;
        }

        try {
            if (editingNote) {
                // Update existing note
                const response = await axios.put(`${API_URL}/notes/${editingNote.id}`, formData);
                setNotes(notes.map(n => n.id === editingNote.id ? response.data.note : n));
            } else {
                // Create new note
                const response = await axios.post(`${API_URL}/notes`, formData);
                setNotes([response.data.note, ...notes]);
            }

            setFormData({ title: '', content: '' });
            setShowForm(false);
            setEditingNote(null);
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setFormData({ title: note.title, content: note.content });
        setShowForm(true);
    };

    const handleDelete = async (noteId) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/notes/${noteId}`);
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleCancel = () => {
        setFormData({ title: '', content: '' });
        setShowForm(false);
        setEditingNote(null);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="notes-loading">LOADING NOTES<span className="loading">_</span></div>;
    }

    return (
        <div className="notes-container">
            <div className="notes-header">
                <h2>&gt; PERSONAL NOTES</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-new-note"
                >
                    {showForm ? '[ CANCEL ]' : '[ + NEW NOTE ]'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="note-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Note title..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            maxLength={255}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            placeholder="Note content..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={5}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-save">
                            [ {editingNote ? 'UPDATE' : 'SAVE'} ]
                        </button>
                        <button type="button" onClick={handleCancel} className="btn-cancel">
                            [ CANCEL ]
                        </button>
                    </div>
                </form>
            )}

            <div className="notes-list">
                {notes.length === 0 ? (
                    <p className="empty-notes">&gt; NO NOTES YET. CREATE YOUR FIRST NOTE!</p>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className="note-item">
                            <div className="note-header">
                                <h3>&gt; {note.title}</h3>
                                <div className="note-actions">
                                    <button onClick={() => handleEdit(note)} className="btn-edit">
                                        EDIT
                                    </button>
                                    <button onClick={() => handleDelete(note.id)} className="btn-delete">
                                        DELETE
                                    </button>
                                </div>
                            </div>
                            <div className="note-content">{note.content}</div>
                            <div className="note-meta">
                                Updated: {formatDate(note.updated_at)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notes;
