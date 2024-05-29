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
} from "@fluentui/react-components";
import { DeleteRegular, EditRegular } from "@fluentui/react-icons";
import { TypeDistribution } from "@prisma/client";
import {
  SupprimerDistribution,
  ModifierDistribution,
  AjoutDistribution,
} from "./action";
import { useState } from "react";

export function SupprimerDialogue({
  noDistribution,
  nomDistribution,
}: {
  noDistribution: string;
  nomDistribution: string;
}) {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notifier = () =>
    dispatchToast(
      <Toast>
        <ToastTitle>
          La distribution {nomDistribution} a été supprimée.
        </ToastTitle>
      </Toast>,
      { intent: "success" }
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
              Êtes-vous sûr de vouloir supprimer la distribution{" "}
              {nomDistribution}?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Annuler</Button>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="primary"
                  onClick={() => {
                    SupprimerDistribution(noDistribution);
                    notifier();
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
  distribution,
}: {
  distribution: TypeDistribution;
}) {
  const [ouvert, setOuvert] = useState(false);

  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)} icon={<EditRegular />} />
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>
                Modification de la distribution {distribution.nom}
              </DialogTitle>
              <DialogContent>
                <Field label="Nom" required>
                  <Input
                    name="nom"
                    id={"nom"}
                    defaultValue={distribution.nom}
                    required
                  />
                </Field>
                <Field label="Description" required>
                  <Textarea
                    name="description"
                    id={"description"}
                    defaultValue={distribution.description}
                    required
                    className="h-36"
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOuvert(false)} appearance="secondary">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    const resultat = await ModifierDistribution(
                      formData,
                      distribution.noTypeDistribution
                    );
                    dispatchToast(
                      <Toast>
                        <ToastTitle>
                          La distribution {distribution.nom} a été modifiée.
                        </ToastTitle>
                      </Toast>,
                      { intent: "success" }
                    );
                    setOuvert(resultat);
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

export function AjoutDialogue() {
  const [ouvert, setOuvert] = useState(false);
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Dialog open={ouvert}>
        <Button onClick={() => setOuvert(true)}>Ajouter</Button>
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>Ajouter une distribution</DialogTitle>
              <DialogContent>
                <Field label="Nom" required>
                  <Input name="nom" id={"nom"} required />
                </Field>
                <Field label="Description" required>
                  <Textarea
                    name="description"
                    id={"description"}
                    required
                    className="h-36"
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOuvert(false)} appearance="secondary">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  formAction={async (formData: FormData) => {
                    await AjoutDistribution(formData);
                    dispatchToast(
                      <Toast>
                        <ToastTitle>
                          La distribution a été ajoutée avec succès.
                        </ToastTitle>
                      </Toast>,
                      { intent: "success" }
                    );
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
