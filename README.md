# 影迹图谱 FilmGeo Atlas: A Digital Map of China's Film Exhibition Spaces

影迹图谱 (FilmGeo Atlas) is a lightweight digital humanities project about film exhibition spaces in China. It combines fieldwork, GIS mapping, exhibition documentation, photo metadata, and rights-aware data governance to build an online exhibition and open research archive.

The project focuses on how film museums, studio heritage sites, image archives, private technology collections, and film-themed public spaces preserve, organize, and reinterpret film technology, local image memory, and Chinese film history.

## Project Scope

- Digital humanities database for museums, exhibitions, field photos, categories, and references.
- Online exhibition platform with a map, photo archive, curated routes, and project method pages.
- Media geography research tool for studying regional distribution and cultural clustering.
- Film industrial heritage archive for cameras, projectors, film stock, processing, sound, animation, ephemera, and immersive exhibition techniques.
- Open knowledge project with documented data models, licenses, contribution rules, and validation scripts.

## Data Structure

Core data is stored in `data/` and should not be hard-coded into components.

```text
data/
├── museums.json
├── exhibitions.json
├── photos.json
├── categories.json
├── references.csl.json
└── schema/
    ├── museums.schema.json
    ├── exhibitions.schema.json
    └── photos.schema.json
```

The main relationship is:

```text
Museum → Exhibition → Photo → Reference
```

See `docs/data-model.md` for field definitions and update rules.

## Photo Rights

Field photos are rights-aware research records, not generic public images. Each photo in `data/photos.json` includes:

- `photographer_copyright`
- `institutional_restriction`
- `personality_rights`
- `visibility`

The default visibility is `public_thumbnail_only`. High-resolution originals are not published by default.

See `docs/rights-and-licenses.md` and `LICENSE-MEDIA`.

## Local Development

```bash
npm install
npm run dev -- -p 3004
```

Open:

```text
http://localhost:3004
```

## Validation

Run the data validator before publishing data changes:

```bash
npm run validate:data
```

Run code checks:

```bash
npm run lint
npm run build
```

## Environment Variables

Supabase Auth and DeepSeek API credentials are configured through environment variables. API keys must not be committed or rendered in the frontend.

## Licenses

- `LICENSE-CODE`: website code
- `LICENSE-DATA`: structured data and original text
- `LICENSE-MEDIA`: field photos and media records, controlled record-by-record through `data/photos.json`

## Citation

When using the structured dataset or research text, cite this project as:

影迹图谱 FilmGeo Atlas: A Digital Map of China's Film Exhibition Spaces.
