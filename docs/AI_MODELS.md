# AI Models — free / local / dirt-cheap picks

Goal: run the AI brain (coaching + accountability) and **vision diagnosis** (identify plants,
spot disease/pests/deficiencies, read general health) without a big bill. Verified on the
Hugging Face Hub (June 2026).

## Strategy: two-tier vision

1. **Fast, free, specialized classifier** (runs locally / on a tiny CPU box or HF Inference) —
   gives a cheap first-pass label like "Tomato — Early Blight."
2. **Multimodal reasoning model** (cheap hosted, or local if you have a GPU) — looks at the
   same photo + the classifier label + the plant's history and explains it in plain, calm
   language with a treatment plan. This is also the "green thumb" voice.

You can ship tier 2 alone to start (simplest), then add tier 1 for accuracy/cost savings.

## Tier 1 — specialized plant-disease vision models (small, local-friendly)

| Model | Arch | Why | Link |
|---|---|---|---|
| `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification` | MobileNetV2 | **Top pick.** Tiny, fast, runs on CPU / phone / edge. ~2.3K downloads, 48 likes. Image-classification, transformers-compatible. | https://hf.co/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification |
| `gianlab/swin-tiny-patch4-window7-224-finetuned-plantdisease` | Swin-Tiny | More accurate transformer, still small. | https://hf.co/gianlab/swin-tiny-patch4-window7-224-finetuned-plantdisease |
| `SanketJadhav/PlantDiseaseClassifier-Resnet50` | ResNet50 | Solid baseline classifier. | https://hf.co/SanketJadhav/PlantDiseaseClassifier-Resnet50 |
| `foduucom/plant-leaf-detection-and-classification` | YOLOv8 | **Detection** (boxes), not just classify — good for "where on the leaf." 501 dl, 32 likes. | https://hf.co/foduucom/plant-leaf-detection-and-classification |
| `nickmuchi/yolos-small-plant-disease-detection` | YOLOS | Transformer-based detection alternative. | https://hf.co/nickmuchi/yolos-small-plant-disease-detection |

> Caveat: most are trained on the **PlantVillage** dataset (lab-style single-leaf images) —
> great accuracy on clean leaf shots, weaker on messy real-garden photos. Mitigate by
> guiding users to take close leaf photos, and by deferring to the multimodal model for
> ambiguous cases. The vision research agent is gathering more on datasets/robustness.

## Tier 2 — multimodal reasoning ("the green thumb voice")

Open-weight, Apache-2.0, and available as quantized **GGUF** for cheap local runs via
Ollama / llama.cpp:

| Model | Size | Why | Link |
|---|---|---|---|
| `Qwen/Qwen2.5-VL-3B-Instruct` | 3B | **Best size/quality for local.** Runs on a modest GPU or quantized on CPU. | https://hf.co/Qwen/Qwen2.5-VL-3B-Instruct |
| `Qwen/Qwen2-VL-2B-Instruct` | 2B | Smallest, for very constrained/edge. | https://hf.co/Qwen/Qwen2-VL-2B-Instruct |
| `Qwen/Qwen2.5-VL-7B-Instruct` | 7B | Strongest open option for real-photo reasoning. | https://hf.co/Qwen/Qwen2.5-VL-7B-Instruct |
| `unsloth/Qwen2.5-VL-7B-Instruct-GGUF` | 7B (GGUF) | Quantized, drop-in for Ollama/llama.cpp — cheapest local path. | https://hf.co/unsloth/Qwen2.5-VL-7B-Instruct-GGUF |

## Hosting options, cheapest → most managed

- **Local (free after hardware):** Ollama + a Qwen2.5-VL GGUF for vision; the MobileNetV2
  classifier in a tiny Python/ONNX service. $0/month, needs a machine left on.
- **HF Inference Endpoints / serverless:** push the tier-1 classifier; pay per call, scales
  to zero. Cheap for low volume.
- **Cheap hosted multimodal API:** Anthropic Claude **Haiku** (has vision) is a pragmatic
  default for tier 2 — no infra, strong reasoning, low cost, and it doubles as the text coach
  so we maintain one provider. Compare vs. open Qwen-VL on a cheap GPU host for volume.

## Decision (locked, Jun 2 2026)

1. **Vision = Qwen2.5-VL** (open-weight, Apache-2.0). **Andrew Brown** is helping host/tune it
   (Ollama or HF Inference Endpoint). Called behind a thin `lib/vision` interface so the
   provider can swap without touching the app.
2. **Day-1 fallback = Claude Haiku vision** — lets the diagnosis flow ship immediately while
   Qwen is stood up; flip the `lib/vision` provider when Qwen is live.
3. **Later booster:** **MobileNetV2 plant-disease classifier** (HF) for a cheap, offline,
   on-device first-pass label; Pl@ntNet free tier (≤500/day) for pure ID.
4. **Coach = Claude Haiku** (text), Sonnet for hard reasoning.

_Detailed dataset/cost analysis in `docs/RESEARCH_VISION.md`._
