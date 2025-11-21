import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { Exhibition, Artwork, User } from '@/types';

const EXHIBITIONS_COLLECTION = 'exhibitions';
const ARTWORKS_COLLECTION = 'artworks';
const USERS_COLLECTION = 'users';

// Helper function to check if db is available
function ensureDb() {
  if (!db) {
    const error = new Error('Firebase Firestore is not initialized. Please check your .env.local file.');
    console.error('❌ Firebase: Database not available:', {
      db: db,
      isConfigured: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    throw error;
  }
  return db;
}

// Helper function to check if error is offline/unavailable
function isOfflineError(error: any): boolean {
  return error?.code === 'unavailable' || error?.code === 'failed-precondition';
}

// Helper function to remove undefined and null values from an object
// CRITICAL: Empty arrays, empty strings, and false values are kept as they are valid Firestore values
function removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    // Remove undefined and null values, but keep empty arrays, empty strings, and false values
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  });
  return cleaned;
}

// Exhibition operations
export async function getExhibition(id: string): Promise<Exhibition | null> {
  try {
    const firestoreDb = ensureDb();
    const docRef = doc(firestoreDb, EXHIBITIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Get artworks for this exhibition
      const artworks = await getArtworksByExhibition(id);
      console.log(`✅ Firebase: Loaded exhibition "${id}" with ${artworks.length} artworks`);
      return { 
        id: docSnap.id, 
        ...data,
        artworks
      } as Exhibition;
    }
    console.log(`⚠️ Firebase: Exhibition "${id}" not found in Firestore`);
    return null;
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn(`⚠️ Firebase: Client is offline. Exhibition "${id}" will use mock data.`);
    } else {
      console.error('❌ Firebase: Error getting exhibition:', error);
    }
    return null;
  }
}

export async function getAllExhibitions(userId?: string): Promise<Exhibition[]> {
  try {
    const firestoreDb = ensureDb();
    let exhibitions: Exhibition[] = [];
    
    if (userId) {
      // Get exhibitions for a specific user
      // Query both ownerId (new) and userId (legacy) for backward compatibility
      console.log(`🔍 Querying exhibitions for user: ${userId}`);
      
      let ownerIdDocs: any[] = [];
      let userIdDocs: any[] = [];
      
      try {
        // Query by ownerId (new field)
        const ownerIdQuerySnapshot = await getDocs(query(
          collection(firestoreDb, EXHIBITIONS_COLLECTION),
          where('ownerId', '==', userId)
        ));
        ownerIdDocs = ownerIdQuerySnapshot.docs;
        console.log(`✅ Found ${ownerIdDocs.length} exhibitions with ownerId=${userId}`);
      } catch (ownerIdError: any) {
        console.warn(`⚠️ Error querying by ownerId:`, ownerIdError);
        if (!isOfflineError(ownerIdError)) {
          console.error('❌ Non-offline error querying by ownerId:', ownerIdError);
        }
      }
      
      try {
        // Query by userId (legacy field)
        const userIdQuerySnapshot = await getDocs(query(
          collection(firestoreDb, EXHIBITIONS_COLLECTION),
          where('userId', '==', userId)
        ));
        userIdDocs = userIdQuerySnapshot.docs;
        console.log(`✅ Found ${userIdDocs.length} exhibitions with userId=${userId}`);
      } catch (userIdError: any) {
        console.warn(`⚠️ Error querying by userId:`, userIdError);
        if (!isOfflineError(userIdError)) {
          console.error('❌ Non-offline error querying by userId:', userIdError);
        }
      }
      
      // Combine results and remove duplicates
      const allDocs = [...ownerIdDocs, ...userIdDocs];
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.id, doc])).values()
      );
      
      console.log(`📊 Total unique exhibitions found: ${uniqueDocs.length} (ownerId: ${ownerIdDocs.length}, userId: ${userIdDocs.length})`);
      
      exhibitions = uniqueDocs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Exhibition;
      });
      
      // Sort by createdAt descending (in memory)
      exhibitions.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 
                     (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 
                     (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 
                     (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 
                     (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
        return bTime - aTime;
      });
      
      // Log exhibition details for debugging
      if (exhibitions.length > 0) {
        console.log(`📋 Exhibition IDs:`, exhibitions.map(e => ({ id: e.id, ownerId: e.ownerId, userId: e.userId, title: e.title })));
      }
    } else {
      // Get all public exhibitions
      const querySnapshot = await getDocs(query(
        collection(firestoreDb, EXHIBITIONS_COLLECTION),
        where('isPublic', '==', true),
        orderBy('date', 'desc')
      ));
      
      exhibitions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Exhibition[];
    }
    
    if (exhibitions.length > 0) {
      console.log(`✅ Firebase: Loaded ${exhibitions.length} exhibitions from Firestore`);
    } else {
      console.log('⚠️ Firebase: No exhibitions found in Firestore, will use mock data');
    }
    
    return exhibitions;
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn('⚠️ Firebase: Client is offline. Will use mock data.');
    } else {
      console.error('❌ Firebase: Error getting exhibitions:', error);
      console.log('⚠️ Firebase: Falling back to mock data');
    }
    return [];
  }
}

export async function createExhibition(exhibition: Omit<Exhibition, 'id'>): Promise<string | null> {
  try {
    const firestoreDb = ensureDb();
    // Remove undefined values before saving to Firestore
    // This ensures we don't send undefined fields which Firestore rejects
    const cleanedData = removeUndefinedValues(exhibition);
    
    console.log('Creating exhibition with data:', cleanedData);
    
    const docRef = await addDoc(collection(firestoreDb, EXHIBITIONS_COLLECTION), {
      ...cleanedData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Exhibition created successfully:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error creating exhibition:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    throw error; // Re-throw to allow caller to handle
  }
}

export async function updateExhibition(id: string, updates: Partial<Exhibition>, userId?: string): Promise<boolean> {
  try {
    const firestoreDb = ensureDb();
    
    // Check permissions: verify user owns the exhibition
    if (userId) {
      const docRef = doc(firestoreDb, EXHIBITIONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('Exhibition not found');
        return false;
      }
      
      const exhibitionData = docSnap.data() as Exhibition;
      // Check both ownerId and userId for backward compatibility
      const ownerId = exhibitionData.ownerId || exhibitionData.userId;
      if (ownerId !== userId) {
        console.error('Permission denied: User does not own this exhibition');
        throw new Error('You do not have permission to update this exhibition');
      }
    }
    
    // Remove undefined values before updating Firestore
    const cleanedUpdates = removeUndefinedValues(updates);
    const docRef = doc(firestoreDb, EXHIBITIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...cleanedUpdates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error: any) {
    console.error('Error updating exhibition:', error);
    if (error.message) {
      throw error;
    }
    return false;
  }
}

export async function deleteExhibition(id: string, userId?: string): Promise<boolean> {
  try {
    const firestoreDb = ensureDb();
    
    // Check permissions: verify user owns the exhibition
    if (userId) {
      const docRef = doc(firestoreDb, EXHIBITIONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('Exhibition not found');
        return false;
      }
      
      const exhibitionData = docSnap.data() as Exhibition;
      // Check both ownerId and userId for backward compatibility
      const ownerId = exhibitionData.ownerId || exhibitionData.userId;
      if (ownerId !== userId) {
        console.error('Permission denied: User does not own this exhibition');
        throw new Error('You do not have permission to delete this exhibition');
      }
    }
    
    const docRef = doc(firestoreDb, EXHIBITIONS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting exhibition:', error);
    if (error.message) {
      throw error;
    }
    return false;
  }
}

// Artwork operations
export async function getArtworksByExhibition(exhibitionId: string): Promise<Artwork[]> {
  try {
    const firestoreDb = ensureDb();
    const q = query(
      collection(firestoreDb, ARTWORKS_COLLECTION),
      where('exhibitionId', '==', exhibitionId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Artwork[];
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn(`⚠️ Firebase: Client is offline. Artworks for exhibition "${exhibitionId}" will use mock data.`);
    } else {
      console.error('Error getting artworks:', error);
    }
    return [];
  }
}

export async function createArtwork(artwork: Omit<Artwork, 'id'>): Promise<string | null> {
  try {
    const firestoreDb = ensureDb();
    const docRef = await addDoc(collection(firestoreDb, ARTWORKS_COLLECTION), {
      ...artwork,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating artwork:', error);
    return null;
  }
}

export async function updateArtwork(id: string, updates: Partial<Artwork>, userId?: string): Promise<boolean> {
  try {
    const firestoreDb = ensureDb();
    
    // Check permissions: verify user owns the artwork
    if (userId) {
      const docRef = doc(firestoreDb, ARTWORKS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('Artwork not found');
        return false;
      }
      
      const artworkData = docSnap.data() as Artwork;
      if (artworkData.userId !== userId) {
        console.error('Permission denied: User does not own this artwork');
        throw new Error('You do not have permission to update this artwork');
      }
    }
    
    const docRef = doc(firestoreDb, ARTWORKS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error: any) {
    console.error('Error updating artwork:', error);
    if (error.message) {
      throw error;
    }
    return false;
  }
}

export async function deleteArtwork(id: string, userId?: string): Promise<boolean> {
  try {
    const firestoreDb = ensureDb();
    
    // Check permissions: verify user owns the artwork
    if (userId) {
      const docRef = doc(firestoreDb, ARTWORKS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('Artwork not found');
        return false;
      }
      
      const artworkData = docSnap.data() as Artwork;
      if (artworkData.userId !== userId) {
        console.error('Permission denied: User does not own this artwork');
        throw new Error('You do not have permission to delete this artwork');
      }
    }
    
    const docRef = doc(firestoreDb, ARTWORKS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting artwork:', error);
    if (error.message) {
      throw error;
    }
    return false;
  }
}

// User operations
export async function getUser(userId: string): Promise<User | null> {
  try {
    const firestoreDb = ensureDb();
    const docRef = doc(firestoreDb, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as User;
    }
    return null;
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn(`⚠️ Firebase: Client is offline. User "${userId}" not available.`);
    } else {
      console.error('❌ Firebase: Error getting user:', error);
    }
    return null;
  }
}

export async function createUser(user: Omit<User, 'id'>): Promise<string | null> {
  try {
    const firestoreDb = ensureDb();
    const docRef = await addDoc(collection(firestoreDb, USERS_COLLECTION), {
      ...user,
      createdExhibitions: [],
      createdArtworks: [],
      bookmarkedExhibitions: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    const firestoreDb = ensureDb();
    const docRef = doc(firestoreDb, USERS_COLLECTION, userId);
    
    // Filter out undefined values - Firestore doesn't allow undefined
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    
    // If no valid updates, return early
    if (Object.keys(cleanUpdates).length === 0) {
      console.log('⚠️ Firebase: No valid updates to apply (all values are undefined)');
      return true;
    }
    
    // Try to update first - if document doesn't exist, updateDoc will fail
    // In that case, we'll catch and use setDoc instead
    try {
      // Try updateDoc first (works for existing documents and queues offline)
      await updateDoc(docRef, {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Firebase: User updated successfully');
      return true;
    } catch (updateError: any) {
      // If updateDoc fails because document doesn't exist, create it
      if (updateError?.code === 'not-found' || updateError?.message?.includes('No document to update')) {
        console.log('⚠️ Firebase: User document does not exist, creating new user document');
        // Use setDoc with merge to avoid overwriting if document exists
        await setDoc(docRef, {
          id: userId,
          ...cleanUpdates,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }, { merge: true });
        console.log('✅ Firebase: User document created successfully');
        return true;
      }
      // If it's an offline error, the update is queued - that's fine
      if (isOfflineError(updateError)) {
        console.warn('⚠️ Firebase: Client is offline. Update is queued and will sync when connection is restored.');
        return true;
      }
      // Re-throw other errors
      throw updateError;
    }
  } catch (error: any) {
    console.error('❌ Firebase: Error updating user:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      name: error?.name
    });
    
    // Firestore with offline persistence will queue writes when offline
    // So we should only throw errors for actual failures, not offline state
    if (isOfflineError(error)) {
      console.warn('⚠️ Firebase: Client is offline. Update is queued and will sync when connection is restored.');
      // Don't throw - offline writes are queued and will sync automatically
      return true;
    }
    
    // For other errors, throw to let caller handle
    throw error;
  }
}

export async function getUserExhibitions(userId: string): Promise<Exhibition[]> {
  return getAllExhibitions(userId);
}

export async function getUserArtworks(userId: string): Promise<Artwork[]> {
  try {
    const firestoreDb = ensureDb();
    const q = query(
      collection(firestoreDb, ARTWORKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Artwork[];
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn(`⚠️ Firebase: Client is offline. Artworks for user "${userId}" not available.`);
    } else {
      console.error('Error getting user artworks:', error);
    }
    return [];
  }
}

// Passkey operations
const PASSKEYS_COLLECTION = 'passkeys';

export async function savePasskey(userId: string, passkey: { id: string; publicKey: string; counter: number; deviceName?: string; createdAt: Date }): Promise<boolean> {
  try {
    const firestoreDb = ensureDb();
    await setDoc(doc(firestoreDb, PASSKEYS_COLLECTION, passkey.id), {
      userId,
      ...passkey,
      createdAt: Timestamp.fromDate(passkey.createdAt),
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error saving passkey:', error);
    return false;
  }
}

export async function getPasskey(credentialId: string): Promise<{ userId: string; id: string; publicKey: string; counter: number; deviceName?: string } | null> {
  try {
    const firestoreDb = ensureDb();
    const docRef = doc(firestoreDb, PASSKEYS_COLLECTION, credentialId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId: data.userId,
        id: data.id,
        publicKey: data.publicKey,
        counter: data.counter,
        deviceName: data.deviceName,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting passkey:', error);
    return null;
  }
}

export async function getUserPasskeys(userId: string): Promise<Array<{ id: string; deviceName?: string; createdAt: Date }>> {
  try {
    const firestoreDb = ensureDb();
    const q = query(
      collection(firestoreDb, PASSKEYS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        deviceName: data.deviceName,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting user passkeys:', error);
    return [];
  }
}

export async function deletePasskey(credentialId: string): Promise<boolean> {
  try {
    const firestoreDb = ensureDb();
    await deleteDoc(doc(firestoreDb, PASSKEYS_COLLECTION, credentialId));
    return true;
  } catch (error) {
    console.error('Error deleting passkey:', error);
    return false;
  }
}





