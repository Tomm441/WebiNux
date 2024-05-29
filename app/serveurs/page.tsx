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
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
} from "@fluentui/react-components";
import Link from "next/link";
import { HomeRegular, ServerRegular } from "@fluentui/react-icons";
import { AjoutDialogue } from "./dialogues";
import { VerifierAuthentification } from "@/lib/nextAuth";
import RowServeur from "./rowServeur";

export default async function Page() {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const serveurs = await prisma.serveur.findMany({
    orderBy: [
      {
        nom: "asc",
      },
    ],
  });

  const typesDistribution = await prisma.typeDistribution.findMany({orderBy: {nom: 'asc'}});
  const identifiants = await prisma.identifiant.findMany({orderBy: {nomIdentifiant: 'asc'}});

  return (
    <main>
      <div className="flex justify-between">
        <div className="flex flex-col min-h-[10vh]">
          <Title1>Serveurs</Title1>
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
              <BreadcrumbButton current icon={<ServerRegular />}>
                Serveurs
              </BreadcrumbButton>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className="self-end">
          <AjoutDialogue
            identifiants={identifiants.map((identifiant) => ({
              id: identifiant.noIdentifiant,
              nom: identifiant.nomIdentifiant,
            }))}
            typesDistribution={typesDistribution}
          />
        </div>
      </div>
      <br />
      <Card className="w-full self-center">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Nom du serveur</TableHeaderCell>
              <TableHeaderCell>Adresse IP</TableHeaderCell>
              <TableHeaderCell>Type de distribution</TableHeaderCell>
              <TableHeaderCell>Port SSH</TableHeaderCell>
              <TableHeaderCell>Identifiant utilisé</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serveurs.map((serveur) => (
              <RowServeur
                serveur={serveur}
                key={serveur.noServeur}
                identifiants={identifiants}
                typesDistribution={typesDistribution}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
