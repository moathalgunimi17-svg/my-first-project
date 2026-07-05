import type { StudyDocument } from "./types";

/**
 * Demo document shown when no ANTHROPIC_API_KEY is configured or before a
 * user uploads their first file. Everything in the workspace renders from
 * this shape, which is exactly what the AI pipeline produces for real files.
 */
export const demoDocument: StudyDocument = {
  id: "demo-deep-learning",
  title: "Deep Learning: Foundations and Modern Practice",
  fileName: "deep-learning-foundations.pdf",
  fileType: "PDF",
  sizeBytes: 18_400_000,
  pages: 312,
  language: "English",
  status: "ready",
  uploadedAt: "2026-07-02T10:24:00Z",
  summarySections: [
    {
      heading: "What the book covers",
      content:
        "The text builds neural networks from first principles — starting with the perceptron and gradient descent, then layering in backpropagation, convolutional architectures, sequence models, and finally attention and transformers. Each chapter pairs the mathematics with a worked implementation.",
      citation: { page: 3, snippet: "This book traces a single arc: from the perceptron of 1958 to the transformer of 2017…" },
    },
    {
      heading: "The core idea: learning as optimization",
      content:
        "Every model in the book is framed the same way: a parameterized function, a loss that measures how wrong it is, and gradient descent that nudges parameters to reduce that loss. Backpropagation is presented not as magic but as the chain rule applied systematically through a computation graph.",
      citation: { page: 47, snippet: "Backpropagation is nothing more than the chain rule, organized for reuse." },
    },
    {
      heading: "Why depth matters",
      content:
        "Deeper networks compose simple features into abstract ones — edges become textures, textures become parts, parts become objects. The book demonstrates this empirically with feature visualizations from convolutional networks trained on ImageNet.",
      citation: { page: 121, snippet: "Layer 1 detects edges; layer 5 responds to faces, wheels, and text." },
    },
    {
      heading: "Attention and the transformer era",
      content:
        "The final chapters explain why recurrence was replaced by attention: parallel training, direct access to any position in the sequence, and scaling laws that reward larger models trained on more data. The transformer architecture is dissected block by block.",
      citation: { page: 254, snippet: "Attention lets every token ask a question of every other token — simultaneously." },
    },
  ],
  keyPoints: [
    { text: "A neural network is a differentiable function; training is optimization of its parameters against a loss.", citation: { page: 31, snippet: "…a differentiable function whose parameters we tune…" } },
    { text: "Backpropagation computes gradients in one backward pass using the chain rule over a computation graph.", citation: { page: 47, snippet: "…the chain rule, organized for reuse." } },
    { text: "Convolutions exploit spatial locality and weight sharing, cutting parameters by orders of magnitude.", citation: { page: 109, snippet: "…the same filter slides across the entire image." } },
    { text: "Vanishing gradients limited early deep networks; ReLU, residual connections, and normalization solved this.", citation: { page: 142, snippet: "…residual connections give gradients a highway." } },
    { text: "Attention replaced recurrence because it parallelizes across the sequence during training.", citation: { page: 251, snippet: "…no sequential bottleneck remains." } },
    { text: "Scaling laws: loss falls predictably as a power law in model size, data, and compute.", citation: { page: 283, snippet: "…performance improves as a power law across seven orders of magnitude." } },
  ],
  mindMap: {
    id: "root",
    label: "Deep Learning",
    color: "#3b63f6",
    children: [
      {
        id: "foundations",
        label: "Foundations",
        color: "#8b5cf6",
        children: [
          { id: "perceptron", label: "Perceptron", color: "#8b5cf6" },
          { id: "gradient", label: "Gradient Descent", color: "#8b5cf6" },
          { id: "backprop", label: "Backpropagation", color: "#8b5cf6" },
        ],
      },
      {
        id: "architectures",
        label: "Architectures",
        color: "#06b6d4",
        children: [
          { id: "cnn", label: "CNNs", color: "#06b6d4", children: [
            { id: "conv", label: "Convolution", color: "#06b6d4" },
            { id: "pool", label: "Pooling", color: "#06b6d4" },
          ] },
          { id: "rnn", label: "RNNs / LSTMs", color: "#06b6d4" },
          { id: "transformer", label: "Transformers", color: "#06b6d4", children: [
            { id: "attention", label: "Self-Attention", color: "#06b6d4" },
            { id: "posenc", label: "Positional Encoding", color: "#06b6d4" },
          ] },
        ],
      },
      {
        id: "training",
        label: "Training",
        color: "#f59e0b",
        children: [
          { id: "loss", label: "Loss Functions", color: "#f59e0b" },
          { id: "reg", label: "Regularization", color: "#f59e0b" },
          { id: "norm", label: "Normalization", color: "#f59e0b" },
        ],
      },
      {
        id: "scaling",
        label: "Scaling",
        color: "#ec4899",
        children: [
          { id: "laws", label: "Scaling Laws", color: "#ec4899" },
          { id: "data", label: "Data Curation", color: "#ec4899" },
        ],
      },
    ],
  },
  flashcards: [
    { id: "f1", front: "What is backpropagation?", back: "The chain rule applied systematically through a computation graph to compute gradients of the loss with respect to every parameter in one backward pass.", difficulty: "easy" },
    { id: "f2", front: "Why do convolutional layers use weight sharing?", back: "The same visual feature (an edge, a texture) can appear anywhere in an image — sliding one filter across all positions detects it everywhere while using far fewer parameters.", difficulty: "medium" },
    { id: "f3", front: "What problem do residual connections solve?", back: "Vanishing gradients in deep networks: the identity shortcut gives gradients a direct path backwards, allowing networks hundreds of layers deep to train.", difficulty: "medium" },
    { id: "f4", front: "Why did attention replace recurrence?", back: "Attention has no sequential bottleneck — every position attends to every other in parallel, so training parallelizes across the whole sequence and long-range dependencies get a direct connection.", difficulty: "hard" },
    { id: "f5", front: "State the scaling-laws result.", back: "Test loss falls as a predictable power law in model parameters, dataset size, and training compute — observed across at least seven orders of magnitude.", difficulty: "hard" },
    { id: "f6", front: "What does a loss function do?", back: "It maps the model's predictions and the true targets to a single number measuring how wrong the model is — the quantity gradient descent minimizes.", difficulty: "easy" },
  ],
  quiz: [
    {
      id: "q1", type: "mcq", difficulty: "easy",
      question: "What mathematical rule is backpropagation built on?",
      options: ["The product rule", "The chain rule", "L'Hôpital's rule", "Bayes' theorem"],
      answerIndex: 1,
      explanation: "Backpropagation applies the chain rule through the computation graph to obtain all gradients in a single backward pass (p. 47).",
    },
    {
      id: "q2", type: "mcq", difficulty: "medium",
      question: "Which innovation most directly enabled training networks with hundreds of layers?",
      options: ["Dropout", "Max pooling", "Residual connections", "Larger batch sizes"],
      answerIndex: 2,
      explanation: "Residual (skip) connections give gradients an identity path backwards, defeating the vanishing-gradient problem (p. 142).",
    },
    {
      id: "q3", type: "true_false", difficulty: "easy",
      question: "Recurrent networks process a sequence in parallel during training.",
      options: ["True", "False"],
      answerIndex: 1,
      explanation: "RNNs are inherently sequential — each step depends on the previous hidden state. That bottleneck is exactly what attention removed (p. 251).",
    },
    {
      id: "q4", type: "fill_blank", difficulty: "medium",
      question: "In a convolutional layer, the same ______ slides across the entire image, detecting a feature at every position.",
      answerText: "filter",
      explanation: "Weight sharing: one filter (kernel) is reused at all spatial positions (p. 109).",
    },
    {
      id: "q5", type: "mcq", difficulty: "hard",
      question: "Scaling laws describe test loss as what kind of function of model size, data, and compute?",
      options: ["Linear", "Exponential", "Logistic", "Power law"],
      answerIndex: 3,
      explanation: "Loss falls as a power law across many orders of magnitude in each of the three factors (p. 283).",
    },
  ],
  terms: [
    { term: "Perceptron", definition: "The earliest trainable linear classifier (Rosenblatt, 1958) — a weighted sum of inputs passed through a threshold.", kind: "concept", citation: { page: 12, snippet: "Rosenblatt's perceptron of 1958…" } },
    { term: "Gradient descent", definition: "Iteratively moving parameters in the direction that most steeply reduces the loss.", kind: "concept", citation: { page: 38, snippet: "…step downhill along the negative gradient." } },
    { term: "ReLU", definition: "Rectified Linear Unit, max(0, x) — the activation that made very deep networks practical.", kind: "formula", citation: { page: 96, snippet: "f(x) = max(0, x)" } },
    { term: "Geoffrey Hinton", definition: "Co-author of the 1986 paper that popularized backpropagation for training multi-layer networks.", kind: "person", citation: { page: 45, snippet: "Rumelhart, Hinton and Williams (1986)…" } },
    { term: "ImageNet", definition: "The 1.2-million-image benchmark whose 2012 competition result launched the deep learning era.", kind: "keyword", citation: { page: 118, snippet: "AlexNet halved the error rate on ImageNet…" } },
    { term: "Self-attention", definition: "A mechanism where each token computes weighted combinations of all other tokens' representations.", kind: "concept", citation: { page: 254, snippet: "…every token asks a question of every other token." } },
    { term: "2017", definition: "Publication year of 'Attention Is All You Need', introducing the transformer.", kind: "date", citation: { page: 249, snippet: "…the 2017 paper that ended the recurrent era." } },
  ],
  timeline: [
    { year: "1958", title: "The Perceptron", description: "Rosenblatt introduces the first trainable neural classifier." },
    { year: "1986", title: "Backpropagation popularized", description: "Rumelhart, Hinton & Williams show multi-layer networks can learn internal representations." },
    { year: "1998", title: "LeNet-5", description: "LeCun's convolutional network reads handwritten digits for US postal service." },
    { year: "2012", title: "AlexNet wins ImageNet", description: "GPU-trained CNN halves the error rate; the deep learning era begins." },
    { year: "2015", title: "ResNet", description: "Residual connections enable 152-layer networks, surpassing human-level ImageNet accuracy." },
    { year: "2017", title: "The Transformer", description: "'Attention Is All You Need' replaces recurrence with self-attention." },
    { year: "2020", title: "Scaling laws", description: "Loss shown to fall as a predictable power law in size, data, and compute." },
  ],
  tables: [
    {
      title: "Architecture comparison (Chapter 9)",
      page: 231,
      columns: ["Architecture", "Params", "Sequence handling", "Training parallelism", "Long-range deps"],
      rows: [
        ["MLP", "High (dense)", "None", "Full", "N/A"],
        ["CNN", "Low (shared)", "Local windows", "Full", "Weak"],
        ["RNN / LSTM", "Medium", "Sequential", "None", "Degrades with distance"],
        ["Transformer", "High", "Attention (global)", "Full", "Direct"],
      ],
    },
    {
      title: "Optimizer summary (Chapter 6)",
      page: 156,
      columns: ["Optimizer", "Adaptive LR", "Momentum", "Typical use"],
      rows: [
        ["SGD", "No", "Optional", "Vision, well-tuned schedules"],
        ["Adam", "Yes", "Yes", "Default for most tasks"],
        ["AdamW", "Yes", "Yes", "Transformers (decoupled weight decay)"],
      ],
    },
  ],
};

export const recentDocuments = [
  { id: "demo-deep-learning", title: "Deep Learning: Foundations and Modern Practice", type: "PDF", pages: 312, language: "English", uploadedAt: "2 days ago", progress: 100 },
  { id: "demo-econ", title: "Principles of Macroeconomics — Lecture Notes", type: "DOCX", pages: 84, language: "Arabic", uploadedAt: "5 days ago", progress: 100 },
  { id: "demo-bio", title: "Cell Biology Research Review 2026", type: "PDF", pages: 46, language: "German", uploadedAt: "1 week ago", progress: 100 },
  { id: "demo-hist", title: "History of the Silk Road (scanned)", type: "PDF · OCR", pages: 210, language: "English", uploadedAt: "2 weeks ago", progress: 100 },
];
