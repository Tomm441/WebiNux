"use server";

import * as crypto from "crypto";
import { redirect } from "next/navigation";
import { VerifierAuthentification } from "./nextAuth";
import prisma from "./prisma";

export async function ChiffrerCertificat(certificat: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const cle = process.env.CLE_AES256?.trim();
  console.log(cle);
  if (!cle) {
    throw new Error("La clé de chiffrement est introuvable");
  }

  const algoritme = "aes-256-cbc";
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algoritme, cle, iv);
  const certificatChiffre = Buffer.concat([
    iv,
    cipher.update(certificat),
    cipher.final(),
  ]);
  return certificatChiffre.toString("base64");
}

export async function DechiffrerCertificat(certificatSTR: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const certificat = Buffer.from(certificatSTR, "base64");
  const cle = process.env.CLE_AES256?.trim();
  if (!cle) {
    throw new Error("La clé de chiffrement est introuvable");
  }

  const iv = certificat.subarray(0, 16);
  const contenuChiffre = certificat.subarray(16);
  const algorithme = "aes-256-cbc";

  const dechiffreur = crypto.createDecipheriv(algorithme, cle, iv);
  let certificatDechiffre = Buffer.concat([
    dechiffreur.update(contenuChiffre),
    dechiffreur.final(),
  ]);

  return certificatDechiffre.toString();
}

// Fonction à éxécuter une seule fois pour créer les clés RSA de chiffrement
export async function CreerClesRSA() {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const {privateKey, publicKey} = crypto.generateKeyPairSync("rsa", {
    modulusLength: 8192,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  const clePubliqueChiffree = await ChiffrerCertificat(publicKey);
  const clePriveeChiffree = await ChiffrerCertificat(privateKey);

  await prisma.cleChiffrement.deleteMany({});

  await prisma.cleChiffrement.create({
    data: {
      clePrivee: clePriveeChiffree,
      clePublique: clePubliqueChiffree,
    },
  });
}


export async function ChiffrerString(str: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const strDechiffre = Buffer.from(str);
  const clePubliqueChiffree = (await prisma.cleChiffrement.findFirst())?.clePublique ?? '';
  const clePublique = crypto.createPublicKey(await DechiffrerCertificat(clePubliqueChiffree));

  const strChiffre = crypto.publicEncrypt(clePublique, strDechiffre);
  return strChiffre.toString("base64");
  
}

export async function DechiffrerString(strChiffre: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const str = Buffer.from(strChiffre, "base64");
  const clePriveeChiffree = (await prisma.cleChiffrement.findFirst())?.clePrivee ?? '';
  const clePrivee = crypto.createPrivateKey(await DechiffrerCertificat(clePriveeChiffree));

  const strDechiffre = crypto.privateDecrypt(clePrivee, str);
  return strDechiffre.toString();
}