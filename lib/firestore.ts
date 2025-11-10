import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { Exhibition, Artwork } from '@/types';

const EXHIBITIONS_COLLECTION = 'exhibitions';
const ARTWORKS_COLLECTION = 'artworks';

// Exhibition operations
export async function getExhibition(id: string): Promise<Exhibition | null> {
  try {
    const docRef = doc(db, EXHIBITIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Exhibition;
    }
    return null;
  } catch (error) {
    console.error('Error getting exhibition:', error);
    return null;
  }
}

export async function getAllExhibitions(): Promise<Exhibition[]> {
  try {
    const q = query(
      collection(db, EXHIBITIONS_COLLECTION),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Exhibition[];
  } catch (error) {
    console.error('Error getting exhibitions:', error);
    return [];
  }
}

export async function createExhibition(exhibition: Omit<Exhibition, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, EXHIBITIONS_COLLECTION), {
      ...exhibition,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating exhibition:', error);
    return null;
  }
}

export async function updateExhibition(id: string, updates: Partial<Exhibition>): Promise<boolean> {
  try {
    const docRef = doc(db, EXHIBITIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating exhibition:', error);
    return false;
  }
}

export async function deleteExhibition(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, EXHIBITIONS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting exhibition:', error);
    return false;
  }
}

// Artwork operations
export async function getArtworksByExhibition(exhibitionId: string): Promise<Artwork[]> {
  try {
    const q = query(
      collection(db, ARTWORKS_COLLECTION),
      where('exhibitionId', '==', exhibitionId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Artwork[];
  } catch (error) {
    console.error('Error getting artworks:', error);
    return [];
  }
}

export async function createArtwork(artwork: Omit<Artwork, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, ARTWORKS_COLLECTION), {
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

export async function updateArtwork(id: string, updates: Partial<Artwork>): Promise<boolean> {
  try {
    const docRef = doc(db, ARTWORKS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating artwork:', error);
    return false;
  }
}

export async function deleteArtwork(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, ARTWORKS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return false;
  }
}





