"use server";

import prisma from "@/lib/prisma";
import { ToastIntent } from "@fluentui/react-components";
import { VerifierAuthentification } from "@/lib/nextAuth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DechiffrerString } from "@/lib/chiffrement";
import { EnvoyerCommande, retirerSudo } from "@/lib/actions";

export async function AjoutGroupe(formData: FormData, serveurs: string[]) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const donneesFormulaire = {
    nom: formData.get("nomGroupe") as string,
    description: (formData.get("description") as string) || null,
    serveurs: serveurs,
  };

  if (donneesFormulaire.nom === "") {
    return {
      message: "Veuillez remplir tous les champs",
      type: "error" as ToastIntent,
    };
  }

  if (donneesFormulaire.serveurs.length === 0) {
    return {
      message: "Veuillez sélectionner au moins un serveur",
      type: "error" as ToastIntent,
    };
  }

  if (
    donneesFormulaire.serveurs.length > 0 &&
    (await prisma.serveur.count({
      where: { noServeur: { in: donneesFormulaire.serveurs } },
    })) !== donneesFormulaire.serveurs.length
  ) {
    return {
      message: "Un ou plusieurs serveurs n'existent pas",
      type: "error" as ToastIntent,
    };
  }

  await prisma.groupe.create({
    data: {
      nom: donneesFormulaire.nom,
      description: donneesFormulaire.description || "",
      serveurGroupe: {
        createMany: {
          data: donneesFormulaire.serveurs.map((noServeur) => ({
            noServeurFK: noServeur,
          })),
        },
      },
    },
  });

  revalidatePath("/groupes");
  return {
    message: "Groupe créé avec succès",
    type: "success" as ToastIntent,
  };
}

export async function SupprimerGroupe(noGroupe: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  if (
    await prisma.automatisationGroupe.findFirst({
      where: {
        nogroupeFK: noGroupe,
      },
    })
  ) {
    return {
      message: "Le groupe est utilisé par une ou plusieurs automatisations",
      type: "error" as ToastIntent,
    };
  }

  await prisma.groupe.delete({
    where: { noGroupe: noGroupe },
  });
  revalidatePath("/groupes");
  return {
    message: `Le groupe a été supprimé avec succès`,
    type: "success" as ToastIntent,
  };
}

export async function ModifierGroupe(
  formData: FormData,
  serveurs: string[],
  noGroupe: string
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const donneesFormulaire = {
    nom: formData.get("nomGroupe") as string,
    description: (formData.get("description") as string) || null,
    serveurs: serveurs,
  };

  if (donneesFormulaire.nom === "") {
    return {
      message: "Veuillez remplir tous les champs",
      type: "error" as ToastIntent,
    };
  }

  if (donneesFormulaire.serveurs.length === 0) {
    return {
      message: "Veuillez sélectionner au moins un serveur ou un groupe",
      type: "error" as ToastIntent,
    };
  }

  if (
    donneesFormulaire.serveurs.length > 0 &&
    (await prisma.serveur.count({
      where: { noServeur: { in: donneesFormulaire.serveurs } },
    })) !== donneesFormulaire.serveurs.length
  ) {
    return {
      message: "Un ou plusieurs serveurs n'existent pas",
      type: "error" as ToastIntent,
    };
  }

  if (
    await prisma.automatisationGroupe.findFirst({
      where: {
        nogroupeFK: noGroupe,
      },
    })
  ) {
    return {
      message: "Le groupe est utilisé par une ou plusieurs automatisations",
      type: "error" as ToastIntent,
    };
  }

  await prisma.groupe.update({
    where: { noGroupe: noGroupe },
    data: {
      nom: donneesFormulaire.nom,
      description: donneesFormulaire.description || "",
      serveurGroupe: {
        deleteMany: {},
        createMany: {
          data: donneesFormulaire.serveurs.map((noServeur) => ({
            noServeurFK: noServeur,
          })),
        },
      },
    },
  });
  revalidatePath("/groupes");
  return {
    message: "Groupe modifié avec succès",
    type: "success" as ToastIntent,
  };
}

export async function EnvoiCommandeGroupe(
  noGroupe: string,
  commande: string,
  execAdmin: boolean
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const resultatCommandes = [
    { serveur: "", message: "", type: "" as ToastIntent },
  ];

  resultatCommandes.shift();

  const serveurs = await prisma.serveur.findMany({
    where: {
      serveurGroupe: {
        some: {
          noGroupeFK: noGroupe,
        },
      },
    },
  });

  await Promise.all(
    serveurs.map(async (serveur) => {
      const identifiant = await prisma.identifiant.findFirst({
        where: {
          noIdentifiant: serveur.noIdentifiantFK,
        },
      });

      if (!identifiant) {
        resultatCommandes.push({
          serveur: serveur.nom,
          message: "L'identifiant n'existe pas",
          type: "error" as ToastIntent,
        });
      } else {
        if (execAdmin && identifiant.nomUtilisateur.toLowerCase() !== "root") {
          if (!identifiant.motDePasse) {
            resultatCommandes.push({
              serveur: serveur.nom,
              message: "L'identifiant n'a pas de mot de passe administrateur.",
              type: "error" as ToastIntent,
            });
          } else {
            const motDePasse = await DechiffrerString(
              identifiant.motDePasse || ""
            );
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

            const erreur = await retirerSudo(resultat.stderr )

            if (resultat.stdout == "" && erreur == "") {
              resultatCommandes.push({
                serveur: serveur.nom,
                message:
                  "La commande n'a pas retourné de résultat (peut être intentionnel ou indiquer une erreur de connexion)",
                type: "error" as ToastIntent,
              });
            } else if (erreur) {
              
              resultatCommandes.push({
                serveur: serveur.nom,
                message: erreur + "\n" + resultat.stdout,
                type: "error" as ToastIntent,
              });
            } else {
              resultatCommandes.push({
                serveur: serveur.nom,
                message: resultat.stdout,
                type: "success" as ToastIntent,
              });
            }
          }
        } else {
          const resultat = await EnvoyerCommande(
            serveur,
            identifiant,
            commande
          );
          if (resultat.stdout == "" && resultat.stderr == "") {
            resultatCommandes.push({
              serveur: serveur.nom,
              message:
                "La commande n'a pas retourné de résultat (peut être intentionnel ou indiquer une erreur de connexion)",
              type: "error" as ToastIntent,
            });
          } else if (resultat.stderr) {
            resultatCommandes.push({
              serveur: serveur.nom,
              message: resultat.stderr + "\n" + resultat.stdout,
              type: "error" as ToastIntent,
            });
          } else {
            resultatCommandes.push({
              serveur: serveur.nom,
              message: resultat.stdout,
              type: "success" as ToastIntent,
            });
          }
        }
      }
    })
  );
  return resultatCommandes;
}
