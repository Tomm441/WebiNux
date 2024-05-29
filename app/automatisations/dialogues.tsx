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
  Divider,
  Text,
  Link,
  InfoLabel,
} from "@fluentui/react-components";
import { DeleteRegular, EditRegular, PlayFilled } from "@fluentui/react-icons";
import { automatisation } from "@prisma/client";
import {
  AjoutAutomatisation,
  SupprimerAutomatisation,
  ModifierAutomatisation,
} from "./action";

import { getFutureMatches } from "@datasert/cronjs-matcher";
import { parse } from "@datasert/cronjs-parser";
import cronstrue from "cronstrue";
import "cronstrue/locales/fr";
import { useEffect, useState } from "react";

const useStyles = makeStyles({
  listbox: {
    maxHeight: "300px",
  },
});

export function SupprimerDialogue({
  nomAutomatisation,
  noAutomatisation,
}: {
  nomAutomatisation: string;
  noAutomatisation: string;
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
              Êtes-vous sûr de vouloir supprimer l&apos;automatisation{" "}
              {nomAutomatisation}?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Annuler</Button>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="primary"
                  onClick={async () => {
                    const resultat = await SupprimerAutomatisation(
                      noAutomatisation
                    );
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
  groupes,
}: {
  serveurs: { noServeur: string; nom: string }[];
  groupes: { noGroupe: string; nom: string }[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [cronMin, setCronMin] = useState<string>("*");
  const [cronHeure, setCronHeure] = useState<string>("*");
  const [cronJourMois, setCronJourMois] = useState<string>("*");
  const [cronMois, setCronMois] = useState<string>("*");
  const [cronJourSemaine, setCronJourSemaine] = useState<string>("*");
  const [cronProchainesExecutions, setCronProchainesExecutions] = useState<
    string[]
  >([]);
  const [ServeurState, setServeur] = useState<string[]>([]);
  const [GroupeState, setGroupe] = useState<string[]>([]);
  const [cronResultat, setCronResultat] = useState<string>("");
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notifier = (message: string, typeMessage: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent: typeMessage }
    );

  useEffect(() => {
    const verifierCron = () => {
      const cron = `${cronMin} ${cronHeure} ${cronJourMois} ${cronMois} ${cronJourSemaine}`;
      try {
        const prochainesExecutions = getFutureMatches(cron, {
          formatInTimezone: true,
          timezone: "America/Montreal",
        });
        const resultat = cronstrue.toString(cron, { locale: "fr" });
        setCronProchainesExecutions(prochainesExecutions);
        setCronResultat(resultat);
      } catch (e) {
        setCronProchainesExecutions([]);
        setCronResultat("Erreur dans la syntaxe du cron.");
      }
    };
    verifierCron();
  }, [cronMin, cronHeure, cronJourMois, cronMois, cronJourSemaine]);

  const reinitialiser = () => {
    setOuvert(false);
    setCronResultat("");
    setCronProchainesExecutions([]);
    setCronMin("*");
    setCronHeure("*");
    setCronJourMois("*");
    setCronMois("*");
    setCronJourSemaine("*");
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
              <DialogTitle>Ajouter une automatisation</DialogTitle>
              <DialogContent>
                <br />
                <Divider>Informations générales</Divider>
                <br />
                <Field label="Nom de l'automatisation" required>
                  <Input
                    name="nomAutomatisation"
                    id={"nomAutomatisation"}
                    required
                  />
                </Field>
                <Field label="Description">
                  <Textarea name="description" id={"description"} />
                </Field>
                <Field label="Groupes assignés">
                  <Dropdown
                    name="groupe"
                    id={"groupe"}
                    listbox={{ className: useStyles().listbox }}
                    multiselect
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setGroupe(data.selectedOptions)}
                  >
                    {groupes.map((groupe) => (
                      <Option
                        key={groupe.noGroupe}
                        value={groupe.noGroupe}
                        text={groupe.nom}
                      >
                        {groupe.nom}
                      </Option>
                    ))}
                  </Dropdown>
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
                <br />
                <Divider>Commande</Divider>
                <br />
                <Field label="Éxécuter en tant qu'administrateur">
                  <Switch name="admin" id={"admin"} />
                </Field>
                <Field label="Commande" required>
                  {/* Il existe encore des mentions de script, puiqu'il était initialement prévu d'éxécuter des scripts et non des commandes */}
                  <Input name="script" id={"script"} required />
                </Field>
                <br />
                <Divider>CronJob</Divider>
                <br />
                <Text>
                  Cette section est dédiée à la configuration du CronJob. Pour
                  plus d&apos;informations sur la syntaxe, veuillez consulter la{" "}
                  <Link href="https://crontab.guru/" target="_blank">
                    documentation
                  </Link>
                  .
                </Text>
                <Field label="Minute" required>
                  <Input
                    name="minute"
                    id={"minute"}
                    defaultValue="*"
                    required
                    onChange={(event) => setCronMin(event.currentTarget.value)}
                  />
                </Field>
                <Field label="Heure" required>
                  <Input
                    name="heure"
                    id={"heure"}
                    defaultValue="*"
                    required
                    onChange={(event) =>
                      setCronHeure(event.currentTarget.value)
                    }
                  />
                </Field>
                <Field label="Journée du mois" required>
                  <Input
                    name="jourMois"
                    id={"jourMois"}
                    defaultValue="*"
                    required
                    onChange={(event) =>
                      setCronJourMois(event.currentTarget.value)
                    }
                  />
                </Field>
                <Field label="Mois" required>
                  <Input
                    name="mois"
                    id={"mois"}
                    defaultValue="*"
                    required
                    onChange={(event) => setCronMois(event.currentTarget.value)}
                  />
                </Field>
                <Field label="Jour de la semaine" required>
                  <Input
                    name="jourSemaine"
                    id={"jourSemaine"}
                    defaultValue="*"
                    required
                    onChange={(event) =>
                      setCronJourSemaine(event.currentTarget.value)
                    }
                  />
                </Field>
                <br />
                {(cronProchainesExecutions.length > 0 && (
                  <Text size={400}>
                    {cronResultat}
                    <InfoLabel
                      info={
                        <>
                          <Text>Prochaines exécutions:</Text>
                          <ul>
                            {cronProchainesExecutions.map(
                              (prochaineExecution) => (
                                <li key={prochaineExecution}>
                                  {new Date(
                                    prochaineExecution
                                  ).toLocaleString()}
                                </li>
                              )
                            )}
                          </ul>
                        </>
                      }
                    />
                  </Text>
                )) || <Text size={400}>Cron Invalide</Text>}
              </DialogContent>

              <DialogActions>
                <Button onClick={() => reinitialiser()} appearance="secondary">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    const resultat = await AjoutAutomatisation(
                      formData,
                      ServeurState,
                      GroupeState
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
  groupes,
  automatisation,
  serveursSelectionnes,
  groupesSelectionnes,
}: {
  serveurs: { noServeur: string; nom: string }[];
  groupes: { noGroupe: string; nom: string }[];
  automatisation: automatisation;
  serveursSelectionnes: { noServeur: string; nom: string }[];
  groupesSelectionnes: { noGroupe: string; nom: string }[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [cronMin, setCronMin] = useState<string>(automatisation.cronMinute);
  const [cronHeure, setCronHeure] = useState<string>(automatisation.cronHeure);
  const [cronJourMois, setCronJourMois] = useState<string>(
    automatisation.cronJour
  );
  const [cronMois, setCronMois] = useState<string>(automatisation.cronMois);
  const [cronJourSemaine, setCronJourSemaine] = useState<string>(
    automatisation.cronJourSemaine
  );
  const [cronProchainesExecutions, setCronProchainesExecutions] = useState<
    string[]
  >([]);
  const [admin, setAdmin] = useState<boolean>(automatisation.admin);
  const [cronResultat, setCronResultat] = useState<string>("");
  const [ServeurState, setServeur] = useState<string[]>(
    serveursSelectionnes.map((serveur) => serveur.noServeur)
  );
  const [GroupeState, setGroupe] = useState<string[]>(
    groupesSelectionnes.map((groupe) => groupe.noGroupe)
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

  useEffect(() => {
    const verifierCron = () => {
      const cron = `${cronMin} ${cronHeure} ${cronJourMois} ${cronMois} ${cronJourSemaine}`;
      try {
        const prochainesExecutions = getFutureMatches(cron, {
          formatInTimezone: true,
          timezone: "America/Montreal",
        });
        const resultat = cronstrue.toString(cron, { locale: "fr" });
        setCronProchainesExecutions(prochainesExecutions);
        setCronResultat(resultat);
      } catch (e) {
        setCronProchainesExecutions([]);
        setCronResultat("Erreur dans la syntaxe du cron.");
      }
    };
    verifierCron();
  }, [cronMin, cronHeure, cronJourMois, cronMois, cronJourSemaine]);

  

  const reinitialiser = () => {
    setCronResultat("");
    setCronProchainesExecutions([]);
    setCronMin(automatisation.cronMinute);
    setCronHeure(automatisation.cronHeure);
    setCronJourMois(automatisation.cronJour);
    setCronMois(automatisation.cronMois);
    setCronJourSemaine(automatisation.cronJourSemaine);
    setServeur(serveursSelectionnes.map((serveur) => serveur.noServeur));
    setGroupe(groupesSelectionnes.map((groupe) => groupe.noGroupe));
    setAdmin(automatisation.admin);
  };

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button
          onClick={() => {
            setOuvert(true), reinitialiser();
          }}
          icon={<EditRegular />}
        />
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>Modifier une automatisation</DialogTitle>
              <DialogContent>
                <br />
                <Divider>Informations générales</Divider>
                <br />
                <Field label="Nom de l'automatisation" required>
                  <Input
                    name="nomAutomatisation"
                    id={"nomAutomatisation"}
                    required
                    defaultValue={automatisation.nom}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    name="description"
                    id={"description"}
                    defaultValue={automatisation.description || ""}
                  />
                </Field>
                <Field label="Groupes assignés">
                  <Dropdown
                    name="groupe"
                    id={"groupe"}
                    multiselect
                    defaultSelectedOptions={groupesSelectionnes.map(
                      (groupe) => groupe.noGroupe
                    )}
                    defaultValue={groupesSelectionnes
                      .map((groupe) => groupe.nom)
                      .join(",")}
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setGroupe(data.selectedOptions)}
                  >
                    {groupes.map((groupe) => (
                      <Option
                        key={groupe.noGroupe}
                        value={groupe.noGroupe}
                        text={groupe.nom}
                      >
                        {groupe.nom}
                      </Option>
                    ))}
                  </Dropdown>
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
                <br />
                <Divider>Script</Divider>
                <br />
                <Field label="Éxécuter en tant qu'administrateur">
                  <Switch
                    name="admin"
                    id={"admin"}
                    checked={admin}
                    onChange={(event) => setAdmin(event.target.checked)}
                  />
                </Field>
                <Field label="Commande" required>
                  {/* Il existe encore des mentions de script, puiqu'il était initialement prévu d'éxécuter des scripts et non des commandes */}
                  <Input
                    name="script"
                    id={"script"}
                    defaultValue={automatisation.script}
                    required
                  />
                </Field>
                <br />
                <Divider>CronJob</Divider>
                <br />
                <Text>
                  Cette section est dédiée à la configuration du CronJob. Pour
                  plus d&apos;informations sur la syntaxe, veuillez consulter la{" "}
                  <Link href="https://crontab.guru/" target="_blank">
                    documentation
                  </Link>
                  .
                </Text>
                <Field label="Minute" required>
                  <Input
                    name="minute"
                    id={"minute"}
                    defaultValue={automatisation.cronMinute}
                    required
                    onChange={(event) => setCronMin(event.currentTarget.value)}
                  />
                </Field>
                <Field label="Heure" required>
                  <Input
                    name="heure"
                    id={"heure"}
                    defaultValue={automatisation.cronHeure}
                    required
                    onChange={(event) =>
                      setCronHeure(event.currentTarget.value)
                    }
                  />
                </Field>
                <Field label="Journée du mois" required>
                  <Input
                    name="jourMois"
                    id={"jourMois"}
                    defaultValue={automatisation.cronJour}
                    required
                    onChange={(event) =>
                      setCronJourMois(event.currentTarget.value)
                    }
                  />
                </Field>
                <Field label="Mois" required>
                  <Input
                    name="mois"
                    id={"mois"}
                    defaultValue={automatisation.cronMois}
                    required
                    onChange={(event) => setCronMois(event.currentTarget.value)}
                  />
                </Field>
                <Field label="Jour de la semaine" required>
                  <Input
                    name="jourSemaine"
                    id={"jourSemaine"}
                    defaultValue={automatisation.cronJourSemaine}
                    required
                    onChange={(event) =>
                      setCronJourSemaine(event.currentTarget.value)
                    }
                  />
                </Field>
                <br />
                {(cronProchainesExecutions.length > 0 && (
                  <Text size={400}>
                    {cronResultat}
                    <InfoLabel
                      info={
                        <>
                          <Text>Prochaines exécutions:</Text>
                          <ul>
                            {cronProchainesExecutions.map(
                              (prochaineExecution) => (
                                <li key={prochaineExecution}>
                                  {new Date(
                                    prochaineExecution
                                  ).toLocaleString()}
                                </li>
                              )
                            )}
                          </ul>
                        </>
                      }
                    />
                  </Text>
                )) || <Text size={400}>Cron Invalide</Text>}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    reinitialiser(), setOuvert(false);
                  }}
                  appearance="secondary"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    const resultat = await ModifierAutomatisation(
                      formData,
                      ServeurState,
                      GroupeState,
                      automatisation.noAutomatisation,
                      admin
                    );
                    if (resultat.type === "error") {
                      notifier(resultat.message, resultat.type);
                      return;
                    }
                    notifier(resultat.message, resultat.type);
                    reinitialiser();
                    setOuvert(false);
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
