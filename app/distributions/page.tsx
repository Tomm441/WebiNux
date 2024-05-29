"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CardDistribution from "./cardDistribution";
import type { TypeDistribution } from "@prisma/client";
import {
  Title1,
  Card,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
} from "@fluentui/react-components";
import Link from "next/link";
import { HomeRegular, GroupRegular } from "@fluentui/react-icons";
import { AjoutDialogue } from "./dialogues";

import { VerifierAuthentification } from "@/lib/nextAuth";

export default async function Page() {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const distributions = await prisma.typeDistribution.findMany({
    orderBy: [
      {
        nom: 'asc',
      }
    ],
  });

  return (
    <main>
      <div className="flex justify-between">
        <div className="flex flex-col min-h-[10vh]">
          <Title1>Distributions</Title1>
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
              <BreadcrumbButton current icon={<GroupRegular />}>
                Distributions
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
        <div className="flex flex-wrap items-center justify-items-center">
          {distributions.map((distribution: TypeDistribution) => {
            return (
              <CardDistribution key={distribution.noTypeDistribution} {...distribution} />
            );
          })}
        </div>
      </Card>
    </main>
  );
}
