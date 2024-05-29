"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Title1,
  Card,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  TableBody,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
} from "@fluentui/react-components";
import Link from "next/link";
import { HomeRegular, BuildingDesktopRegular } from "@fluentui/react-icons";
import { AjoutDialogue } from "./dialogues";
import RowGroupe from "./rowGroupe";

import { VerifierAuthentification } from "@/lib/nextAuth";

export default async function Page() {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const automatisations = await prisma.automatisationGroupe.findMany({
    select: {
      noAutomatisationGroupe: true,
      nogroupeFK: true,
    },
  });
  const groupes = await prisma.groupe.findMany({orderBy: {nom: "asc"}});
  const serveurs = await prisma.serveur.findMany({
    select: { noServeur: true, nom: true },
    orderBy: { nom: "asc" },
  });

  const serveurGroupe = await prisma.serveurGroupe.findMany({select: {noServeurFK: true, noGroupeFK: true}});

  return (
    <main>
      <div className="flex justify-between">
        <div className="flex flex-col min-h-[10vh]">
          <Title1>Groupes</Title1>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link href="/">
                <BreadcrumbButton icon={<HomeRegular />}>
                  Accueil
                </BreadcrumbButton>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbDivider />
            <BreadcrumbItem>
              <BreadcrumbButton current icon={<BuildingDesktopRegular />}>
                Groupes
              </BreadcrumbButton>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className="self-end">
          <AjoutDialogue serveurs={serveurs.map((serveur) => ({noServeur: serveur.noServeur, nom: serveur.nom}))}/> 
        </div>
      </div>
      <br />
      <Card className="w-full self-center">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Nom du groupe</TableHeaderCell>
              <TableHeaderCell>Nombre de serveurs assignés</TableHeaderCell>
              <TableHeaderCell>
                Nombre d&apos;automatisations assignées
              </TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupes.map((groupe) => (
              <RowGroupe
                groupe={groupe}
                automatisations={automatisations}
                serveurs={serveurs}
                serveurGroupe={serveurGroupe}
                key={groupe.noGroupe}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
