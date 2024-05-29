"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Identifiant } from "@prisma/client";
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
import { HomeRegular, CalendarArrowCounterclockwiseRegular } from "@fluentui/react-icons";
import { AjoutDialogue } from "./dialogues";
import RowAutomatisation from "./rowAutomatisation";

import { VerifierAuthentification } from "@/lib/nextAuth";

export default async function Page() {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const automatisations = await prisma.automatisation.findMany({orderBy: {nom: "asc"}});
  const groupes = await prisma.groupe.findMany({select: {noGroupe: true, nom: true}});
  const serveurs = await prisma.serveur.findMany({select: {noServeur: true, nom: true}});

  return (
    <main>
      <div className="flex justify-between">
        <div className="flex flex-col min-h-[10vh]">
          <Title1>Automatisations</Title1>
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
              <BreadcrumbButton current icon={<CalendarArrowCounterclockwiseRegular />}>
              Automatisations
              </BreadcrumbButton>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className="self-end">
          <AjoutDialogue groupes={groupes}  serveurs={serveurs}/>
        </div>
      </div>
      <br />
      <Card className="w-full self-center">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Nom de l&apos;automatisation</TableHeaderCell>
              <TableHeaderCell>Fréquence</TableHeaderCell>
              <TableHeaderCell>Prochaines exécutions</TableHeaderCell>
              <TableHeaderCell>Nombre de groupes assignés</TableHeaderCell>
              <TableHeaderCell>Nombre de serveur assignés</TableHeaderCell>
              <TableHeaderCell>Type d&apos;automatisation</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
             {automatisations.map((automatisation) => (
              <RowAutomatisation
                automatisation={automatisation}
                groupes={groupes}
                serveurs={serveurs}
                key={automatisation.noAutomatisation}
              />
            ))} 
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
