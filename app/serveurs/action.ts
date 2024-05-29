"use server";

import { VerifierAuthentification } from "@/lib/nextAuth";
import { redirect } from "next/navigation";
import { ToastIntent } from "@fluentui/react-components";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EnvoyerCommande, retirerSudo } from "@/lib/actions";
import { DechiffrerString } from "@/lib/chiffrement";

export async function AjoutServeur(
  formData: FormData,
  typeDistribution: string,
  identifiant: string
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const donneesFormulaire = {
    nom: formData.get("nomServeur") as string,
    adresseIP: formData.get("adresseIP") as string,
    description: (formData.get("description") as string) || null,
    portSSH: Number(formData.get("portSSH")) as number,
    typeDistribution: typeDistribution,
    identifiant: identifiant,
  };
  const regexIP =
    /^(10\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))$/;
  if (!regexIP.test(donneesFormulaire.adresseIP)) {
    return {
      message: "L'adresse IP n'est pas valide",
      type: "error" as ToastIntent,
    };
  }
  if (donneesFormulaire.portSSH > 65535 || donneesFormulaire.portSSH < 0) {
    return {
      message: "Le port SSH doit être compris entre 0 et 65535",
      type: "error" as ToastIntent,
    };
  } else if (!Number.isInteger(donneesFormulaire.portSSH)) {
    return {
      message: "Le port SSH doit être un nombre entier",
      type: "error" as ToastIntent,
    };
  }

  if (
    donneesFormulaire.nom === "" ||
    donneesFormulaire.typeDistribution === "" ||
    donneesFormulaire.identifiant === ""
  ) {
    return {
      message: "Veuillez remplir tous les champs",
      type: "error" as ToastIntent,
    };
  }

  const serveur = await prisma.serveur.create({
    data: {
      nom: donneesFormulaire.nom,
      ip: donneesFormulaire.adresseIP,
      description: donneesFormulaire.description,
      portSSH: donneesFormulaire.portSSH,
      typeDistribution: {
        connect: {
          noTypeDistribution: donneesFormulaire.typeDistribution,
        },
      },
      Identifiant: {
        connect: {
          noIdentifiant: donneesFormulaire.identifiant,
        },
      },
    },
  });
  revalidatePath("/serveurs");
  return {
    message: "Le serveur " + serveur.nom + " a été ajouté avec succès",
    type: "success" as ToastIntent,
  };
}

export async function ModifierServeur(
  formData: FormData,
  noServeur: string,
  typeDistribution: string,
  identifiant: string
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const donneesFormulaire = {
    noServeur: noServeur,
    nom: formData.get("nomServeur") as string,
    adresseIP: formData.get("adresseIP") as string,
    description: (formData.get("description") as string) || null,
    portSSH: Number(formData.get("portSSH")) as number,
    typeDistribution: typeDistribution,
    identifiant: identifiant,
  };

  const regexIP =
    /^(10\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))$/;
  if (!regexIP.test(donneesFormulaire.adresseIP)) {
    return {
      message: "L'adresse IP n'est pas valide",
      type: "error" as ToastIntent,
    };
  }
  if (donneesFormulaire.portSSH > 65535 || donneesFormulaire.portSSH < 0) {
    return {
      message: "Le port SSH doit être compris entre 0 et 65535",
      type: "error" as ToastIntent,
    };
  } else if (!Number.isInteger(donneesFormulaire.portSSH)) {
    return {
      message: "Le port SSH doit être un nombre entier",
      type: "error" as ToastIntent,
    };
  }

  if (
    donneesFormulaire.nom === "" ||
    donneesFormulaire.adresseIP === "" ||
    donneesFormulaire.portSSH === 0 ||
    donneesFormulaire.typeDistribution === "" ||
    donneesFormulaire.identifiant === ""
  ) {
    return {
      message: "Veuillez remplir tous les champs",
      type: "error" as ToastIntent,
    };
  }

  if (
    await prisma.automatisationServeur.findFirst({
      where: {
        noServeurFK: donneesFormulaire.noServeur,
      },
    })
  ) {
    return {
      message: "Le serveur est utilisé par une ou plusieurs automatisations",
      type: "error" as ToastIntent,
    };
  }

  if (
    await prisma.automatisationGroupe.findFirst({
      where: {
        groupe: {
          serveurGroupe: {
            some: {
              noServeurFK: donneesFormulaire.noServeur,
            },
          },
        },
      },
    })
  ) {
    return {
      message:
        "Le serveur est utilisé par une ou plusieurs groupes d'automatisations",
      type: "error" as ToastIntent,
    };
  }

  const serveur = await prisma.serveur.update({
    where: { noServeur: donneesFormulaire.noServeur },
    data: {
      nom: donneesFormulaire.nom,
      ip: donneesFormulaire.adresseIP,
      description: donneesFormulaire.description,
      portSSH: donneesFormulaire.portSSH,
      typeDistribution: {
        connect: {
          noTypeDistribution: donneesFormulaire.typeDistribution,
        },
      },
      Identifiant: {
        connect: {
          noIdentifiant: donneesFormulaire.identifiant,
        },
      },
    },
  });
  revalidatePath("/serveurs");
  return {
    message: "Le serveur " + serveur.nom + " a été modifié avec succès",
    type: "success" as ToastIntent,
  };
}

export async function SupprimerServeur(noServeur: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  if (
    await prisma.automatisationServeur.findFirst({
      where: {
        noServeurFK: noServeur,
      },
    })
  ) {
    return {
      message: "Le serveur est utilisé par une ou plusieurs automatisations",
      type: "error" as ToastIntent,
    };
  }

  if (
    await prisma.automatisationGroupe.findFirst({
      where: {
        groupe: {
          serveurGroupe: {
            some: {
              noServeurFK: noServeur,
            },
          },
        },
      },
    })
  ) {
    return {
      message:
        "Le serveur est utilisé par une ou plusieurs groupes d'automatisations",
      type: "error" as ToastIntent,
    };
  }

  await prisma.serveur.delete({
    where: { noServeur: noServeur },
  });
  revalidatePath("/serveurs");
  return {
    message: "Le serveur a été supprimé avec succès",
    type: "success" as ToastIntent,
  };
}

export async function EnvoiCommandeServeur(
  noServeur: string,
  commande: string,
  execAdmin: boolean
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const serveur = await prisma.serveur.findFirst({
    where: {
      noServeur: noServeur,
    },
  });
  if (!serveur) {
    return { message: "Le serveur n'existe pas" };
  }
  const identifiant = await prisma.identifiant.findFirst({
    where: {
      noIdentifiant: serveur.noIdentifiantFK,
    },
  });

  if (!identifiant) {
    return {
      message: "L'identifiant n'existe pas",
    };
  }

  if (execAdmin && identifiant.nomUtilisateur.toLowerCase() !== "root") {
    if (!identifiant.motDePasse) {
      return {
        message: "L'identifiant n'a pas de mot de passe administrateur.",
      };
    }

    const motDePasse = await DechiffrerString(identifiant.motDePasse || "");
    // On ajoute sudo -S -u root devant chaque commande pour les exécuter avec les droits administrateurs
    // On ajoute echo ${mdpAdmin} | devant chaque commande pour envoyer le mot de passe administrateur
    const commandesAvecSudo = commande
      .split("\n")
      .map((ligne) => `echo ${motDePasse} | sudo -S ""${ligne}""`)
      .join("\n");
    const resultat = await EnvoyerCommande(
      serveur,
      identifiant,
      commandesAvecSudo
    );
    const erreur = await retirerSudo(resultat.stderr);

    if (resultat.stdout == "" && erreur == "") {
      return {
        message:
          "La commande n'a pas retourné de résultat (peut être intentionnel ou indiquer une erreur de connexion)",
      };
    } else if (erreur) {
      return { message: erreur + "\n" + resultat.stdout };
    } else {
      return { message: resultat.stdout };
    }
  }

  const resultat = await EnvoyerCommande(serveur, identifiant, commande);

  if (resultat.stdout == "" && resultat.stderr == "") {
    return {
      message:
        "La commande n'a pas retourné de résultat (peut être intentionnel ou indiquer une erreur de connexion)",
    };
  } else if (resultat.stderr) {
    return { message: resultat.stderr + "\n" + resultat.stdout };
  } else {
    return { message: resultat.stdout };
  }
}
