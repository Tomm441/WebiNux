"use server";

import {
  TableRow,
  TableHeaderCell,
  InfoLabel,
} from "@fluentui/react-components";
import { groupe } from "@prisma/client";
import { EnvoiCommande, ModifierDialogue, SupprimerDialogue } from "./dialogues";

export default async function RowGroupe({
  groupe,
  automatisations,
  serveurs,
  serveurGroupe,
}: {
  groupe: groupe;
  automatisations: { noAutomatisationGroupe: string; nogroupeFK: string }[];
  serveurs: { noServeur: string; nom: string }[];
  serveurGroupe: { noServeurFK: string; noGroupeFK: string }[];
}) {
  const groupeServeurs = serveurGroupe.filter(
    (serveurGroupe) => serveurGroupe.noGroupeFK === groupe.noGroupe
  );

  const automatisationGroupe = automatisations.filter(
    (automatisation) => automatisation.nogroupeFK === groupe.noGroupe
  );

  const serveursAffecte = serveurs.filter((serveur) =>
    groupeServeurs.some(
      (groupeServeur) => groupeServeur.noServeurFK === serveur.noServeur
    )
  );

  return (
    <TableRow>
      <TableHeaderCell>
        {groupe.description ? (
          <InfoLabel info={groupe.description}>{groupe.nom}</InfoLabel>
        ) : (
          groupe.nom
        )}
      </TableHeaderCell>
      <TableHeaderCell>
        <InfoLabel info={serveursAffecte.map((serveur) => serveur.nom + "\n")}>
          {serveursAffecte.length}
        </InfoLabel>
      </TableHeaderCell>
      <TableHeaderCell>{automatisationGroupe.length}</TableHeaderCell>
      <TableHeaderCell>
        <div className="flex justify-between">
          <EnvoiCommande groupe={groupe} />
          <div className="flex space-x-2">
            <ModifierDialogue
              serveurs={serveurs}
              groupe={groupe}
              serveursSelectionnes={serveursAffecte}
            />

            <SupprimerDialogue
              noGroupe={groupe.noGroupe}
              nomGroupe={groupe.nom}
            />
          </div>
        </div>
      </TableHeaderCell>
    </TableRow>
  );
}
