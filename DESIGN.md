# Notebook profile

The profile header shares the personal website prototype’s Notebook theme:
cool paper and slate, restrained blue, system sans-serif text, monospaced
labels, thin dividers, and a narrow desktop rail.

The README selects one of four self-contained SVGs in `assets/` for light/dark
appearance and desktop/phone layouts. The particle cloud converges into a
three-dimensional curved surface within four seconds. The surface uses an
orthographic projection, a wireframe mesh, and subtle shading to convey depth. Reduced-motion preferences show the finished
figure immediately. No remote fonts, services, workflows, or runtime scripts
are required. The original GIF is retained but is no longer loaded.

## Edit the artwork

Edit `scripts/build-banner.mjs`, then regenerate the committed SVG files:

```sh
node scripts/build-banner.mjs
```

The generator has no package dependencies. GitHub only needs the README and
four SVGs to display the profile; no build is required when viewing it.

## Verification

The artwork was checked in a browser in light/dark appearance at desktop and
phone sizes, including reduced motion. The complete README was checked at
390px and 1100px without horizontal overflow.
