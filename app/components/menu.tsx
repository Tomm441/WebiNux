"use server";

import { BoutonConnexion, BoutonDeconnexion } from "./boutons";
import { obtenirSession } from "@/lib/nextAuth";
import { Avatar, Text } from "@fluentui/react-components";
import Link from "next/link";
import {
  BuildingDesktopRegular,
  ServerRegular,
  KeyMultipleRegular,
  CalendarArrowCounterclockwiseRegular,
  GroupRegular,
  LiveRegular,
  ClockFilled
} from "@fluentui/react-icons";
import Image from "next/image";

export default async function MenuComp() {
  const session = await obtenirSession();

  return (
    <header>
      <Link href="/" className="pb-8 lien-menu">
        <Image src="linux.svg" alt="Linux" width={36} height={36} />
        <Text className="menu-texte">WebiNux</Text>
      </Link>
      <Link href="/identifiants" className="pb-5 lien-menu">
        <KeyMultipleRegular fontSize={30} color="#284B63" />
        <Text className="menu-texte">Identifiants</Text>
      </Link>
      <Link href="/distributions" className="pb-5 lien-menu">
        <GroupRegular fontSize={30} color="#284B63" />
        <Text className="menu-texte">Distributions</Text>
      </Link>
      <Link href="/serveurs" className="pb-5 lien-menu">
        <ServerRegular fontSize={30} color="#284B63" />
        <Text className="menu-texte icone">Serveurs</Text>
      </Link>
      <Link href="/groupes" className="pb-5 lien-menu">
        <BuildingDesktopRegular fontSize={30} color="#284B63" />
        <Text className="menu-texte">Groupes</Text>
      </Link>
      <Link href="/automatisations" className="pb-5 lien-menu">
        <CalendarArrowCounterclockwiseRegular fontSize={30} color="#284B63" />
        <Text className="menu-texte">Automatisations</Text>
      </Link>

      <div className="flex-grow"></div>

      {!session ? (
        <div className="lien-menu">
          <BoutonConnexion />
          <Text className="menu-texte">Connexion</Text>
        </div>
      ) : (
        <div className="pt-4 pl-2">
          <BoutonDeconnexion
            nom={session?.user?.name || ""}
            image={session?.user?.image || ""}
          />
        </div>
      )}
    </header>
  );
}
