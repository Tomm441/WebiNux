"use client";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Field,
  Input,
  Textarea,
  Toast,
  ToastTitle,
  Toaster,
  useToastController,
  useId,
  ToastIntent,
  Switch,
  Text,
} from "@fluentui/react-components";
import {
  DeleteRegular,
  EditRegular,
  NotePin16Filled,
} from "@fluentui/react-icons";
import { Identifiant } from "@prisma/client";
import {
  SupprimerIdentifiant,
  ModifierIdentifiant,
  AjoutIdentifiant,
} from "./action";
import { useState } from "react";

export function SupprimerDialogue({
  nomIdentifiant,
  noIdentifiant,
}: {
  nomIdentifiant: string;
  noIdentifiant: string;
}) {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notifier = (message: string, typeMessage: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent: typeMessage }
    );
  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog>
        <DialogTrigger>
          <Button icon={<DeleteRegular />} />
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>Supprimer</DialogTitle>
            <DialogContent>
              Êtes-vous sûr de vouloir supprimer l&apos;identifiant{" "}
              {nomIdentifiant}?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Annuler</Button>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="primary"
                  onClick={async () => {
                    const resultat = await SupprimerIdentifiant(noIdentifiant);
                    notifier(
                      resultat.message,
                      resultat.type
                    );
                  }}
                >
                  Supprimer
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}

export function ModifierDialogue({
  noIdentifiant,
  nomIdentifiant,
  nomUtilisateur,
}: {
  noIdentifiant: string;
  nomIdentifiant: string;
  nomUtilisateur: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [modifierMotDePasse, setModifierMotDePasse] = useState(false);
  const [genCleSSH, setGenCleSSH] = useState(false);
  const [nouvNomUtilisateur, setnouvNomUtilisateur] = useState(nomUtilisateur);
  const [cleSSH, setCleSSH] = useState("");
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notifier = (message: string, typeMessage: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent: typeMessage }
    );
  const reinitialiser = () => {
    setOuvert(false);
    setModifierMotDePasse(false);
    setGenCleSSH(false);
    setnouvNomUtilisateur(nomUtilisateur);
    setCleSSH("");
  };

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)} icon={<EditRegular />} />
        {!cleSSH ? (
          <DialogSurface>
            <form>
              <DialogBody>
                <DialogTitle>
                  Modification de l&apos;identifiant {nomIdentifiant}.
                </DialogTitle>
                <DialogContent>
                  <Field label="Nom de l'identifiant" required>
                    <Input
                      name="nomIdentifiant"
                      id={"nomIdentifiant"}
                      defaultValue={nomIdentifiant}
                      required
                    />
                  </Field>
                  <Field label="Nom d'utilisateur" required>
                    <Input
                      name="nomUtilisateur"
                      id={"nomUtilisateur"}
                      defaultValue={nomUtilisateur}
                      onChange={(e) => setnouvNomUtilisateur(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Gérer une nouvelle clé SSH?">
                    <Switch
                      name="genCleSSH"
                      id={"genCleSSH"}
                      checked={
                        genCleSSH || nomUtilisateur !== nouvNomUtilisateur
                      }
                      disabled={nomUtilisateur !== nouvNomUtilisateur}
                      onChange={() => setGenCleSSH(!genCleSSH)}
                    />
                  </Field>
                  <Field label="Changer le mot de passe administrateur?">
                    <Switch
                      name="changerMDP"
                      id={"changerMDP"}
                      checked={
                        modifierMotDePasse &&
                        nouvNomUtilisateur.toLowerCase() != "root"
                      }
                      disabled={nouvNomUtilisateur.toLowerCase() == "root"}
                      onChange={() =>
                        setModifierMotDePasse(!modifierMotDePasse)
                      }
                    />
                  </Field>
                  {modifierMotDePasse &&
                  nouvNomUtilisateur.toLowerCase() != "root" ? (
                    <Field label="Mot de passe" required>
                      <Input
                        name="motDePasse"
                        id={"motDePasse"}
                        required
                        type="password"
                      />
                    </Field>
                  ) : null}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => reinitialiser()}
                    appearance="secondary"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    formAction={async (formData: FormData) => {
                      const resultat = await ModifierIdentifiant(
                        formData,
                        noIdentifiant
                      );
                      notifier(
                        resultat.message,
                        resultat.type
                      );

                      if (resultat.clepublique) {
                        setCleSSH(resultat.clepublique);
                        return;
                      }
                      reinitialiser()
                    }}
                    appearance={"primary"}
                  >
                    Modifier
                  </Button>
                </DialogActions>
              </DialogBody>
            </form>
          </DialogSurface>
        ) : (
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Clé publique</DialogTitle>
              <DialogContent>
              <Text>
                  La clé publique a été générée avec succès.
                </Text>
                <br />
                <br />
                <Textarea
                  value={
                    "mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && echo '" +
                    cleSSH +
                    "' >> ~/.ssh/authorized_keys"
                  }
                  className="h-24 w-full"
                  readOnly
                />
                <br />
                <br />
                <Text>
                  Pour installer la clé publique copiez la commande suivante en
                  étant connecté sur le serveur avec l&apos;utilisateur cible.
                </Text>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    reinitialiser()
                  }}
                  appearance="primary"
                >
                  Fermer
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        )}
      </Dialog>
    </>
  );
}

export function AjoutDialogue() {
  const [ouvert, setOuvert] = useState(false);
  const [mdpAdmin, setmdpAdmin] = useState(false);
  const [cleSSH, setCleSSH] = useState("");
  const [utilisateur, setUtilisateur] = useState("");
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notifier = (message: string, typeMessage: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent: typeMessage }
    );

    const reinitialiser = () => {
      setOuvert(false);
      setmdpAdmin(false);
      setUtilisateur("");
      setCleSSH("");
    };
  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)}>Ajouter</Button>
        {!cleSSH ? (
          <DialogSurface>
            <form>
              <DialogBody>
                <DialogTitle>Ajouter un identifiant</DialogTitle>
                <DialogContent>
                  <Field label="Nom de l'identifiant" required>
                    <Input
                      name="nomIdentifiant"
                      id={"nomIdentifiant"}
                      required
                    />
                  </Field>
                  <Field label="Nom d'utilisateur" required>
                    <Input
                      name="nomUtilisateur"
                      id={"nomUtilisateur"}
                      required
                      onChange={(e) => setUtilisateur(e.target.value)}
                    />
                  </Field>
                  <Field label="Ajouter un mot de passe administrateur (root)?">
                    <Switch
                      name="mdpAdmin"
                      id={"mdpAdmin"}
                      checked={mdpAdmin && utilisateur.toLowerCase() != "root"}
                      disabled={utilisateur.toLowerCase() == "root"}
                      onChange={() => setmdpAdmin(!mdpAdmin)}
                    />
                  </Field>
                  {mdpAdmin && utilisateur.toLowerCase() != "root" ? (
                    <Field label="Mot de passe administrateur" required>
                      <Input
                        name="motDePasse"
                        id={"motDePasse"}
                        required
                        type="password"
                      />
                    </Field>
                  ) : null}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => reinitialiser()}
                    appearance="secondary"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    formAction={async (formData: FormData) => {
                      const resultat = await AjoutIdentifiant(formData);
                      notifier(
                        resultat.message,
                        resultat.type
                      );
                      if (resultat.clePublique) {
                        setCleSSH(resultat.clePublique);
                        return;
                      }
                      reinitialiser()
                    }}
                    appearance={"primary"}
                  >
                    Ajouter
                  </Button>
                </DialogActions>
              </DialogBody>
            </form>
          </DialogSurface>
        ) : (
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Clé publique</DialogTitle>
              <DialogContent>
                <Text>
                  La clé publique a été générée avec succès.
                </Text>
                <br />
                <br />
                <Textarea
                  value={
                    "mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && echo '" +
                    cleSSH +
                    "' >> ~/.ssh/authorized_keys"
                  }
                  className="h-24 w-full"
                  readOnly
                />
                <br />
                <br />
                <Text>
                  Pour installer la clé publique copiez la commande suivante en
                  étant connecté sur le serveur avec l&apos;utilisateur cible.
                </Text>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    reinitialiser()
                  }}
                  appearance="primary"
                >
                  Fermer
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        )}
      </Dialog>
    </>
  );
}
