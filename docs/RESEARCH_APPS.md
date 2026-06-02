# Competitive Research — Gardening / Plant-Care Apps (2026)

Research to inform "AI Greenthumb." Full per-app teardowns below; the short version drives
`PROJECT_PLAN.md`.

## Comparison matrix (top 8)

| App | Inventory/Journal | Reminders | Plant ID | Photo Diagnosis | Community | Veg lifecycle | AI chat | Mindfulness | Web | Price/yr |
|---|---|---|---|---|---|---|---|---|---|---|
| **Planta** | ✅ | ✅✅ smart/weather | ✅ paid | ✅ Dr. Planta | ✅ | ⚠️ houseplant | ⚠️ | ⚠️ soft | ❌ | $35.99 |
| **PictureThis** | ⚠️ | ⚠️ | ✅✅ | ✅✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ~$30–40 |
| **Greg** | ✅ | ✅✅ env-based | ✅ | ⚠️ | ✅ | ❌ houseplant | ⚠️ | ⚠️ soft | ❌ | sub/lifetime |
| **Seed to Spoon** | ✅✅ | ✅ zone-based | ✅ Growbot | ✅ Growbot | ❌ | ✅✅✅ | ✅ | ❌ | ⚠️ | freemium |
| **Gardenize** | ✅✅✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ❌ | ✅ | $44 |
| **Seek (iNat)** | ❌ | ❌ | ✅✅ free | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | Free |
| **Plantix** | ⚠️ | ⚠️ | ✅ | ✅✅✅ crops | ✅ | ✅ edibles | ⚠️ | ❌ | ❌ | Free |
| **Smart Gardener** | ✅✅ | ✅ | ❌ | ❌ | ✅ | ✅✅✅ planner | ❌ | ❌ | ✅ | ~$40 |

✅✅✅ standout · ⚠️ partial · ❌ absent

## Table-stakes (every credible app has these)
1. Plant inventory ("My Garden") with photos
2. Photo plant ID (users expect this **free** — Seek/Pl@ntNet set the bar)
3. Care reminders / watering schedules (ideally weather/zone-aware)
4. A plant/care database with per-species guidance
5. Growth/care journal with timeline photos
6. Freemium with 7–14 day trial; ID/diagnosis/unlimited behind paywall
7. Increasingly: an AI chat assistant (now table-stakes, not a differentiator)

## White-space — where AI Greenthumb wins
- **The combo nobody owns:** edible-garden **lifecycle** + **AI vision diagnosis** + **genuine mindfulness**. Seed to Spoon owns veg lifecycle but has no wellbeing angle and weak polish; Planta/Greg have polish + soft wellness but are houseplant-centric; mindfulness apps (PlantMood) are tiny with no real garden tooling. **Sit in the center.**
- **Zen temporal UX:** a calm seasonal clock/almanac rhythm instead of a nagging task list. Reframe chores as ritual ("morning watering meditation"). Validated: PlantIn survey found **80% of users report less stress / more mindfulness** from plant care.
- **Trust-first monetization:** PictureThis's billing reputation is toxic. Win on transparent pricing, easy cancel, data-persists-after-cancel (Gardenize's good-faith model).
- **Veg-specific intelligence:** companion planting, frost-date/zone scheduling, succession planting, harvest + "money saved" — under-served by polished houseplant apps.
- **True web-first + ambient presence:** leaders are mobile-only; a great responsive web app + "garden glance" widgets is open.
- **LLM grounded in YOUR garden:** GPT-wrappers (Growbot, GardenAI) have no memory of your actual inventory/zone/journal. Grounding the assistant in real state is the moat.

## Per-app notes
- **Planta** — category leader (houseplant-first). 30+ params + weather for reminders; "Dr. Planta" diagnosis with human expert review. Best-in-class onboarding + family sharing. ~$35.99/yr. https://getplanta.com/
- **PictureThis** — ID/diagnosis powerhouse (400k+ species, claims 98%+). Light on journaling/planning. Aggressive billing → trust gap to exploit. https://www.picturethisai.com/
- **Greg** — design-forward houseplant care; gamified data entry; soft "interconnectedness" framing. https://greg.app/
- **From Seed to Spoon** — closest concept (veg lifecycle): layout planner, GPS planting dates, companion warnings, "Growbot" photo ID + pest spotting. Lacks polish + mindfulness. https://www.seedtospoon.net/app/
- **Gardenize** — record-keeping leader with real **web** app, CSV export, cost tracking; data persists after cancel. $44/yr ($4.40/mo via web). https://gardenize.com/
- **Seek (iNaturalist)** — free, no-account, on-device-feeling real-time ID; sets the free-ID baseline. https://www.inaturalist.org/pages/seek_app
- **Plantix** — free, best-in-class **crop** disease CV (claims 98% across 30 crops); strong on edibles. https://plantix.net/en/
- **Smart Gardener** — veg-planning calculator: household-size garden plan, harvest "$ saved," crop rotation. ~$40/yr, no real free tier. https://www.smartgardener.com/
- **AI-native newcomers** — Growbot AI, GardenAI (Garden Savvy), Agrio/Harvie, MasterGardener.ai. Mostly thin GPT wrappers; strong Q&A, weak inventory/lifecycle/polish.
- **Mindfulness niche (rare, our wedge)** — only tiny players: PlantMood (plant "mood" check-ins + 3-min meditations) and Zen Plant Manager. No mainstream app productizes wellbeing well.
- **Polish north-star: Flighty** — "works so well it feels boringly obvious." Ruthless info hierarchy; borrow real-world visual language (seed-packet/almanac/seasonal-clock); shines most when things go wrong (→ our diagnosis flow is make-or-break).

## Recommended MVP feature set
**Core:** (1) garden/bed inventory with photos · (2) photo plant ID + health diagnosis via 3rd-party CV · (3) AI Greenthumb chat grounded in inventory + hardiness zone + journal · (4) smart, calm reminders (water/feed/sow/harvest, zone/weather-aware) · (5) growth journal + harvest log · (6) zone-aware planting calendar from geolocation.
**Mindfulness wedge (ship ≥1 in MVP):** (7) daily garden check-in + 2–3 min guided "tend your garden" moment; calm streak, no punitive gamification.
**Defer to v2:** community feed, companion-planting engine, family sharing, light meter, marketplace/affiliate.
