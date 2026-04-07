interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${isActive ? "bg-navy text-white" : ""}
                  ${isCompleted ? "bg-navy/20 text-navy" : ""}
                  ${!isActive && !isCompleted ? "bg-gray-100 text-gray-400" : ""}
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  isActive ? "text-charcoal font-medium" : "text-gray-400"
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {step < totalSteps && (
              <div className={`w-8 sm:w-12 h-px ${step < currentStep ? "bg-navy/30" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
