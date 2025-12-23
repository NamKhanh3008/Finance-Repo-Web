import { useState, useCallback } from 'react';

import axios from 'axios';



const getToken = () => localStorage.getItem('authToken');



export const useAnnotations = () => {

    const [annotations, setAnnotations] = useState([]);

   

    // --- 1. FETCH ---

    const fetchAnnotations = useCallback(async (fileId) => {

        if (!fileId) return;

        try {

            const token = getToken();

            const res = await axios.get(`http://127.0.0.1:5000/api/annotation/file/${fileId}`, {

                headers: { Authorization: `Bearer ${token}` }

            });



            // Map Backend keys (x_position) to Frontend keys (x) for display

            const mappedNotes = res.data.map(note => ({

                ...note,

                x: note.x !== undefined ? note.x : note.x_position,

                y: note.y !== undefined ? note.y : note.y_position,

                width: note.width,

                height: note.height,

                content: note.text || note.content || ""

            }));



            setAnnotations(mappedNotes);

        } catch (err) {

            console.error("Failed to load annotations", err);

        }

    }, []);



    // --- 2. ADD (Strict: No Coordinate Overwriting) ---

    const addAnnotation = useCallback(async (noteData, fileId) => {

        const token = getToken();

        if (!token) return alert("Please log in.");



        const tempId = `temp_${Date.now()}`;

       

        // 1. Draw it exactly where you dragged it

        const newNote = { ...noteData, id: tempId, text: noteData.content || "" };

        setAnnotations(prev => [...prev, newNote]);

       

        try {

            // 2. Send to Server (Map x -> x_position)

            const payload = {

                x_position: noteData.x,

                y_position: noteData.y,

                width: noteData.width,

                height: noteData.height,

                text: noteData.content || "",

                file_id: fileId

            };

           

            const res = await axios.post(

                `http://127.0.0.1:5000/api/annotation/${fileId}`,

                payload,

                { headers: { Authorization: `Bearer ${token}` } }

            );



            const realId = res.data.id;



            // 3. THE FIX: Only swap the ID.

            // Do NOT touch x, y, width, or height. Trust the user's drag.

            setAnnotations(prev => prev.map(n => {

                if (n.id === tempId) {

                    return { ...n, id: realId };

                }

                return n;

            }));



            return realId;



        } catch (err) {

            console.error("Add failed", err);

            // If it failed, remove the box so user knows it didn't save

            setAnnotations(prev => prev.filter(n => n.id !== tempId));

        }

    }, []);



    // --- 3. UPDATE (Text Only) ---

    const updateAnnotation = useCallback(async (id, updates) => {

        // Update UI Text immediately

        setAnnotations(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));



        // If it's a temp note (still saving), don't send another request yet

        if (String(id).startsWith("temp_")) return;



        try {

            const token = getToken();

            const payload = { ...updates };

           

            // Backend expects 'text', frontend might send 'content'

            if (payload.content) payload.text = payload.content;



            // SAFETY: Delete coordinates from payload so we never accidentally move it

            delete payload.x;

            delete payload.y;

            delete payload.width;

            delete payload.height;



            await axios.put(

                `http://127.0.0.1:5000/api/annotation/${id}`,

                payload,

                { headers: { Authorization: `Bearer ${token}` } }

            );

        } catch (err) {

            console.error("Update text failed", err);

        }

    }, []);



    // --- 4. DELETE ---

    const deleteAnnotation = useCallback(async (id) => {

        // Remove from UI immediately

        setAnnotations(prev => prev.filter(n => n.id !== id));

       

        // If it was a temp note, we don't need to tell server

        if (String(id).startsWith("temp_")) return;



        try {

            const token = getToken();

            await axios.delete(`http://127.0.0.1:5000/api/annotation/${id}`, {

                headers: { Authorization: `Bearer ${token}` }

            });

        } catch (err) {

            console.error("Delete failed", err);

        }

    }, []);



    return {

        annotations,

        setAnnotations,

        fetchAnnotations,

        addAnnotation,

        updateAnnotation,

        deleteAnnotation

    };

};