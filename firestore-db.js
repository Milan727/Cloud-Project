import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    orderBy,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const FILES_COLLECTION = 'files';

// Add file metadata to Firestore
export async function addFileToFirestore(fileData) {
    try {
        const docRef = await addDoc(collection(db, FILES_COLLECTION), {
            ...fileData,
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
}

// Get files for a specific user
export async function getUserFiles(uid) {
    // Note: Removed orderBy("createdAt", "desc") from the query because it requires 
    // a manual Composite Index to be created in the Firebase Console when combined with where("uid").
    // To keep it simple for now, we filter in DB and sort in JS.
    const q = query(
        collection(db, FILES_COLLECTION),
        where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory (newest first)
    files.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.seconds : 0;
        const timeB = b.createdAt ? b.createdAt.seconds : 0;
        return timeB - timeA;
    });

    return files;
}

// Delete file from Firestore
export async function deleteFileFromFirestore(docId) {
    try {
        await deleteDoc(doc(db, FILES_COLLECTION, docId));
    } catch (e) {
        console.error("Error removing document: ", e);
        throw e;
    }
}

// Rename file in Firestore
export async function updateFileName(docId, newName) {
    try {
        const fileRef = doc(db, FILES_COLLECTION, docId);
        await updateDoc(fileRef, {
            name: newName
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
}
