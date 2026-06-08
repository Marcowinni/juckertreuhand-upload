"use client";

import { useState } from "react";
import { MandateType, ClientInfo } from "@/lib/types";
import { clientDisplayName } from "@/lib/folders";
import StepIndicator from "@/components/StepIndicator";
import MandateSelection from "@/components/MandateSelection";
import ClientInfoForm from "@/components/ClientInfoForm";
import DocumentUpload from "@/components/DocumentUpload";
import SuccessScreen from "@/components/SuccessScreen";

const STEP_LABELS = ["Mandat wählen", "Angaben", "Dokumente"];

export default function Home() {
  const [step, setStep] = useState(1);
  const [mandate, setMandate] = useState<MandateType | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  function reset() {
    setStep(1);
    setMandate(null);
    setClientInfo(null);
    setFileNames([]);
  }

  return (
    <div>
      {step < 4 && (
        <StepIndicator currentStep={step} totalSteps={3} labels={STEP_LABELS} />
      )}

      {step === 1 && (
        <MandateSelection
          onSelect={(m) => {
            setMandate(m);
            setStep(2);
          }}
        />
      )}

      {step === 2 && mandate && (
        <ClientInfoForm
          mandate={mandate}
          initial={clientInfo ?? undefined}
          onSubmit={(info) => {
            setClientInfo(info);
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && mandate && clientInfo && (
        <DocumentUpload
          mandate={mandate}
          clientInfo={clientInfo}
          onSubmit={(files: File[]) => {
            setFileNames(files.map((f) => f.name));
            setStep(4);
          }}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && mandate && clientInfo && (
        <SuccessScreen
          mandate={mandate.label}
          clientName={clientDisplayName(mandate.category, clientInfo)}
          fileNames={fileNames}
          onReset={reset}
        />
      )}
    </div>
  );
}
