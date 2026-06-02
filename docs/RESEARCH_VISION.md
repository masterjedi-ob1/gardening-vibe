# Vision Research — Plant Health Diagnosis (free / local / cheap, mid-2026)

How to ID plants, detect disease/pests/deficiencies, and read general health — cheaply.
Pairs with `AI_MODELS.md` (the chosen models). Full detail below.

## TL;DR
Don't train from scratch, don't rely on one model. Use a **two-tier hybrid**: a cheap
**multimodal model** for ID + reasoning + plain-language advice, backed by a **specialist
disease layer** (local classifier or a cheap crop-disease API) for accurate labels. General
VLMs alone are **not** reliable for fine-grained disease diagnosis as of 2026.

## 1. Open datasets

| Dataset | Coverage | License | Limitation |
|---|---|---|---|
| **PlantVillage** | 14 crops, 38 classes, ~54k | CC BY-SA 3.0, **academic-restricted** | **Lab images** (single leaf, clean bg) → poor field generalization |
| **New Plant Diseases** (Kaggle) | same 38 classes, ~87k aug | inherits CC BY-SA | augmented PlantVillage; same lab bias |
| **PlantDoc** | 13 crops, 17 diseases, ~2.6k field | **CC BY 4.0 — commercial OK** | small, noisier labels, no masks |
| **PlantSeg** (2025) | in-the-wild disease **segmentation** | open | newer; "where on the leaf" |
| **FieldPlant** | field disease detection | open (research) | addresses lab→field gap |
| **IP102** | **102 insect pests**, ~75k | research | pests only, long-tailed |
| **Pl@ntNet/GBIF** | species **ID**, millions | API terms | ID only — no disease |

Takeaways: PlantVillage = best for *training* but lab-biased + commercially encumbered.
**PlantDoc (CC BY 4.0)** is the clean commercial pick; combine with FieldPlant/PlantSeg to
fight the lab→field gap. **IP102** for pests. **Nutrient-deficiency open data is sparse** —
lean on a commercial API or LLM reasoning and set expectations.

## 2. Locally-runnable open models
**Classifiers (whole-leaf label, CPU/phone-friendly):**
- **MobileNetV2/V3 on PlantVillage** — e.g. `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`. ~3–4M params, ms-latency on CPU, quantizes to ~5–10MB for **on-device/offline** (TFLite/ONNX/CoreML). Cheapest path.
- **ViT-base on PlantVillage** — higher accuracy, ~86M params, small GPU.
- **EfficientNet-B0/B4, ResNet, Swin** — strong baselines; ensembles ~97% on PlantVillage *lab* test (drops on real photos).

**Detectors (locate lesions/pests):**
- **YOLOv8 / YOLOv11n (Ultralytics)** — real-time on mobile; train on PlantDoc/IP102 boxes. ⚠️ **AGPL-3.0** → commercial license needed if not open-sourcing.

**Open VLM, self-hostable:** **Qwen2.5-VL-7B-Instruct** (Apache-2.0, Ollama `qwen2.5vl:7b`, ~8GB+ VRAM); newer Qwen3-VL. Clean commercial license.

Caveat: PlantVillage-trained models score 95%+ on lab test, **degrade on real backyard
phone photos**. Validate on PlantDoc / our own photos, not the lab split.

## 3. Hosted APIs vs local — are general VLMs enough?
**Specialist plant APIs (turnkey):**
- **Pl@ntNet API** — best **species ID**; free **500/day**. ID only.
- **Plant.id / Kindwise plant.health** — ID **+ disease/health** + treatment.
- **Kindwise crop.health** — purpose-built **crop disease** API (most relevant). Pricing **€0.05→€0.01/credit** (€10–50 per 1k calls).

**General multimodal LLMs in 2026 — good for ID/narrative/advice, NOT reliable for
fine-grained disease alone.** Zero-shot disease labels are weak (GPT-4o 45.9%, Gemini 56.1%,
CLIP 64.3% on a 6-class tomato test vs 88.9% specialist). Few-shot prompting helps a lot
(+15% with relevant examples). A small domain-tuned VLM (AgriChain-VL3B, 73.1%) beat big
general models. → Use a VLM for the **reasoning/UX layer**, back it with a **specialist** for
the actual call.

## 4. Recommended architecture (solo dev)
**Phase 0 (MVP, days):** ID via Pl@ntNet (free ≤500/day) or the multimodal model; disease +
health narrative via a cheap multimodal model with a **structured JSON prompt** ("identify
plant, list symptoms, rank probable causes, assess environment/health, give care steps") +
2–3 few-shot reference images. ~free–few $/mo. _(For us, Claude Haiku vision is the pragmatic
default since it's also the coach — one provider; Gemini 2.5 Flash-Lite is the cheap alt.)_
**Phase 1 (accuracy):** add a specialist disease layer — cheapest accurate = **Kindwise
crop.health / Plant.id** (€0.01–0.05/call); or **self-host a fine-tuned MobileNet/ViT**
(PlantVillage+PlantDoc), deployable **on-device** (TFLite) for offline/zero marginal cost;
YOLOv11n for "where/how bad" (mind AGPL). Orchestrate: LLM reasons + advises, specialist
gives the authoritative label, LLM reconciles. Always show confidence + "consult a human."

## 5. Rough costs (10k images/mo)
| Approach | Cost |
|---|---|
| Local fine-tuned MobileNet/ViT (own server / on-device) | ~$0 marginal |
| Multimodal LLM reasoning (Gemini Flash-Lite / Claude Haiku) | ~$1–8/mo |
| Pl@ntNet API (ID) | $0 under free tier |
| Kindwise / Plant.id specialist | ~€100–500/mo at €0.01–0.05 (negotiate down) |
| HF Inference Endpoint (self-host classifier, scale-to-zero) | ~$10–40/mo light use |
| Self-host Qwen2.5-VL-7B 24/7 | ~$300–900/mo |

**Cheapest viable production:** Pl@ntNet (free ID) + cheap multimodal LLM (reasoning/advice)
+ on-device MobileNet (free offline disease labels) → **a few $/month**, add Kindwise
crop.health later for authoritative calls.

### Design-around caveats
- **Lab→field gap:** validate on real photos; guide users to clear close-up leaf shots.
- **Licensing:** PlantVillage (CC BY-SA, academic) and YOLO (AGPL) have commercial strings; **PlantDoc (CC BY 4.0)** and **Qwen2.5-VL (Apache-2.0)** are clean.
- **Nutrient deficiencies** = weakest open coverage; lean on API/LLM and set expectations.
