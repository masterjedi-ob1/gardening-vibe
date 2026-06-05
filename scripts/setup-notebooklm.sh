#!/usr/bin/env bash
# GardZen — set up NotebookLM knowledge base for the Green Thumb coach
# Run once: bash scripts/setup-notebooklm.sh

set -e

echo "🌱 Setting up GardZen NotebookLM knowledge base..."

# Create notebook
NB_JSON=$(notebooklm create "GardZen — Green Thumb Knowledge Base" --json)
NB_ID=$(echo "$NB_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "✓ Created notebook: $NB_ID"

notebooklm use "$NB_ID"

# Core gardening reference sources
echo "Adding gardening knowledge sources..."

notebooklm source add "https://extension.umn.edu/vegetable-growing-guides/growing-tomatoes-home-garden" &
notebooklm source add "https://extension.umn.edu/vegetable-growing-guides/growing-peppers" &
notebooklm source add "https://extension.umn.edu/vegetable-growing-guides/growing-basil" &
notebooklm source add "https://extension.umn.edu/vegetable-growing-guides/growing-squash-home-garden" &
notebooklm source add "https://extension.umn.edu/vegetable-growing-guides/growing-cantaloupe-home-gardens" &
notebooklm source add "https://extension.umn.edu/vegetable-growing-guides/growing-eggplant" &
notebooklm source add "https://extension.umn.edu/vegetable-growing-guides/growing-swiss-chard" &
wait

echo "Adding companion planting + soil guides..."
notebooklm source add "https://www.almanac.com/plant/tomatoes" &
notebooklm source add "https://www.almanac.com/plant/peppers" &
notebooklm source add "https://www.almanac.com/plant/basil" &
notebooklm source add "https://www.almanac.com/gardening/companion-planting/chart" &
wait

# Add the real garden inventory as a note/source
cat > /tmp/garden-context.txt << 'GARDEN'
GardZen Summer 2026 Garden — Chris & Bill
Dedicated to Beatrice McCarthy, the family green thumb.

PLANTS IN THE GROUND:
- Sweet Banana Pepper (3) — full sun
- Cantaloupe (4) — full sun, needs space to vine
- Sweet Basil large (1) — full sun
- Thai Basil (1) — full sun
- Purple Basil (1) — full sun
- Common Chive (1) — partial sun
- Summer Squash (1) — full sun
- Common Squash (1) — full sun
- Charred Yellow Chard (4) — partial sun
- Cilantro (2) — partial sun, bolts in heat
- Rosemary (2) — full sun, perennial
- Ping Tongue Long Eggplant (1) — full sun, Japanese varietal
- Sun Gold Tomato (1) — full sun, cherry, indeterminate — needs support/staking
- Cherokee Purple Tomato (1) — full sun, heirloom, indeterminate — needs support/staking
- Hungarian Black Pepper (2) — full sun

WISHLIST: Beefsteak Tomato, Roma Tomato, Heirloom Tomato (assorted)

BEDS:
- Main Raised Bed (primary grow space)
- Planter Pots (3 × 36" × 6-8")
- Brick Planter (above-ground brick enclosure)

SUPPLIES ON HAND:
- 3 planter pots (36" × 6-8")
- 12 bricks
- Miracle-Gro raised bed soil organic (2 bags)
- Miracle-Gro standard organic soil (1 bag)
- Miracle-Gro standard non-organic soil (2 bags)
- Miracle-Gro plant food spray adapter

SEASON: Summer 2026 | Zone: TBD (set from geolocation)
GARDEN'

notebooklm source add /tmp/garden-context.txt
echo "✓ Garden inventory added as source"

# Wait for processing
echo "Waiting for sources to be indexed..."
notebooklm source list --json | python3 -c "
import sys,json,subprocess,time
sources = json.load(sys.stdin)['sources']
for s in sources:
    if s['status'] != 'ready':
        subprocess.run(['notebooklm','source','wait',s['id'],'--timeout','120'])
"

echo ""
echo "✅ GardZen NotebookLM knowledge base is ready!"
echo "   Notebook ID: $NB_ID"
echo ""
echo "Add to your .env.local:"
echo "   NOTEBOOKLM_NOTEBOOK_ID=$NB_ID"
