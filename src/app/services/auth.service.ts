import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  // User Signup (Register User in Firebase Authentication & Firestore)
  async signUp(fullName: string, email: string, password: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential.user.uid;

    // User info store in Firestore (But NOT password)
    await setDoc(doc(this.firestore, 'registration', uid), {
      fullName,
      email,
      password,
      createdAt: new Date()
    });
  }

  // User SignIn (Login)
  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  // Logout user
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  // Get current logged-in user's email
  getUserEmail(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.email : null;
  }

  // Get current user UID
  getCurrentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  // Fetch user details from Firestore
  async getUserData(): Promise<any> {
    const uid = this.getCurrentUserId();
    if (!uid) return null;

    const userDoc = await getDoc(doc(this.firestore, 'registration', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }
}
