"use client";

import { useState } from "react";
import { MandateType, ClientInfo } from "@/lib/types";
import StepIndicator from "@/components/StepIndicator";
import MandateSelection from "@/components/MandateSelection";
import ClientInfoForm from "@/components/ClientInfoForm";
import DocumentUpload from "@/components/DocumentUpload";
import SuccessScreen from "@/components/SuccessScreen";

const STEP_LABELS = ["Mandat wählen", "Angaben", "Dokumente"];

type AppState =
  | { step: 1 }
  | { step: 2; mandate: MandateType }
  | { step: 3; mandate: MandateType; clientInfo: ClientInfo }
  | { step: 4; mandate: MandateType; clientInfo: ClientInfo; fileNames: string[] };

export default function Home() {
  const [state, setState] = useState<AppState>({ step: 1 });

  function reset() {
    setState({ step: 1 });
  }

  return (
    <div>
      {state.step < 4 && (
        <StepIndicator
          currentStep={state.step}
          totalSteps={3}
          labels={STEP_LABELS}
        />
      )}

      {state.step === 1 && (
        <MandateSelection
          onSelect={(mandate) => setState({ step: 2, mandate })}
        />
      )}

      {state.step === 2 && (
        <ClientInfoForm
          mandate={state.mandate}
          onSubmit={(info) =>
            setState({ step: 3, mandate: state.mandate, clientInfo: info })
          }
          onBack={() => setState({ step: 1 })}
        />
      )}

      {state.step === 3 && (
        <DocumentUpload
          mandate={state.mandate}
          clientInfo={state.clientInfo}
          onSubmit={(files: File[]) =>
            setState({
              step: 4,
              mandate: state.mandate,
              clientInfo: state.clientInfo,
              fileNames: files.map((f) => f.name),
            })
          }
          onBack={() => setState({ step: 2, mandate: state.mandate })}
        />
      )}

      {state.step === 4 && (
        <SuccessScreen
          mandate={state.mandate.label}
          clientName={state.clientInfo.name}
          fileNames={state.fileNames}
          onReset={reset}
        />
      )}
    </div>
  );
}
