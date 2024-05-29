# WebiNux

WebiNux est une application web de gestion de serveur, permettant l'automatisation et la gestion groupée de serveurs Linux via SSH.

## Pour commencer
> [!WARNING]
> La compatibilité avec les systèmes d'exploitation autres que Linux n'a pas été testée.

Vous aurez besoin :
- Un environnement d'éxécution JavaScript. Je recommande Bun puisqu'il s'agit de celui que j'ai utilisé pour développer mon application.
- Une base de données PostgreSQL.
- Un fournisseur de connexion supporté par Auth.js.

### Instructions

1. Installez les dépendances avec :

    ```bash
    bun install
    ```

2. Choisissez un fournisseur de connexion et suivez les [insutructions suivantes](https://authjs.dev/reference/core/providers).


3. Remplacez `signIn("microsoft-entra-id")` par `signIn("votre-fournisseur-de-connexion")` dans  `./app/components/boutons.tsx`.


4. Créez un fichier `.env`. À l'intérieur de celui-ci ajoutez :
    - L'url de connexion à la base de données PostgreSQL nommé `DATABASE_URL`.
    - Une clé AES256 nommé `AUTH_SECRET`.
    - Une clé AES256 nommé `CLE_AES256`.
    - Les informations pour le fourniseur de connexion choisi.

5. Exécutez la commande `bunx prisma migrate dev`.

6. Exécutez la fonction `CreerClesRSA` dans `./app/lib/chiffrement.ts`.

### Démarrer le serveur de développement

Pour démarer le serveur de développement, exécutez :

```bash
bun run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir le résultat.

# Auteur

[*Tomm441*](https://github.com/Tomm441)

Réalisé dans le cadre du cours *Projet professionnel* en 2024
