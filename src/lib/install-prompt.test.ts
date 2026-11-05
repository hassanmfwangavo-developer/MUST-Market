import { afterEach, describe, expect, it, vi } from "vitest";
import { installPromptBootstrap, takeInstallPrompt } from "./install-prompt";

afterEach(() => vi.unstubAllGlobals());

function setup() {
  const browser = new EventTarget();
  vi.stubGlobal("window", browser);
  new Function(installPromptBootstrap)();
  return browser;
}

describe("installation requires a button press", () => {
  it("captures an early Chrome event without opening its popup", () => {
    const browser = setup();
    const prompt = vi.fn();
    const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), { prompt });
    browser.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    expect(takeInstallPrompt()).toBe(event);
    expect(takeInstallPrompt()).toBeNull();
  });

  it("clears the captured prompt when the app is installed", () => {
    const browser = setup();
    browser.dispatchEvent(new Event("beforeinstallprompt"));
    browser.dispatchEvent(new Event("appinstalled"));
    expect(takeInstallPrompt()).toBeNull();
    expect(window.mustMarketInstall?.installed).toBe(true);
  });
});
