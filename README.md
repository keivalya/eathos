# Eathos — AI Nutritionist from a Fridge Scan

[Watch the Demo Video](https://github.com/user-attachments/assets/29aab976-ed9b-42a1-9278-96b9a7df43d8)

## Overview

Eathos turns a single fridge photo into personalized meal decisions. It identifies ingredients, estimates freshness, reasons over nutrition and expiry, and recommends recipes for different people in the same household. **AI proposes, humans confirm.**

## The Problem

Food waste often starts with a simple daily question: *What can I make with what I already have?*

Households struggle because:
- People do not know what is expiring soon.
- Meal planning starts from browsing recipes, not real inventory.
- Families often have mixed dietary needs, ages, and health constraints.

## Our Solution

Eathos uses a multi-agent AI pipeline to turn one fridge scan into practical, personalized meal plans.

- detects inventory with confidence and freshness signals
- lets users confirm or edit detections before planning
- prioritizes soon-to-expire ingredients
- generates recipe variants for different household members
- keeps humans in control with approval checkpoints

## How It Works

1. Scan a fridge or pantry photo  
2. Confirm detected inventory  
3. Run multi-agent reasoning across ingredients, nutrition, and constraints  
4. Review recipe options and approve or regenerate  
5. Export missing items to a grocery gap list with **Instacart checkout**

## Features

- Fridge vision scan with confidence and freshness estimates
- Multi-agent pipeline: Food Analyzer → Inventory Sync → Nutritionist → Image Generation
- Personalized recipe variants for multi-generational households
- Human-in-the-loop checkpoints between agent phases
- Expiry-first planning to reduce food waste

## Team

**Red Huskies (Cornell × Northeastern)**
- Maria S.
- Alexis Y.
- Keivalya P.
- Sanath U.
- Kalyan M.

## Why It Stands Out

- **UI/UX:** simple, guided flow from scan to meal decision  
- **Engineering:** structured multi-agent orchestration with checkpoints  
- **Grounding:** confidence-based detection with user verification  
- **Innovation:** one scan, multiple household-specific meal variants  
- **Impact:** reduces waste while connecting directly to grocery fulfillment
