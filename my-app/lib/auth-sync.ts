// Sync Firebase Auth with Supabase Auth
import { supabase } from './supabase';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// When a user signs in with Firebase, also sign them in to Supabase
export function syncFirebaseWithSupabase() {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get Firebase ID token
        const idToken = await firebaseUser.getIdToken();
        
        // Sign in to Supabase with the Firebase token
        // Note: This requires additional Supabase configuration
        console.log('Firebase user:', firebaseUser.uid);
        console.log('User email:', firebaseUser.email);
        
        // For now, we'll use Firebase UID as the user_id in Supabase
        // You can manually create user records or use Supabase Auth separately
      } catch (error) {
        console.error('Error syncing auth:', error);
      }
    }
  });
}

// Helper to get current user ID (Firebase)
export function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}
