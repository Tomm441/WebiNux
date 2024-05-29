"use server";

import { Text } from "@fluentui/react-components";

export default async function Footer() {
  return (
    <footer className="flex pl-14 items-center justify-center border-t bottom-0 h-[6vh]">
      <p className="text-gray-700 align-middle justify-center">
        © 2024 WebiNux. Aucun droits réservés.
      </p>
    </footer>
  );
}
