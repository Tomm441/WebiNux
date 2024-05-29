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
} from "@fluentui/react-components";
import { DeleteRegular, EditRegular, PlayFilled } from "@fluentui/react-icons";
import { Identifiant, Serveur, TypeDistribution } from "@prisma/client";
import {
  SupprimerServeur,
  ModifierServeur,
  AjoutServeur,
  EnvoiCommandeServeur,
} from "./action";
import { useEffect, useState } from "react";
import { comma } from "postcss/lib/list";

const useStyles = makeStyles({
  listbox: {
    maxHeight: "300px",
  },
});

export function SupprimerDialogue({
  nomServeur,
  noServeur,
}: {
  nomServeur: string;
  noServeur: string;
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
              Êtes-vous sûr de vouloir supprimer le serveur {nomServeur}?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Annuler</Button>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="primary"
                  onClick={async () => {
                    const resultat = await SupprimerServeur(noServeur);
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

export function ModifierDialogue({
  serveur,
  identifiants,
  typesDistribution,
  nomIdentifiatDefaut,
  nomTypeDistributionDefaut,
}: {
  serveur: Serveur;
  identifiants: { id: string; nom: string }[];
  typesDistribution: TypeDistribution[];
  nomIdentifiatDefaut: string;
  nomTypeDistributionDefaut: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notifier = (message: string, typeMessage: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent: typeMessage }
    );

  const identifiantDefautDropdown = serveur.noIdentifiantFK
    ? [serveur.noIdentifiantFK || ""]
    : [];
  const distributionDefautDropdown = serveur.noTypeDistributionFK
    ? [serveur.noTypeDistributionFK || ""]
    : [];

  const [IdentifiantState, setIdentifiant] = useState<string[]>([
    serveur.noIdentifiantFK,
  ]);
  const [DistributionState, setDistribution] = useState<string[]>([
    serveur.noTypeDistributionFK,
  ]);
  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)} icon={<EditRegular />} />
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>Modification du serveur {serveur.nom}.</DialogTitle>
              <DialogContent>
                <Field label="Nom du serveur" required>
                  <Input
                    name="nomServeur"
                    id={"nomServeur"}
                    required
                    defaultValue={serveur.nom}
                  />
                </Field>
                <Field label="Adresse IP" required>
                  <Input
                    name="adresseIP"
                    id={"adresseIP"}
                    required
                    defaultValue={serveur.ip}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    name="description"
                    id={"description"}
                    defaultValue={serveur.description || ""}
                  />
                </Field>
                <Field label="Port SSH" required>
                  <Input
                    name="portSSH"
                    id={"portSSH"}
                    required
                    defaultValue={serveur.portSSH.toString()}
                    type="number"
                  />
                </Field>
                <Field label="Type de distribution" required>
                  <Dropdown
                    name="typeDistribution"
                    id={"typeDistribution"}
                    listbox={{ className: useStyles().listbox }}
                    defaultValue={nomTypeDistributionDefaut}
                    defaultSelectedOptions={distributionDefautDropdown}
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setDistribution(data.selectedOptions)}
                  >
                    {typesDistribution.map((typeDistribution) => (
                      <Option
                        key={typeDistribution.noTypeDistribution}
                        value={typeDistribution.noTypeDistribution}
                        text={`${typeDistribution.nom}`}
                      >
                        {`${typeDistribution.nom}`}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Identifiant" required>
                  <Dropdown
                    name="identifiant"
                    id={"identifiant"}
                    listbox={{ className: useStyles().listbox }}
                    defaultValue={nomIdentifiatDefaut}
                    defaultSelectedOptions={identifiantDefautDropdown}
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setIdentifiant(data.selectedOptions)}
                  >
                    {identifiants.map((identifiant) => (
                      <Option
                        key={identifiant.id}
                        value={identifiant.id}
                        text={identifiant.nom}
                      >
                        {identifiant.nom}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOuvert(false)} appearance="secondary">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    const resultat = await ModifierServeur(
                      formData,
                      serveur.noServeur,
                      DistributionState[0],
                      IdentifiantState[0]
                    );
                    if (resultat.type === "error") {
                      notifier(resultat.message, resultat.type);
                      return;
                    }
                    notifier(resultat.message, resultat.type);
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

export function AjoutDialogue({
  identifiants,
  typesDistribution,
}: {
  identifiants: { id: string; nom: string }[];
  typesDistribution: TypeDistribution[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [estCleSSH, setEstCleSSH] = useState(false);
  const texteCleSSH = estCleSSH ? "Clé SSH" : "Mot de passe";
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notifier = (message: string, typeMessage: ToastIntent) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent: typeMessage }
    );

  const [IdentifiantState, setIdentifiant] = useState<string[]>([]);
  const [DistributionState, setDistribution] = useState<string[]>([]);
  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)}>Ajouter</Button>
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>Ajouter un serveur</DialogTitle>
              <DialogContent>
                <Field label="Nom du serveur" required>
                  <Input name="nomServeur" id={"nomServeur"} required />
                </Field>
                <Field label="Adresse IP" required>
                  <Input name="adresseIP" id={"adresseIP"} required />
                </Field>
                <Field label="Description">
                  <Textarea name="description" id={"description"} />
                </Field>
                <Field label="Port SSH" required>
                  <Input
                    name="portSSH"
                    id={"portSSH"}
                    defaultValue={"22"}
                    required
                    type="number"
                  />
                </Field>
                <Field label="Type de distribution" required>
                  <Dropdown
                    name="typeDistribution"
                    id={"typeDistribution"}
                    listbox={{ className: useStyles().listbox }}
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setDistribution(data.selectedOptions)}
                  >
                    {typesDistribution.map((typeDistribution) => (
                      <Option
                        key={typeDistribution.noTypeDistribution}
                        value={typeDistribution.noTypeDistribution}
                        text={`${typeDistribution.nom}`}
                      >
                        {`${typeDistribution.nom}`}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Identifiant" required>
                  <Dropdown
                    name="identifiant"
                    id={"identifiant"}
                    listbox={{ className: useStyles().listbox }}
                    onOptionSelect={(
                      event: SelectionEvents,
                      data: OptionOnSelectData
                    ) => setIdentifiant(data.selectedOptions)}
                  >
                    {identifiants.map((identifiant) => (
                      <Option
                        key={identifiant.id}
                        value={identifiant.id}
                        text={identifiant.nom}
                      >
                        {identifiant.nom}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOuvert(false)} appearance="secondary">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    const resultat = await AjoutServeur(
                      formData,
                      DistributionState[0],
                      IdentifiantState[0]
                    );
                    if (resultat.type === "error") {
                      notifier(resultat.message, resultat.type);
                      return;
                    }
                    notifier(resultat.message, resultat.type);
                    setOuvert(false);
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

export function EnvoiCommande({ serveur }: { serveur: Serveur & {utilisateurRoot : boolean, aMDPAdmin : boolean } }) {
  const [ouvert, setOuvert] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [resultat, setResultat] = useState<string>("");
  const [commande, setCommande] = useState<string>("");
  const [chargement, setChargement] = useState(false);
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);


  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2));
      const resultat = await EnvoiCommandeServeur(serveur.noServeur, commande, admin);
      setResultat(resultat.message);
      setChargement(false);
    };
  
    if (chargement) {
      fetchData();
    }
  }, [chargement, commande, serveur.noServeur, admin]);

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
                Envoyer une commande au serveur {serveur.nom}
              </DialogTitle>
              <DialogContent>
                <Field label="Commande" required>
                  <Textarea
                    name="commande"
                    id={"commande"}
                    required
                    value={commande}
                    onChange={(event) => setCommande(event.target.value)}
                  />
                </Field>
                <Field label="Enoyer les commandes en tant qu'administrateur">
                  <Switch
                    name="admin"
                    id={"admin"}
                    checked={admin || serveur.utilisateurRoot}
                    disabled={serveur.utilisateurRoot || !serveur.aMDPAdmin}
                    onChange={(event) => setAdmin(event.target.checked)}
                  />
                </Field>
                {resultat ? (
                  <Field label="Resultat">
                    <Textarea
                      name="resultat"
                      id={"resultat"}
                      value={resultat}
                      readOnly
                      className="h-64"
                    />
                  </Field>
                ) : null}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOuvert(false)} appearance="secondary">
                  Fermer
                </Button>
                <Button
                  type="submit"
                  icon={chargement ? <Spinner size="extra-small" /> : <PlayFilled />}
                  formAction={ () => {
                    setChargement(true);
                  }}
                  disabled={chargement}
                  appearance={"primary"}
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
