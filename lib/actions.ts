"use server";

import { Identifiant, Serveur } from "@prisma/client";

import { NodeSSH } from "node-ssh";
import { DechiffrerString } from "@/lib/chiffrement";

export async function EnvoyerCommande(
  serveur: Serveur,
  identifiant: Identifiant,
  commande: string
) {
  const ssh = new NodeSSH();

  const cleSSH = await DechiffrerString(identifiant.cleSSH || "");

  try {
    await ssh.connect({
      host: serveur.ip,
      username: identifiant.nomUtilisateur,
      privateKey: cleSSH,
    });
  } catch (e: any) {
    return { stdout: "", stderr: e.message, code: 1 };
  }

  const sortie = await ssh.execCommand(commande);
  return sortie;
}

// fonction retirant la demande de mot de passe sudo des erreurs
export async function retirerSudo(commande: string) {
  const regex = /\[sudo\][^:]*:/g;
  return commande.replace(regex, "").trim();
}
