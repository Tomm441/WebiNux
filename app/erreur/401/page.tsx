import { VerifierAuthentification } from "@/lib/nextAuth";
import { redirect } from "next/navigation";

export default async function Page() {
    if ((await VerifierAuthentification())) {
        redirect("/");
      }
    return (
        <main>
            <p>Erreur 401</p>
            <p>Veuillez vous connecter</p>
        </main>
    );
}