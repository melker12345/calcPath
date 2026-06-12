import type { ChapterPlan } from "../lib/consolidate-chapters";

export const INFORMATION_THEORY_CHAPTERS: ChapterPlan[] = [
  {
    id: "information-measures",
    title: "Information Measures",
    description:
      "Entropy, joint and conditional entropy, mutual information, relative entropy, and entropy rate.",
    order: 1,
    topicIds: [
      "information-theory",
      "entropy-information-theory",
      "joint-entropy",
      "conditional-entropy",
      "mutual-information",
      "relative-entropy",
      "entropy-rate",
    ],
  },
  {
    id: "source-coding",
    title: "Source Coding & Compression",
    description:
      "The AEP, Shannon's source coding theorem, and practical lossless compression algorithms.",
    order: 2,
    topicIds: [
      "asymptotic-equipartition-property",
      "source-coding-theorem",
      "data-compression",
      "huffman-coding",
      "arithmetic-coding",
      "lempel-ziv-welch-algorithm",
      "shannon-fano-coding",
      "universal-code",
    ],
  },
  {
    id: "channel-coding",
    title: "Channel Coding & Error Correction",
    description:
      "Channel capacity, noisy-channel coding, and error-correcting codes from Hamming to polar and turbo codes.",
    order: 3,
    topicIds: [
      "channel-capacity",
      "noisy-channel-coding-theorem",
      "error-detection-and-correction",
      "hamming-code",
      "low-density-parity-check-code",
      "polar-code",
      "turbo-code",
      "channel-coding-with-feedback",
    ],
  },
  {
    id: "rate-distortion",
    title: "Rate–Distortion Theory",
    description:
      "Lossy compression limits, quantization, vector quantization, and distributed source coding.",
    order: 4,
    topicIds: [
      "rate-distortion-theory",
      "rate-distortion-function",
      "quantization-signal-processing",
      "vector-quantization",
      "rate-distortion-with-side-information",
      "wyner-ziv-coding",
      "slepian-wolf-coding",
    ],
  },
  {
    id: "network-information-theory",
    title: "Network Information Theory",
    description:
      "Multiple-access and broadcast channels, network coding, common randomness, and the Blahut–Arimoto algorithm.",
    order: 5,
    topicIds: [
      "multiple-access-channel",
      "broadcast-channel",
      "network-coding",
      "common-randomness",
      "blahut-arimoto-algorithm",
    ],
  },
  {
    id: "algorithmic-information",
    title: "Algorithmic Information Theory",
    description:
      "Kolmogorov complexity and the algorithmic approach to measuring information in individual objects.",
    order: 6,
    topicIds: [
      "algorithmic-information-theory",
      "kolmogorov-complexity",
      "kolmogorov-complexity-2",
    ],
  },
  {
    id: "security-privacy",
    title: "Security & Privacy",
    description:
      "Secret sharing, secure multiparty computation, and differential privacy.",
    order: 7,
    topicIds: [
      "secret-sharing",
      "secure-multiparty-computation",
      "differential-privacy",
    ],
  },
  {
    id: "quantum-information",
    title: "Quantum Information Theory",
    description:
      "Information-theoretic foundations of quantum communication and computation.",
    order: 8,
    topicIds: ["quantum-information-theory"],
  },
];