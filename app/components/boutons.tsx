"use client";
import { signIn, signOut } from "next-auth/react";
import {
  PlugDisconnectedFilled,
  PlugConnectedFilled,
} from "@fluentui/react-icons";
import Link from "next/link";

import {
  Avatar,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
} from "@fluentui/react-components";

export function BoutonConnexion() {
  return (
    <Link href="" onClick={() => signIn("microsoft-entra-id")}>
      <PlugConnectedFilled  fontSize={30} color="#284B63"/>
    </Link>
  );
}

export function BoutonDeconnexion({image, nom}: {image: string, nom: string}) {
  return (
    <Menu positioning={"after"}>
      <MenuTrigger disableButtonEnhancement>
        <Avatar size={36}
              name={ nom}
              image={{ src: image}}/>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem icon={<PlugDisconnectedFilled/>} onClick={() => signOut()}>Déconnexion</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}