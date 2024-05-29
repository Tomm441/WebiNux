"use server";

import prisma from "@/lib/prisma";
import { ToastIntent } from "@fluentui/react-components";
import { VerifierAuthentification } from "@/lib/nextAuth";
import { redirect } from "next/navigation";
import { parse } from "@datasert/cronjs-parser";
import { revalidatePath } from "next/cache";
import { Serveur } from "@prisma/client";
import { creerCronJob, supprimerCronJob } from "./cronjob";

export async function AjoutAutomatisation(
  formData: FormData,
  serveurs: string[],
  groupes: string[]
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const donneesFormulaire = {
    nom: formData.get("nomAutomatisation") as string,
    description: (formData.get("description") as string) || null,
    admin: Boolean(formData.get("admin")),
    serveurs: serveurs,
    groupes: groupes,
    script: formData.get("script") as string,
    cronMinutes: formData.get("minute") as string,
    cronHeures: formData.get("heure") as string,
    cronJours: formData.get("jourMois") as string,
    cronMois: formData.get("mois") as string,
    cronJoursSemaine: formData.get("jourSemaine") as string,
  };



  if (
    donneesFormulaire.nom === "" ||
    donneesFormulaire.script === "" ||
    donneesFormulaire.cronMinutes === "" ||
    donneesFormulaire.cronHeures === "" ||
    donneesFormulaire.cronJours === "" ||
    donneesFormulaire.cronMois === "" ||
    donneesFormulaire.cronJoursSemaine === ""
  ) {
    return {
      message: "Veuillez remplir tous les champs",
      type: "error" as ToastIntent,
    };
  }

  if (
    donneesFormulaire.serveurs.length === 0 &&
    donneesFormulaire.groupes.length === 0
  ) {
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
    donneesFormulaire.groupes.length > 0 &&
    (await prisma.groupe.count({
      where: { noGroupe: { in: donneesFormulaire.groupes } },
    })) !== donneesFormulaire.groupes.length
  ) {
    return {
      message: "Un ou plusieurs groupes n'existent pas",
      type: "error" as ToastIntent,
    };
  }

  try {
    parse(
      `${donneesFormulaire.cronMinutes} ${donneesFormulaire.cronHeures} ${donneesFormulaire.cronJours} ${donneesFormulaire.cronMois} ${donneesFormulaire.cronJoursSemaine}`
    );
  } catch (e) {
    return {
      message: "Le cron n'est pas valide",
      type: "error" as ToastIntent,
    };
  }


  const serveursGroupe = await obtenirServeurGroupe(
    donneesFormulaire.groupes.slice(),
    donneesFormulaire.serveurs.slice()
  );


  if (donneesFormulaire.admin) {
    if (!(await verifierAdminAutomatisation(serveursGroupe))) {
      return {
        message:
          "Un ou plusieurs serveurs n'ont pas de mot de passe administrateur",
        type: "error" as ToastIntent,
      };
    }
  }



  const automatisation = await prisma.automatisation.create({
    data: {
      nom: donneesFormulaire.nom,
      description: donneesFormulaire.description,
      script: donneesFormulaire.script,
      admin: donneesFormulaire.admin,
      cronMinute: donneesFormulaire.cronMinutes,
      cronHeure: donneesFormulaire.cronHeures,
      cronJour: donneesFormulaire.cronJours,
      cronMois: donneesFormulaire.cronMois,
      cronJourSemaine: donneesFormulaire.cronJoursSemaine,
      automatisationServeur: {
        createMany: {
          data: donneesFormulaire.serveurs.map((noServeur) => ({
            noServeurFK: noServeur,
          })),
        },
      },
      automatisationGroupe: {
        createMany: {
          data: donneesFormulaire.groupes.map((noGroupe) => ({
            nogroupeFK: noGroupe,
          })),
        },
      },
    },
  });

  
  const serveursAut = await obtenirServeursAutomatisation(automatisation.noAutomatisation);

  await creerCronJob(automatisation, serveursAut);


  revalidatePath("/automatisations");
  return {
    message: "Automatisation ajoutée",
    type: "success" as ToastIntent,
  };
}

export async function SupprimerAutomatisation(noAutomatisation: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const automatisation = await prisma.automatisation.findUnique({
    where: { noAutomatisation: noAutomatisation },
  });
  if (!automatisation) {
    return {
      message: "L'automatisation n'existe pas",
      type: "error" as ToastIntent,
    };
  }

  const serveurs = await obtenirServeursAutomatisation(noAutomatisation);

  await supprimerCronJob(automatisation, serveurs)


  await prisma.automatisation.delete({
    where: { noAutomatisation: noAutomatisation },
  });
  revalidatePath("/automatisations");
  return {
    message: `L'automatisation a été supprimée avec succès`,
    type: "success" as ToastIntent,
  };
}

export async function ModifierAutomatisation(
  formData: FormData,
  serveurs: string[],
  groupes: string[],
  noAutomatisation: string,
  admin: boolean
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const donneesFormulaire = {
    nom: formData.get("nomAutomatisation") as string,
    description: (formData.get("description") as string) || null,
    admin: admin,
    serveurs: serveurs,
    groupes: groupes,
    script: formData.get("script") as string,
    cronMinutes: formData.get("minute") as string,
    cronHeures: formData.get("heure") as string,
    cronJours: formData.get("jourMois") as string,
    cronMois: formData.get("mois") as string,
    cronJoursSemaine: formData.get("jourSemaine") as string,
  };


  if (
    donneesFormulaire.nom === "" ||
    donneesFormulaire.script === "" ||
    donneesFormulaire.cronMinutes === "" ||
    donneesFormulaire.cronHeures === "" ||
    donneesFormulaire.cronJours === "" ||
    donneesFormulaire.cronMois === "" ||
    donneesFormulaire.cronJoursSemaine === ""
  ) {
    return {
      message: "Veuillez remplir tous les champs",
      type: "error" as ToastIntent,
    };
  }

  if (
    donneesFormulaire.serveurs.length === 0 &&
    donneesFormulaire.groupes.length === 0
  ) {
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
    donneesFormulaire.groupes.length > 0 &&
    (await prisma.groupe.count({
      where: { noGroupe: { in: donneesFormulaire.groupes } },
    })) !== donneesFormulaire.groupes.length
  ) {
    return {
      message: "Un ou plusieurs groupes n'existent pas",
      type: "error" as ToastIntent,
    };
  }

  try {
    parse(
      `${donneesFormulaire.cronMinutes} ${donneesFormulaire.cronHeures} ${donneesFormulaire.cronJours} ${donneesFormulaire.cronMois} ${donneesFormulaire.cronJoursSemaine}`
    );
  } catch (e) {
    return {
      message: "Le cron n'est pas valide",
      type: "error" as ToastIntent,
    };
  }

  const serveursGroupe = await obtenirServeurGroupe(
    donneesFormulaire.groupes.slice(),
    donneesFormulaire.serveurs.slice()
  );

  if (donneesFormulaire.admin) {
    if (!(await verifierAdminAutomatisation(serveursGroupe))) {
      return {
        message:
          "Un ou plusieurs serveurs n'ont pas de mot de passe administrateur",
        type: "error" as ToastIntent,
      };
    }
  }
  
  const serveursActuels = await obtenirServeursAutomatisation(noAutomatisation);
  const automatisationActuelle = await prisma.automatisation.findUnique({
    where: { noAutomatisation: noAutomatisation },
  });

  if (!automatisationActuelle) {
    return {
      message: "L'automatisation n'existe pas",
      type: "error" as ToastIntent,
    };
  }



  await supprimerCronJob(automatisationActuelle, serveursActuels)


  const automatisation = await prisma.automatisation.update({
    where: { noAutomatisation: noAutomatisation },
    data: {
      nom: donneesFormulaire.nom,
      description: donneesFormulaire.description,
      script: donneesFormulaire.script,
      admin: donneesFormulaire.admin,
      cronMinute: donneesFormulaire.cronMinutes,
      cronHeure: donneesFormulaire.cronHeures,
      cronJour: donneesFormulaire.cronJours,
      cronMois: donneesFormulaire.cronMois,
      cronJourSemaine: donneesFormulaire.cronJoursSemaine,
      automatisationGroupe: {
        deleteMany: {},
        createMany: {
          data: donneesFormulaire.groupes.map((noGroupe) => ({
            nogroupeFK: noGroupe,
          })),
        },
      },
      automatisationServeur: {
        deleteMany: {},
        createMany: {
          data: donneesFormulaire.serveurs.map((noServeur) => ({
            noServeurFK: noServeur,
          })),
        },
      },
    },
  });



  await creerCronJob(automatisation, serveursGroupe)


  revalidatePath("/automatisations");
  return {
    message: "Automatisation modifiée",
    type: "success" as ToastIntent,
  };
}

// Vérifie si les serveurs ont un mot de passe administrateur ou sont root
export async function verifierAdminAutomatisation(noServeur: string[]) {
  const identifiants = await prisma.identifiant.findMany({
    where: {
      serveur: {
        some: {
          noServeur: {
            in: noServeur,
          },
        },
      },
    },
    select: {
      motDePasse: true,
      nomUtilisateur: true,
    },
  });

  if (
    identifiants.some(
      (i) => i.motDePasse == null && i.nomUtilisateur.toLowerCase() !== "root"
    )
  ) {
    return false;
  }
  return true;
}

export async function obtenirServeursAutomatisation(noAutomatisation: string) {
  // Récupère les serveurs des groupes de serveurs
  const noServeurServeur = (
    await prisma.automatisationServeur.findMany({
      where: {
        noAutomatisationFK: noAutomatisation,
      },
      select: {
        serveur: {
          select: {
            noServeur: true,
          },
        },
      },
    })
  ).map((a) => a.serveur.noServeur);

  // Récupère les serveurs des groupes
  const noServeurGroupe = (
    await prisma.automatisationGroupe.findMany({
      where: {
        noAutomatisationFK: noAutomatisation,
      },
      select: {
        groupe: {
          select: {
            serveurGroupe: {
              select: {
                noServeurFK: true,
              },
            },
          },
        },
      },
    })
  )
    .map((a) => a.groupe.serveurGroupe.map((s) => s.noServeurFK))
    .flat();

  // Fusionne les deux tableaux
  noServeurServeur.push(...noServeurGroupe);

  // Retire les doublons
  const noServeur = Array.from(new Set(noServeurServeur));

  return noServeur;
}

export async function obtenirServeurGroupe(
  noGroupe: string[],
  noServeur: string[]
) {
  const serveursGroupe = await prisma.groupe.findMany({
    where: {
      noGroupe: {
        in: noGroupe,
      },
    },
    select: {
      serveurGroupe: {
        select: {
          noServeurFK: true,
        },
      },
    },
  });

  noServeur.push(
    ...serveursGroupe
      .map((g) => g.serveurGroupe.map((s) => s.noServeurFK))
      .flat()
  );

  const serveurs = Array.from(new Set(noServeur));

  return serveurs;
}


