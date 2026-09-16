// Virtual Me — procedural pixel character
// No PNG/SVG character asset is used. Render the pixel grid directly to Canvas.

export const PIXEL_SIZE = 6;

export const PALETTE = {'H': '#2a211c', 'S': '#f0c7a4', 'G': '#111111', 'K': '#343434', 'B': '#2b211d', 'W': '#f0c7a4', 'Y': '#c8a34a', 'R': '#8c7332'} as const;

export type PixelColor = keyof typeof PALETTE | "0";
export type PixelFrame = string[];

export const IDLE: PixelFrame = ['0000000000000HHHHHHHHH000000000', '00000000000HHHHHHHHHHHH00000000', '0000000000HHHHHHHHHHHHHH0000000', '000000000HHHHHHHHHHHHHHHH000000', '00000000HHHHHHHHHHHHHHHHH000000', '0000000HHHHHHHHHHHHHHHHHHH00000', '0000000HHHHHHHHHHHHHHHHHHHH0000', '000000HHHHHHHHHHHHHHHHHHHHH0000', '000000HHHSSSSSSSSSSSSSSSHHH0000', '00000HHHSSGGGGGGGGGGGGGGSSH00000', '00000HHHSGGKKKKKKKKKKKKGGSH00000', '0000HHHSSGGKKKKKKKKKKKKGGSSHH000', '0000HHHSSGGKKKKKKKKKKKKGGSSHH000', '0000HHHSSGGKKKKKKKKKKKKGGSSHH000', '0000HHHSSGGKKKKKKKKKKKKGGSSHH000', '0000HHHSSGGGGGGGGGGGGGGGGSSHH000', '00000HHHSSGGGGGGGGGGGGGGSSH00000', '00000HHHSSSSSSSSSSSSSSSSSSHH0000', '000000HHHSSSSSSSSSSSSSSSSHHH0000', '0000000HHHSSSSSSSSSSSSSSSHHH0000', '0000000HHHHHHHHBBBBBBBBHHHHH0000', '0000000HHHHHHBBBBBBBBBBHHHHH0000', '0000000HHHHHBBBBWWWWBBBBHHHHH0000', '0000000HHHHBBBBWWWWWWBBBBHHHH000', '0000000HHHHBBBBWWWWWWBBBBHHHH000', '00000000HHHBBBBBBBBBBBBBBHHH0000', '00000000HHHHHBBBBBBBBBBHHHHH0000', '00000000HHHHHHHHHHHHHHHHHHHH000', '0000000YYYYYYYYYYYYYYYYYYYYYY000', '000000YYYYYYYYYRRYYYYYYYYYYY0000', '00000YYYYYYYYYYYYYYYYYYYYYYYY000', '0000YYYYYYYYRRYYYYYYYYRRYYYYYY00', '0000YYYYYYYYYYYYYYYYYYYYYYYYYY00', '000YYYYYYYRRYYYYYYYYRRYYYYYYYY0', '000YYYYYYYYYYYYYYYYYYYYYYYYYYY0', '000YYYYYYYYRRYYYYYYYYRRYYYYYYY0', '0000YYYYYYYYYYYYYYYYYYYYYYYYY00', '00000YYYYYYYYYYYYYYYYYYYYYYY000', '000000YYYYYYYYYYYYYYYYYYYYY0000', '0000000YYYYYYYYYYYYYYYYYYY00000'];

function clone(frame: PixelFrame): PixelFrame {
  return frame.map(row => row);
}

function shift(frame: PixelFrame, dx: number, dy: number): PixelFrame {
  const h = frame.length;
  const w = frame[0].length;
  const out = Array.from({ length: h }, () => "0".repeat(w));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        out[ny] = out[ny].substring(0, nx) + frame[y][x] + out[ny].substring(nx + 1);
      }
    }
  }
  return out;
}

// Keep V1 animation intentionally small. Movement is handled by Electron/CSS,
// while these frames only change the character's pose.
export const FRAMES = {
  idle: [IDLE, shift(IDLE, 0, 1), IDLE, shift(IDLE, 0, 1)],
  walk: [shift(IDLE, -1, 0), IDLE, shift(IDLE, 1, 0), IDLE],
  talk: [IDLE, shift(IDLE, 0, 1), IDLE, shift(IDLE, 0, 1)],
  happy: [IDLE, shift(IDLE, 0, -1), IDLE, shift(IDLE, 0, -1)],
  tired: [shift(IDLE, 0, 1), shift(IDLE, 1, 1), shift(IDLE, 0, 1), shift(IDLE, -1, 1)],
  sleep: [shift(IDLE, 0, 2), shift(IDLE, 0, 2), shift(IDLE, 0, 1), shift(IDLE, 0, 2)],
} as const;

export type VirtualMeState = keyof typeof FRAMES;

export function drawPixelFrame(
  ctx: CanvasRenderingContext2D,
  frame: PixelFrame,
  x: number,
  y: number,
  scale = PIXEL_SIZE,
) {
  for (let row = 0; row < frame.length; row++) {
    for (let col = 0; col < frame[row].length; col++) {
      const key = frame[row][col] as PixelColor;
      if (key === "0") continue;
      ctx.fillStyle = PALETTE[key];
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

export function drawVirtualMe(
  ctx: CanvasRenderingContext2D,
  state: VirtualMeState,
  frameIndex: number,
  x: number,
  y: number,
  scale = PIXEL_SIZE,
) {
  const frames = FRAMES[state];
  drawPixelFrame(ctx, frames[frameIndex % frames.length], x, y, scale);
}
