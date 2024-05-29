"use server";
import { VerifierAuthentification } from "@/lib/nextAuth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function ModifierDistribution(formData: FormData, typeId: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const donneesFormulaire = {
    nom: formData.get("nom") as string,
    description: formData.get("description") as string,
  };

  await prisma.typeDistribution.update({
    where: { noTypeDistribution: typeId },
    data: donneesFormulaire,
  });

  revalidatePath("/distributions");
  return false;
}

export async function SupprimerDistribution(typeId: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  if (
    await prisma.serveur.findFirst({ where: { noTypeDistributionFK: typeId } })
  ) {
    return;
  }

  await prisma.typeDistribution.delete({
    where: { noTypeDistribution: typeId },
  });

  revalidatePath("/distributions");
}

export async function AjoutDistribution(formData: FormData) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const donneesFormulaire = {
    nom: formData.get("nom") as string,
    description: formData.get("description") as string,
  };

  await prisma.typeDistribution.create({
    data: donneesFormulaire,
  });

  revalidatePath("/distributions");
}
