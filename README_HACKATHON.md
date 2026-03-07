# Eathos - Hackathon Project Summary

Frontiers Gen-AI Hackathon (MIT x Google DeepMind), March 2026

## Project

Eathos is an AI nutritionist that goes from fridge photo to personalized meal decisions. It identifies ingredients, estimates freshness, reasons over nutrition and expiry, and generates recipe options for different people in the same household.

Core idea: AI proposes, humans decide.

## Problem

American households waste food largely due to kitchen decision gaps:
- People do not know what is expiring soon.
- People struggle to decide what to cook from what they already have.
- Existing recipe apps start from recipe browsing instead of available inventory.
- Families have mixed dietary needs across ages and health constraints.

From the brief:
- ~$1,500 food wasted per U.S. household per year.
- ~$408B U.S. food waste annually.
- 131M+ U.S. households affected.
- 72% of consumers want AI meal planning.

## Solution

Eathos uses a multi-agent AI pipeline to convert one fridge scan into practical meal plans:
- Detects inventory with confidence scores and freshness signals.
- Lets users confirm/edit detections before planning.
- Prioritizes soon-to-expire items.
- Produces recipe variants for different household members (for example, athlete + low-sodium senior).
- Keeps users in control with explicit approval at each phase.

## How It Works

1. Scan fridge or pantry with a photo (Gemini 2.5 Flash Vision).
2. Confirm detected inventory (edit/remove low-confidence items).
3. Run multi-agent reasoning across inventory, nutrition, and constraints.
4. Review and approve recipe options (or reject and regenerate up to 3x).
5. Export grocery gap list and deep-link checkout (Instacart).

## Demo Story

Maya (34) scans her fridge. Eathos detects 9+ ingredients and flags uncertain items. The nutritionist agent prioritizes expiring salmon and proposes recipe variants, including a low-sodium option for her mother Kamala (68). Maya reviews the visible reasoning, approves a recipe, gets a Telegram confirmation, and taps to order missing items for same-day delivery.

## Core Features

- Fridge vision scan with confidence and freshness estimates.
- Multi-agent pipeline: Food Analyzer -> Inventory Sync -> Nutritionist -> Image Generation.
- Multi-generational adaptation from a single scan.
- Human-in-the-loop checkpoints between agent phases.
- Expiry-first planning to reduce waste.

## Tech Stack

- Gemini 2.5 Flash
- Google ADK
- Google Vision API
- Instacart API

## Team

Red Huskies (Cornell x Northeastern)
- Maria S.
- Alexis Y.
- Keivalya P.
- Sanath U.
- Kalyan M.

## Hackathon Rubric Alignment

- UI/UX: clear guided flow from scan to decision.
- Engineering: phased multi-agent orchestration with user checkpoints.
- Grounding: confidence-scored detections + explicit inventory confirmation.
- Innovation: multi-generational adaptation in one planning cycle.
- Real-world fit: direct integration to grocery fulfillment and waste reduction.
