# MITTI: Voice-Based Natural Farming Consultant

MITTI (Soil) is a clean, static web-based digital consultant optimized for mobile devices and smart boards. It provides voice-driven, context-aware advice to assist farmers in transitioning from chemical inputs to biological, multi-level cropping systems.

## Core Features

1. **Disease Identification & Treatment**: Camera scan simulation that diagnoses crop leaf threats and prescribes organic remedies (fermented copper buttermilk, garlic sprays, neem extract).
2. **Seed & Financial Guidance**: NPK soil simulations recommending primary crops, companion seeding, and government subsidies (PKVY, PM-Kisan).
3. **Weather & Market Intelligence**: Region-specific weather forecasts and organic crop market rates.
4. **Natural Farming Education**: Interactive 5-layer cropping stack detailing Canopy, Understory, Shrub, Ground Cover, and Rhizosphere systems.
5. **Local Voice Pipeline**: Integrated floating microphone button triggering browser-native speech recognition and synthesis for zero-config, localized voice queries.

## Technology Stack

- **Core & Logic**: HTML5, CSS3, Vanilla Javascript.
- **Styling**: Premium Earthy Dark-Theme (Radial Gradients, Amber Accents, Glassmorphism Cards).
- **Voice Engine**: Browser-native Web Speech API.
- **Hosting**: Pre-configured for deployment on Vercel.

## Vercel Deployment

Deploying to Vercel is fully automated. Vercel reads the root configuration:
- `vercel.json` maps clean URLs, allowing navigation to `/crop_recommend` instead of `/crop_recommend.html`.

To deploy:
1. Push this directory to your GitHub repository.
2. Link your repository in Vercel.
3. Deploy with default static configuration.
