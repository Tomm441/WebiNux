"use server";

import prisma from "@/lib/prisma";
import { Serveur, TypeDistribution, Identifiant } from "@prisma/client";
import {
  TableRow,
  TableCell,
  TableCellLayout,
  InfoLabel,
} from "@fluentui/react-components";
import {
  ModifierDialogue,
  SupprimerDialogue,
  EnvoiCommande,
} from "./dialogues";

export default async function RowServeur({
  serveur,
  typesDistribution,
  identifiants,
}: {
  serveur: Serveur;
  typesDistribution: TypeDistribution[];
  identifiants: Identifiant[];
}) {
  const identifiant = await prisma.identifiant.findFirst({
    where: {
      noIdentifiant: serveur.noIdentifiantFK || "",
    },
  });

  const typeDistribution = await prisma.typeDistribution.findFirst({
    where: {
      noTypeDistribution: serveur.noTypeDistributionFK || "",
    },
  });

  return (
    <TableRow>
      <TableCell>
        {serveur.description ? (
          <InfoLabel info={serveur.description}>{serveur.nom}</InfoLabel>
        ) : (
          serveur.nom
        )}
      </TableCell>
      <TableCell>{serveur.ip}</TableCell>
      <TableCell>{typeDistribution?.nom}</TableCell>
      <TableCell>{serveur.portSSH}</TableCell>
      <TableCell>{identifiant?.nomIdentifiant}</TableCell>
      <TableCell>
        <TableCellLayout>
          <div className="flex justify-between">
            <EnvoiCommande
              serveur={{
                ...serveur,
                aMDPAdmin: identifiant?.motDePasse ? true : false,
                utilisateurRoot:
                  identifiant?.nomIdentifiant.toLowerCase() == "root",
              }}
            />
            <div className="flex space-x-2">
              <ModifierDialogue
                serveur={serveur}
                identifiants={identifiants.map((identifiant) => ({
                  id: identifiant.noIdentifiant,
                  nom: identifiant.nomIdentifiant,
                }))}
                typesDistribution={typesDistribution}
                nomIdentifiatDefaut={identifiant?.nomIdentifiant || ""}
                nomTypeDistributionDefaut={typeDistribution?.nom || ""}
              />
              <SupprimerDialogue
                noServeur={serveur.noServeur}
                nomServeur={serveur.nom}
              />
            </div>
          </div>
        </TableCellLayout>
      </TableCell>
    </TableRow>
  );
}
