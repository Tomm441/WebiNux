'use server'

import { auth } from "@/auth";
import { Session } from "next-auth";

export async function VerifierAuthentification(): Promise<boolean> {
    return auth().then((session) => {
        if (!session) {
            return false;
        }
        return true;
    });
}

export async function obtenirSession(): Promise<Session | null> {
    return auth().then((session) => {
        return session;
    });
}