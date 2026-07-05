"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./auth";

export async function signInWithGoogle(): Promise<string> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}
