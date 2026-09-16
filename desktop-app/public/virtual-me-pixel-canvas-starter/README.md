# Virtual Me — Pixel Character

This version deliberately does **not** use a PNG character asset.

The character is represented as a small pixel grid and rendered directly
to an HTML Canvas. Electron handles the window/edge movement separately.

## States
- idle
- walk
- talk
- happy
- tired
- sleep

## Integration

```ts
import { drawVirtualMe } from "./virtual-me";

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

drawVirtualMe(ctx, "idle", 0, 20, 20, 6);
```

Recommended architecture:

pixel frame → Canvas renderer → Electron transparent window → edge animation

Do not regenerate or replace the character identity unless explicitly requested.
