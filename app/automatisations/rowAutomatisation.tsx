"use server";

import prisma from "@/lib/prisma";
import {
  TableRow,
  TableHeaderCell,
  InfoLabel,
} from "@fluentui/react-components";
import { automatisation, groupe, Serveur } from "@prisma/client";
import cronstrue from "cronstrue";
import "cronstrue/locales/fr";
import { getFutureMatches } from "@datasert/cronjs-matcher";
import { SupprimerDialogue, ModifierDialogue } from "./dialogues";

export default async function RowAutomatisation({
  automatisation,
  groupes,
  serveurs,
}: {
  automatisation: automatisation;
    groupes: {noGroupe : string, nom : string}[];
    serveurs: {noServeur : string, nom : string}[];
}) {
  const automatisationServeur = await prisma.automatisationServeur.findMany({
    where: {
      noAutomatisationFK: automatisation.noAutomatisation,
    },
  });

  const automatisationGroupe = await prisma.automatisationGroupe.findMany({
    where: {
      noAutomatisationFK: automatisation.noAutomatisation,
    },
  });

  

const serveursAffecteAutomatisation = serveurs.filter((serveur) =>
    automatisationServeur.some(
        (automatisationServeur) =>
            automatisationServeur.noServeurFK === serveur.noServeur,
    ),
);


  const groupesAffecteAutomatisation = groupes.filter((groupe) =>
    automatisationGroupe.some(
      (automatisationGroupe) =>
        automatisationGroupe.nogroupeFK === groupe.noGroupe
    )
  );

  const cron = `${automatisation.cronMinute} ${automatisation.cronHeure} ${automatisation.cronJour} ${automatisation.cronMois} ${automatisation.cronJourSemaine}`;
  const nbServeur = automatisationServeur.length;
  const nbGroupe = automatisationGroupe.length;
  const prochainesExecutions = getFutureMatches(cron, {
    formatInTimezone: true,
    timezone: "America/Montreal",
    matchCount: 2,
  });

  return (
    <TableRow>
      <TableHeaderCell>
        {automatisation.description ? (
          <InfoLabel info={automatisation.description}>
            {automatisation.nom}
          </InfoLabel>
        ) : (
          automatisation.nom
        )}
      </TableHeaderCell>
      <TableHeaderCell>
        {cronstrue.toString(cron, { locale: "fr" })}
      </TableHeaderCell>
      <TableHeaderCell>
        <ul>
          {prochainesExecutions.map((prochaineExecution) => (
            <li key={prochaineExecution}>
              {new Date(prochaineExecution).toLocaleString()}
            </li>
          ))}
        </ul>
      </TableHeaderCell>

      <TableHeaderCell>{nbGroupe}</TableHeaderCell>
      <TableHeaderCell>{nbServeur}</TableHeaderCell>
      <TableHeaderCell>{automatisation.admin ? "Automatisation système" : "Automatisation utilisateur"}</TableHeaderCell>
      <TableHeaderCell>
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <ModifierDialogue
            groupes={groupes}
            serveurs={serveurs}
            automatisation={automatisation}
            serveursSelectionnes={serveursAffecteAutomatisation}
            groupesSelectionnes={groupesAffecteAutomatisation}/>

            <SupprimerDialogue
              noAutomatisation={automatisation.noAutomatisation}
              nomAutomatisation={automatisation.nom}
            />
          </div>
        </div>
      </TableHeaderCell>
    </TableRow>
  );
}
