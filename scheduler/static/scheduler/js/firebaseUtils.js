// firebaseUtils.js

import { getFirestore, collection, getDocs, query, where, addDoc, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// Initialize Firestore and Storage
const db = getFirestore();
const storage = getStorage();

/**
 * Fetch a document from Firestore by collection and ID.
 * @param {string} collectionName - Name of the Firestore collection.
 * @param {string} docId - ID of the document.
 * @returns {Promise} - Firestore document data.
 */
export async function fetchDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
}

/**
 * Fetch multiple documents from Firestore by collection and query condition.
 * @param {string} collectionName - Name of the Firestore collection.
 * @param {Object} queryCondition - Firestore query condition.
 * @returns {Promise} - Array of document data.
 */
export async function fetchDocumentsByCondition(collectionName, queryCondition) {
  try {
    const q = query(collection(db, collectionName), where(...queryCondition));
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push(doc.data());
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

/**
 * Add a new document to Firestore.
 * @param {string} collectionName - Name of the Firestore collection.
 * @param {Object} data - Data to be added to Firestore.
 * @returns {Promise} - Firestore document reference.
 */
export async function addDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef;
  } catch (error) {
    console.error("Error adding document:", error);
    return null;
  }
}

/**
 * Update an existing document in Firestore.
 * @param {string} collectionName - Name of the Firestore collection.
 * @param {string} docId - ID of the document to update.
 * @param {Object} data - Data to be updated in Firestore.
 * @returns {Promise} - Firestore document reference.
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return docRef;
  } catch (error) {
    console.error("Error updating document:", error);
    return null;
  }
}

/**
 * Upload a file to Firebase Storage.
 * @param {File} file - File to be uploaded.
 * @param {string} path - Storage path where the file will be uploaded.
 * @returns {Promise} - Download URL of the uploaded file.
 */
export async function uploadFile(file, path) {
  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optionally handle progress here if needed
        },
        (error) => {
          console.error("Error uploading file:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

