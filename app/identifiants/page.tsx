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
import { HomeRegular, KeyMultipleRegular } from "@fluentui/react-icons";
import { AjoutDialogue } from "./dialogues";
import RowIdentifiant from "./rowIdentifiant";

import { VerifierAuthentification } from "@/lib/nextAuth";

export default async function Page() {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const identifiants = await prisma.identifiant.findMany({
    orderBy: [
      {
        nomIdentifiant: "asc",
      },
    ],
  });

  return (
    <main>
      <div className="flex justify-between">
        <div className="flex flex-col min-h-[10vh]">
          <Title1>Identifiants</Title1>
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
              <BreadcrumbButton current icon={<KeyMultipleRegular />}>
                Identifiants
              </BreadcrumbButton>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className="self-end">
          <AjoutDialogue />
        </div>
      </div>
      <br />
      <Card className="w-full self-center">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Nom de l&apos;identifiant</TableHeaderCell>
              <TableHeaderCell>Nom d&apos;utilisateur</TableHeaderCell>
              <TableHeaderCell>Type d&apos;identifiant</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {identifiants.map((identifiant) => (
              <RowIdentifiant
                identifiant={identifiant}
                key={identifiant.noIdentifiant}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
