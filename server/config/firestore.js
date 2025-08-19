import admin from 'firebase-admin';

const connectFirestore = async () => {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
        }
        console.log("Firestore connected");
        return admin.firestore();
    } catch (error) {
        console.error("Firestore connection error:", error);
        throw error;
    }
};

export default connectFirestore;