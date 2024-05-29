"use server";

import { Identifiant } from "@prisma/client";
import {
  TableRow,
  TableCell,
  TableCellLayout,
} from "@fluentui/react-components";
import { ModifierDialogue, SupprimerDialogue } from "./dialogues";

export default async function RowIdentifiant({
  identifiant,
}: {
  identifiant: Identifiant;
}) {
  return (
    <TableRow>
      <TableCell>{identifiant.nomIdentifiant}</TableCell>
      <TableCell>{identifiant.nomUtilisateur}</TableCell>
      <TableCell>{identifiant.nomUtilisateur.toLowerCase() == "root" ? "Administrateur" : (identifiant.motDePasse ? "Utilisateur standard avec mot de passe administrateur" : "Utilisateur standard")}</TableCell>
      <TableCell>
        <TableCellLayout>
          <ModifierDialogue noIdentifiant={identifiant.noIdentifiant} nomIdentifiant={identifiant.nomIdentifiant} nomUtilisateur={identifiant.nomUtilisateur} />
          <SupprimerDialogue
            noIdentifiant={identifiant.noIdentifiant}
            nomIdentifiant={identifiant.nomIdentifiant}
          />
        </TableCellLayout>
      </TableCell>
    </TableRow>
  );
}
