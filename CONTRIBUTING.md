# Contributing

This project accepts contributions that improve the accuracy, structure, and documentation of China's film exhibition space archive.

## What You Can Contribute

- Add or correct museum and exhibition space records.
- Add verified references.
- Add field photo metadata.
- Improve category definitions.
- Improve documentation or validation scripts.

## Data Rules

- Do not invent coordinates, opening years, curators, publications, publishers, or authors.
- If coordinates are unverified, use `null` and set `geo.coordinate_source` to `pending_verification`.
- Use semantic IDs instead of numeric auto-increment IDs.
- Every photo must include `rights.photographer_copyright`, `rights.institutional_restriction`, and `rights.personality_rights`.
- Default photo visibility should be `public_thumbnail_only`.
- `museum_id`, `exhibition_id`, and `references` must point to existing records.

## File Locations

- Museums: `data/museums.json`
- Exhibitions and routes: `data/exhibitions.json`
- Photos: `data/photos.json`
- Categories: `data/categories.json`
- References: `data/references.csl.json`
- Documentation: `docs/`

## Validation

Before submitting changes, run:

```bash
npm run validate:data
npm run lint
```

For production readiness, also run:

```bash
npm run build
```

## Not Accepted

- Unsourced claims presented as verified facts.
- High-resolution museum interior photos without clear rights status.
- Facial images without personality rights review.
- Scraped or copied text without attribution.
- Data that breaks existing ID references.
