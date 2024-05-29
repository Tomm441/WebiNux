"use server";
import { VerifierAuthentification } from "@/lib/nextAuth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ChiffrerString } from "@/lib/chiffrement";
import ssh from "ed25519-keygen/ssh";
import { randomBytes } from "ed25519-keygen/utils";
import { ToastIntent } from "@fluentui/react-components";

export async function ModifierIdentifiant(
  formData: FormData,
  noIdentifiant: string
) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }
  const donneesFormulaire = {
    nomIdentifiant: formData.get("nomIdentifiant") as string,
    nomUtilisateur: formData.get("nomUtilisateur") as string,
    changeMDP: formData.get("changerMDP") == "on" ? true : false,
    motDePasse: (formData.get("motDePasse") as string) || "",
    genCleSSH: formData.get("genCleSSH") === "on" ? true : false,
  };

  const identifiant = await prisma.identifiant.findUnique({
    where: { noIdentifiant: noIdentifiant },
  });

  if (
    identifiant?.nomUtilisateur !== donneesFormulaire.nomUtilisateur ||
    donneesFormulaire.genCleSSH
  ) {
    const skeys = await ssh(
      randomBytes(32),
      `${donneesFormulaire.nomUtilisateur}@WebiNux.cybercabin.ca`
    );
    const cleSSHChiffre = await ChiffrerString(skeys.privateKey);

    if (donneesFormulaire.nomUtilisateur.toLowerCase() === "root") {
      await prisma.identifiant.update({
        where: { noIdentifiant: noIdentifiant },
        data: {
          noIdentifiant: noIdentifiant,
          nomIdentifiant: donneesFormulaire.nomIdentifiant,
          nomUtilisateur: donneesFormulaire.nomUtilisateur,
          cleSSH: cleSSHChiffre,
          motDePasse: null,
        },
      });
    } else if (donneesFormulaire.changeMDP) {
      const motDePasseChiffre = await ChiffrerString(
        donneesFormulaire.motDePasse
      );
      await prisma.identifiant.update({
        where: { noIdentifiant: noIdentifiant },
        data: {
          noIdentifiant: noIdentifiant,
          nomIdentifiant: donneesFormulaire.nomIdentifiant,
          nomUtilisateur: donneesFormulaire.nomUtilisateur,
          cleSSH: cleSSHChiffre,
          motDePasse: motDePasseChiffre,
        },
      });
    } else {
      await prisma.identifiant.update({
        where: { noIdentifiant: noIdentifiant },
        data: {
          noIdentifiant: noIdentifiant,
          nomIdentifiant: donneesFormulaire.nomIdentifiant,
          nomUtilisateur: donneesFormulaire.nomUtilisateur,
          cleSSH: cleSSHChiffre,
        },
      });
    }
    revalidatePath("/identifiants");
    return {clepublique : skeys.publicKey, message: "L'identifiant a été modifié avec succès", type: "success" as ToastIntent};
  }

  if (donneesFormulaire.changeMDP) {
    const motDePasseChiffre = await ChiffrerString(
      donneesFormulaire.motDePasse
    );
    await prisma.identifiant.update({
      where: { noIdentifiant: noIdentifiant },
      data: {
        nomIdentifiant: donneesFormulaire.nomIdentifiant,
        nomUtilisateur: donneesFormulaire.nomUtilisateur,
        motDePasse: motDePasseChiffre,
      },
    });
  } else {
    await prisma.identifiant.update({
      where: { noIdentifiant: noIdentifiant },
      data: {
        nomIdentifiant: donneesFormulaire.nomIdentifiant,
        nomUtilisateur: donneesFormulaire.nomUtilisateur,
      },
    });
  }

  revalidatePath("/identifiants");
  return {clepublique : null, message: "L'identifiant a été modifié avec succès", type: "success" as ToastIntent};
}

export async function SupprimerIdentifiant(noIdentifiant: string) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  if (
    await prisma.serveur.findFirst({
      where: { noIdentifiantFK: noIdentifiant },
    })
  ) {
    return {
      message: "Cet identifiant est utilisé par un serveur. Vous ne pouvez pas le supprimer.",
      type: "error" as ToastIntent,
      };
  }

  await prisma.identifiant.delete({
    where: { noIdentifiant: noIdentifiant },
  });

  revalidatePath("/identifiants");
  return {
    message: "L'identifiant a été supprimé avec succès",
    type: "success" as ToastIntent,
  };
}

export async function AjoutIdentifiant(formData: FormData) {
  if (!(await VerifierAuthentification())) {
    redirect("/erreur/401");
  }

  const donneesFormulaire = {
    nomIdentifiant: formData.get("nomIdentifiant") as string,
    nomUtilisateur: formData.get("nomUtilisateur") as string,
    mdpAdmin: formData.get("mdpAdmin") === "on" ? true : false,
    motDePasse: (formData.get("motDePasse") as string) || "",
  };
  const seed = randomBytes(32);
  const skeys = await ssh(
    seed,
    `${donneesFormulaire.nomUtilisateur}@WebiNux.cybercabin.ca`
  );

  const cleSSHChiffre = await ChiffrerString(skeys.privateKey);

  if (
    donneesFormulaire.mdpAdmin &&
    donneesFormulaire.motDePasse &&
    donneesFormulaire.nomUtilisateur.toLowerCase() !== "root"
  ) {
    const motDePasseChiffre = await ChiffrerString(
      donneesFormulaire.motDePasse
    );
    await prisma.identifiant.create({
      data: {
        nomIdentifiant: donneesFormulaire.nomIdentifiant,
        nomUtilisateur: donneesFormulaire.nomUtilisateur,
        cleSSH: cleSSHChiffre,
        motDePasse: motDePasseChiffre,
      },
    });
  } else {
    await prisma.identifiant.create({
      data: {
        nomIdentifiant: donneesFormulaire.nomIdentifiant,
        nomUtilisateur: donneesFormulaire.nomUtilisateur,
        cleSSH: cleSSHChiffre,
        motDePasse: null,
      },
    });
  }

  revalidatePath("/identifiants");
  return { clePublique: skeys.publicKey, message: "L'identifiant a été ajouté avec succès", type: "success" as ToastIntent};
}
