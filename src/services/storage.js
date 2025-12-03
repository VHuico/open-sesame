import { db, auth } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'passwords';

const getCollection = () => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    return collection(db, COLLECTION_NAME);
};

export const saveItem = async (item) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Add userId to the item
    const itemWithUser = { ...item, userId: user.uid };

    const docRef = await addDoc(getCollection(), itemWithUser);
    return docRef.id;
};

export const updateItem = async (id, updates) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
};

export const getAllItems = async () => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(getCollection(), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const deleteItem = async (id) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
};
