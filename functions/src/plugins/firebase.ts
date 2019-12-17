import * as firebaseFunctions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
firebaseAdmin.initializeApp();

export const functions = firebaseFunctions.region("asia-northeast1");
export const db = firebaseAdmin.firestore();

export type DocumentReference = firebaseAdmin.firestore.DocumentReference;
export type CollectionReference = firebaseAdmin.firestore.CollectionReference;
