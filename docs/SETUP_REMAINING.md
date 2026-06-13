# Remaining setup — NotebookLM & Qwen2.5-VL vision

The code for all three Day-1-continuation features is in place. Feature 1 (Inventory CRUD)
is fully live. Features 2 and 3 are **wired and waiting on credentials / interactive auth**
that can only be provided from a real machine or the Vercel dashboard — they can't be
completed from a remote build container. Here's exactly what's left.

## 2. NotebookLM knowledge base

The chat route (`app/api/chat/route.ts`) already calls `queryGardenKnowledge()` in
`lib/ai/notebooklm.ts`, and gracefully falls back to garden-state-only context when
NotebookLM isn't reachable. To light it up:

```bash
# On your local machine (one-time, opens a browser for Google OAuth):
notebooklm login

# Bootstrap the knowledge base (UMN Extension + Almanac + real inventory):
bash scripts/setup-notebooklm.sh
# → prints the new notebook ID
```

Then set in Vercel project settings:

- `NOTEBOOKLM_NOTEBOOK_ID` = the printed notebook ID

**Heads-up on serverless:** `lib/ai/notebooklm.ts` shells out to the `notebooklm` CLI.
That works locally, but Vercel's serverless runtime has neither the CLI binary nor a
persisted browser login. To make it work in production you'll need to either (a) export
auth into `NOTEBOOKLM_AUTH_JSON` and bundle the CLI, or (b) move the lookup behind a small
always-on service. Until then, the coach runs perfectly on live garden state alone.

Test once live: ask the Green Thumb about Cherokee Purple tomatoes — the answer should cite
specific staking advice from the knowledge base.

## 3. Qwen2.5-VL vision

`lib/vision/index.ts` now supports three routes (first match wins):

1. `VISION_ENDPOINT_URL` → Andrew Brown's custom Qwen2.5-VL endpoint
2. `VISION_PROVIDER=huggingface` → HuggingFace Inference API (OpenAI-compatible chat)
3. neither → Claude Haiku vision fallback (always on)

**If Andrew's endpoint is ready**, set in Vercel:

- `VISION_ENDPOINT_URL` = his endpoint URL
- `VISION_ENDPOINT_TOKEN` = his token

**To use HuggingFace directly instead**, set in Vercel:

- `VISION_PROVIDER` = `huggingface`
- `HF_TOKEN` = a HuggingFace token (the `masterjedi-ob1` account works)
- optional `VISION_MODEL` = `Qwen/Qwen2.5-VL-7B-Instruct` (default) or `...-72B-Instruct`

The HF path posts to `https://router.huggingface.co/v1/chat/completions` with the image as
a data URI and parses the same JSON diagnosis schema as the Haiku fallback. Test with a real
plant photo on `/diagnose` — the result footer shows which model answered.
