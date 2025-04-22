// DyraneUI Motion Tokens - Define durations, easing, etc. here
export const MotionTokens = {
  duration: {
    short: 0.2,
    medium: 0.35,
    long: 0.5,
  },
  ease: {
    subtle_easeInOut: [0.4, 0, 0.6, 1],
    // Add other easing curves as needed
  },
  spring: {
    default: { type: "spring", stiffness: 400, damping: 30 },
    gentle: { type: "spring", stiffness: 200, damping: 25 },
  },
};
