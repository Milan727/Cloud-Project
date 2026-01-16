import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Sign Up with Email/Password
export async function signUpUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

// Login with Email/Password
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

// Google Sign In
export async function googleSignIn() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

// Logout
export async function logoutUser() {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
}

// Auth State Observer
export function monitorAuthState(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}
