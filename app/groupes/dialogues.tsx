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
  Dropdown,
  Option,
  OptionOnSelectData,
  makeStyles,
  SelectionEvents,
  Spinner,
  Tab,
  TabList,
  Text
} from "@fluentui/react-components";
import {
  DeleteRegular,
  EditRegular,
  PlayFilled,
  ErrorCircleFilled,
} from "@fluentui/react-icons";
import { groupe } from "@prisma/client";
import { AjoutGroupe, ModifierGroupe, SupprimerGroupe } from "./action";
import { useEffect, useState } from "react";
import { EnvoiCommandeGroupe } from "./action";

const useStyles = makeStyles({
  listbox: {
    maxHeight: "300px",
  },
});

export function SupprimerDialogue({
  nomGroupe,
  noGroupe,
}: {
  nomGroupe: string;
  noGroupe: string;
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
              Êtes-vous sûr de vouloir supprimer le groupe {nomGroupe}?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Annuler</Button>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="primary"
                  onClick={async () => {
                    const resultat = await SupprimerGroupe(noGroupe);
                    if (resultat.type === "error") {
                      notifier(resultat.message, resultat.type);
                      return;
                    }
                    notifier(resultat.message, resultat.type);
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

export function AjoutDialogue({
  serveurs,
}: {
  serveurs: { noServeur: string; nom: string }[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [ServeurState, setServeur] = useState<string[]>([]);
  const [GroupeState, setGroupe] = useState<string[]>([]);
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
    setServeur([]);
    setGroupe([]);
  };

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)}>Ajouter</Button>
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>Ajouter un groupe</DialogTitle>
              <DialogContent>
                <Field label="Nom du groupe" required>
                  <Input name="nomGroupe" id={"nomGroupe"} required />
                </Field>
                <Field label="Description">
                  <Textarea name="description" id={"description"} />
                </Field>
                <Field label="Serveurs assignés">
                  <Dropdown
                    name="serveur"
                    id={"serveur"}
                    multiselect
                    listbox={{ className: useStyles().listbox }}
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setServeur(data.selectedOptions)}
                  >
                    {serveurs.map((serveur) => (
                      <Option
                        key={serveur.noServeur}
                        value={serveur.noServeur}
                        text={serveur.nom}
                      >
                        {serveur.nom}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => reinitialiser()} appearance="secondary">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    const resultat = await AjoutGroupe(formData, ServeurState);
                    if (resultat.type === "error") {
                      notifier(resultat.message, resultat.type);
                      return;
                    }
                    notifier(resultat.message, resultat.type);
                    reinitialiser();
                  }}
                  appearance={"primary"}
                >
                  Ajouter
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </>
  );
}

export function ModifierDialogue({
  serveurs,
  groupe,
  serveursSelectionnes,
}: {
  serveurs: { noServeur: string; nom: string }[];
  groupe: groupe;
  serveursSelectionnes: { noServeur: string; nom: string }[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [ServeurState, setServeur] = useState<string[]>(
    serveursSelectionnes.map((serveur) => serveur.noServeur)
  );
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
    setServeur(serveursSelectionnes.map((serveur) => serveur.noServeur));
  };

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)} icon={<EditRegular />} />
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>Modifier un groupe</DialogTitle>
              <DialogContent>
                <Field label="Nom du groupe" required>
                  <Input
                    name="nomGroupe"
                    id={"nomGroupe"}
                    required
                    defaultValue={groupe.nom}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    name="description"
                    id={"description"}
                    defaultValue={groupe.description || ""}
                  />
                </Field>
                <Field label="Serveurs assignés">
                  <Dropdown
                    name="serveur"
                    id={"serveur"}
                    multiselect
                    defaultSelectedOptions={serveursSelectionnes.map(
                      (serveur) => serveur.noServeur
                    )}
                    defaultValue={serveursSelectionnes
                      .map((serveur) => serveur.nom)
                      .join(",")}
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setServeur(data.selectedOptions)}
                  >
                    {serveurs.map((serveur) => (
                      <Option
                        key={serveur.noServeur}
                        value={serveur.noServeur}
                        text={serveur.nom}
                      >
                        {serveur.nom}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => reinitialiser()} appearance="secondary">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    const resultat = await ModifierGroupe(
                      formData,
                      ServeurState,
                      groupe.noGroupe
                    );
                    if (resultat.type === "error") {
                      notifier(resultat.message, resultat.type);
                      return;
                    }
                    notifier(resultat.message, resultat.type);
                    reinitialiser();
                  }}
                  appearance={"primary"}
                >
                  Modifier
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </>
  );
}

export function EnvoiCommande({ groupe }: { groupe: groupe }) {
  const [ouvert, setOuvert] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [resultats, setResultat] = useState<
    { serveur: string; message: string; type: ToastIntent }[]
  >([]);
  const [commande, setCommande] = useState<string>("");
  const [serveurSelectionne, setServeurSelectionne] = useState<string>("");
  const [chargement, setChargement] = useState(false);
  const [tabSelectionne, setTabSelectionne] = useState<string>("");
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2));
      setResultat(await EnvoiCommandeGroupe(groupe.noGroupe, commande, admin));
      resultats.map((resultat) => {
        if (resultat.type === "error") {
          if (resultat.message.includes("[sudo]")) {
            const startIndex = resultat.message.indexOf("[sudo]");
            const endIndex = resultat.message.indexOf(":", startIndex + 1);
            if (startIndex !== -1 && endIndex !== -1) {
              resultat.message = resultat.message
                .substring(endIndex + 1)
                .trim();
            }
          }
        }
      })
      setChargement(false);
    };

    if (chargement) {
      fetchData();
    }
  }, [chargement, commande, groupe.noGroupe, admin, resultats]);

  const reinitialiser = () => {
    setOuvert(false);
    setAdmin(false);
    setCommande("");
    setResultat([]);
    setChargement(false);
    setTabSelectionne("");
  }

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button
          onClick={() => setOuvert(true)}
          icon={<PlayFilled />}
          appearance="primary"
        />
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>
                Envoyer une commande au groupe {groupe.nom}
              </DialogTitle>
              <DialogContent>
                {/* Pour une raison obscure, il n'est pas possible d'entrer d'espace dans ce champs texte alors qu'il est identique à celui de /serveurs/dialogues.tsx */}
                <Field label="Commande" required>
                  <Text>Copier le caractère suivant pour ajouter un espace « ».</Text>
                  <Textarea
                    name="commande"
                    id="commande"
                    value={commande}
                    onChange={(event) => setCommande(event.target.value)}
                  />
                </Field>
                <Field label="Envoyer les commandes en tant qu'administrateur">
                  <Switch
                    name="admin"
                    id="admin"
                    checked={admin}
                    onChange={(event) => setAdmin(event.target.checked)}
                  />
                </Field>
                {resultats.length > 0 ? (
                  <Field label="Resultat">
                    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                    <TabList selectedValue={tabSelectionne} defaultSelectedValue={resultats[0].serveur}>
                      {resultats.map((resultat) => (
                        <Tab
                          key={resultat.serveur}
                          value={resultat.serveur}
                          onClick={() => setTabSelectionne(resultat.serveur)}
                          icon={
                            resultat.type === "error" ? (
                              <ErrorCircleFilled />
                            ) : null
                          }
                        >
                          {resultat.serveur}
                        </Tab>
                      ))}
                    </TabList>
                    </div>
                    {resultats.map((resultat) =>
                      tabSelectionne === resultat.serveur ? (
                        <Textarea
                          key={resultat.serveur}
                          name="resultat"
                          id="resultat"
                          value={resultat.message}
                          readOnly
                          className="h-64"
                        />
                      ) : null
                    )}
                  </Field>
                ) : null}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => reinitialiser()} appearance="secondary">
                  Fermer
                </Button>
                <Button
                  type="submit"
                  icon={
                    chargement ? <Spinner size="extra-small" /> : <PlayFilled />
                  }
                  formAction={() => {
                    setChargement(true);
                  }}
                  disabled={chargement}
                  appearance="primary"
                >
                  {chargement ? "Envoi en cours" : "Envoyer"}
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </>
  );
}
