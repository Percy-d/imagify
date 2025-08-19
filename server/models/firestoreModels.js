import admin from 'firebase-admin';

let db;

const getDb = () => {
    if (!db) {
        db = admin.firestore();
    }
    return db;
};

export const getUserCollection = () => getDb().collection('users');
export const getTransactionCollection = () => getDb().collection('transactions');

export const createUser = async (userData) => {
    const docRef = await getUserCollection().add({
        ...userData,
        creditBalance: userData.creditBalance || 5,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...userData };
};

export const findUserByEmail = async (email) => {
    const snapshot = await getUserCollection().where('email', '==', email).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
};

export const findUserById = async (userId) => {
    const doc = await getUserCollection().doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

export const updateUserById = async (userId, updateData) => {
    await getUserCollection().doc(userId).update(updateData);
    return await findUserById(userId);
};

export const createTransaction = async (transactionData) => {
    const docRef = await getTransactionCollection().add({
        ...transactionData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...transactionData };
};

export const findTransactionById = async (transactionId) => {
    const doc = await getTransactionCollection().doc(transactionId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

export const updateTransactionById = async (transactionId, updateData) => {
    await getTransactionCollection().doc(transactionId).update(updateData);
    return await findTransactionById(transactionId);
};