"use server";
import { TypeDistribution } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardFooter,
  Title3,
  Subtitle2,
  Body1,
  Divider,
} from "@fluentui/react-components";
import { SupprimerDialogue, ModifierDialogue } from "./dialogues";
export default async function CardDistribution(distribution: TypeDistribution) {
  return (
    <Card className="m-3 overflow-hidden w-[300px] h-[400px] border hover:border-gray-400 hover:scale-105 transition-all duration-300 ease-in-out">
      <CardHeader
        header={<Title3>{distribution.nom}</Title3>}
        className="border-b border-gray-100 pb-2"
      />
      <div className="px-2">
        <br />
        <Body1 className="mt-2 text-gray-700">{distribution.description}</Body1>
      </div>

      <CardFooter className="flex justify-end items-end flex-grow">
        <ModifierDialogue distribution={distribution} />
        <SupprimerDialogue
          noDistribution={distribution.noTypeDistribution}
          nomDistribution={distribution.nom}
        />
      </CardFooter>
    </Card>
  );
}
