// Asset base URL and a visible banner for any asset that fails to load.
export const ASSET_BASE_URL = "assets";

export const asset = (path) => `${ASSET_BASE_URL}/${path}`;

const reported = new Set();
export function reportAssetError(url) {
  if (reported.has(url)) return;
  reported.add(url);
  let box = document.getElementById("asset-errors");
  if (!box) {
    box = document.createElement("div");
    box.id = "asset-errors";
    document.body.append(box);
  }
  const line = document.createElement("div");
  line.textContent = `Asset failed to load: ${url}`;
  box.append(line);
  console.error(`[asset] failed: ${url}`);
}

/** Load an image as an HTMLImageElement, reporting it if it never arrives. */
export function loadImage(path) {
  const url = asset(path);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => { reportAssetError(url); reject(new Error(url)); };
    img.src = url;
  });
}

/** Watch an <img> already in the markup. */
export function watchImg(img) {
  if (!img) return;
  const fail = () => reportAssetError(img.getAttribute("src"));
  if (img.complete && !img.naturalWidth) fail();
  img.addEventListener("error", fail);
}
