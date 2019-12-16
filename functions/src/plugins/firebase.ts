import * as firebaseFunctions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
firebaseAdmin.initializeApp();

export const db = firebaseAdmin.firestore();
export const functions = firebaseFunctions.region("asia-northeast1");
export const admin = firebaseAdmin;

export type DocumentReference = firebaseAdmin.firestore.DocumentReference;
export type CollectionReference = firebaseAdmin.firestore.CollectionReference;
