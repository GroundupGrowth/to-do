import { getOnboardingFlow } from "@/lib/queries";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { AddStepButton } from "@/components/onboarding/AddStepButton";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const steps = await getOnboardingFlow();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[12px] text-ink-subtle tracking-wider uppercase mb-2">
            Onboarding
          </div>
          <h1 className="text-display">Client flow</h1>
          <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
            Every step of the onboarding process. Prompts are one click to copy,
            links open in a new tab.
          </p>
        </div>
        <AddStepButton />
      </header>

      {steps.length === 0 ? (
        <div className="bg-card rounded-2xl border border-hairline p-10 text-center">
          <div className="text-[14px] text-ink-muted">
            No steps yet. Click{" "}
            <span className="text-ink font-medium">New Step</span> to start
            mapping the flow.
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {steps.map((s, i) => (
            <div key={s.id} className="relative">
              <OnboardingStep index={i} step={s} />
              {i < steps.length - 1 && (
                <div
                  className="mx-auto w-px h-8 bg-hairline"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
