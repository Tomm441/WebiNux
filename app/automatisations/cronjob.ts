"use server";

import { automatisation } from "@prisma/client";
import prisma from "@/lib/prisma";
import { DechiffrerString } from "@/lib/chiffrement";
import { EnvoyerCommande } from "@/lib/actions";

export async function creerCronJob(
  automatisation: automatisation,
  noServeur: string[]
) {
  const cron = `${automatisation.cronMinute} ${automatisation.cronHeure} ${automatisation.cronJour} ${automatisation.cronMois} ${automatisation.cronJourSemaine}`;
  const serveurs = await prisma.serveur.findMany({
    where: {
      noServeur: {
        in: noServeur,
      },
    },
    include: {
      Identifiant: true,
    },
  });

  let commande : string = `echo '${cron} ${automatisation.script} #ID:${automatisation.noAutomatisation} WebiNux' >> /etc/crontab`;

  serveurs.forEach(async (serveur) => {
    let commandeServeur =`(crontab -l 2>/dev/null; echo '${cron} ${automatisation.script} #ID:${automatisation.noAutomatisation} WebiNux') | crontab -`
    if (serveur.Identifiant) {
      if (
        automatisation.admin &&
        serveur.Identifiant?.nomUtilisateur.toLowerCase() !== "root"
      ) {
        const motDePasse = await DechiffrerString(
          serveur.Identifiant?.motDePasse || ""
        );
        commandeServeur = `echo '${motDePasse}' | sudo -S  bash -c "${commandeServeur}"`;
      }
      await EnvoyerCommande(serveur, serveur.Identifiant, commandeServeur);
    }
  });
}

export async function supprimerCronJob(
  automatisation: automatisation,
  noServeur: string[]
) {
  let commande = `(crontab -l | grep -v '${automatisation.noAutomatisation}') | crontab -`;
  const serveurs = await prisma.serveur.findMany({
    where: {
      noServeur: {
        in: noServeur,
      },
    },
    include: {
      Identifiant: true,
    },
  });

  serveurs.forEach(async (serveur) => {
    let commandeServeur = commande.slice();
    if (serveur.Identifiant) {
      if (automatisation.admin && serveur.Identifiant?.nomUtilisateur.toLowerCase() !== "root") {
        const motDePasse = await DechiffrerString(serveur.Identifiant?.motDePasse || "");
        commandeServeur = `echo '${motDePasse}' | sudo -S  bash -c "${commandeServeur}"`;
      }
      await EnvoyerCommande(serveur, serveur.Identifiant, commandeServeur);
    }
  });

  /* if (automatisation.admin) {
    // Remplace les caractères spéciaux par leur équivalent en regex sinon la commande sed ne fonctionne pas
    const noAutomatisationRemplace = automatisation.noAutomatisation.replace(
      /([|*?+.^$&{}()[]\\])/g,
      "\\$1"
    );

    cronJob = `sed -i '/${noAutomatisationRemplace}/d' /etc/crontab`;
    serveurs.forEach(async (serveur) => {
      if (serveur.Identifiant) {
        if (serveur.Identifiant?.nomUtilisateur.toLowerCase() === "root") {
          await EnvoyerCommande(serveur, serveur.Identifiant, cronJob);
        } else {
          const motDePasse = await DechiffrerString(
            serveur.Identifiant?.motDePasse || ""
          );
          const commande = `echo ${motDePasse} | sudo -S bash -c "${cronJob}"`;

          await EnvoyerCommande(serveur, serveur.Identifiant, commande);
        }
      }
    });
  } else {
    cronJob = `(crontab -l | grep -v '${automatisation.noAutomatisation}') | crontab -`;
    serveurs.forEach(async (serveur) => {
      if (serveur.Identifiant) {
        await EnvoyerCommande(serveur, serveur.Identifiant, cronJob);
      }
    });
  } */
}
