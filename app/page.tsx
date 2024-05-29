'use server';

import { Display, Subtitle1, Text } from "@fluentui/react-components";

export default async function Home() {
  return (
    <main className="p-8">
      <div className="text-center">
        <Display>WebiNux</Display>
        <br/>
        <Subtitle1>
          Votre navigateur, votre serveur, votre contrôle.
        </Subtitle1>
      </div>
      <div className="mt-8 text-gray-600">
        <p>
          Bienvenue sur WebiNux, votre plateforme tout-en-un pour gérer vos serveurs Linux.
          Que vous soyez un administrateur système chevronné ou un débutant, notre interface conviviale vous permet de contrôler vos serveurs à distance sans tracas.
        </p>
        <p>
          Voici quelques fonctionnalités clés de WebiNux :
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Automatisation des tâches courantes telles que les mises à jour et les sauvegardes.</li>
          <li>Accès sécurisé via une connexion chiffrée.</li>
          <li>Uniformisation rapide des changements sur vos serveurs.</li>
        </ul>
      </div>
    </main>
    
  );
}

