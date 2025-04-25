// components/ui/steps.tsx

import { cn } from "@/lib/utils"

interface StepsProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function Steps({ currentStep, totalSteps, labels }: StepsProps) {
  return (
    <div className="flex items-center justify-center w-full mt-4">
      <div className="flex items-center w-full max-w-xs">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center w-full">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                index <= currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 transition-colors",
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/30",
                )}
              />
            )}
          </div>
        ))}
      </div>
      {labels && (
        <div className="flex items-center justify-between w-full max-w-xs mt-2 px-1">
          {labels.map((label, index) => (
            <div
              key={index}
              className={cn(
                "text-xs font-medium transition-colors",
                index <= currentStep ? "text-primary" : "text-muted-foreground",
              )}
              style={{
                width: `${100 / labels.length}%`,
                textAlign: index === 0 ? "left" : index === labels.length - 1 ? "right" : "center",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
