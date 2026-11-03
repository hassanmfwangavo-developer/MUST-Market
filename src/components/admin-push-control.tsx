import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Loader2, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { enableBrowserPush } from "@/lib/browser-push";
import { managePushDevice } from "@/lib/push.functions";

export function AdminPushControl() {
  const manage = useServerFn(managePushDevice);
  const [token, setToken] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const stop = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => stop.current?.(), []);
  async function enable() {
    setBusy(true);
    try {
      const result = await enableBrowserPush();
      if (result.status !== "registered") {
        const copy = {
          "open-in-new-tab": "Fungua tovuti kwenye tab mpya au app iliyowekwa kwenye simu, kisha washa arifa.",
          "not-configured": "Sasisha muunganisho wa Firebase na uchague Include web push.",
          unsupported: "Browser hii haitumii arifa. Kwa iPhone, ongeza app kwenye Home Screen kisha uifungue hapo (iOS 16.4+).",
          denied: "Ruhusu Notifications kwenye mipangilio ya browser kwa tovuti hii, kisha jaribu tena.",
        };
        setMessage(copy[result.status]);
        return;
      }
      stop.current?.();
      stop.current = result.stop;
      await manage({ data: { action: "enable", token: result.token } });
      setToken(result.token);
      setMessage("Arifa zimewashwa kwenye simu hii.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Arifa hazijawashwa; jaribu tena."); }
    finally { setBusy(false); }
  }
  async function action(action: "test" | "disable") {
    if (!token) return;
    setBusy(true);
    try {
      await manage({ data: { action, token } });
      if (action === "disable") { setToken(undefined); stop.current?.(); }
      setMessage(action === "test" ? "Arifa ya majaribio imetumwa; angalia simu yako." : "Arifa zimezimwa kwenye simu hii.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Imeshindikana."); }
    finally { setBusy(false); }
  }
  return <section className="mb-5 border-b border-border pb-4">
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled={busy} onClick={enable} variant={token ? "outline" : "default"}>
        {busy ? <Loader2 className="animate-spin" /> : <Bell />} {token ? "Arifa zimewashwa" : "Washa arifa za oda"}
      </Button>
      {token && <><Button variant="outline" disabled={busy} onClick={() => action("test")}><Send /> Jaribu arifa</Button>
        <Button variant="ghost" disabled={busy} onClick={() => action("disable")}><BellOff /> Zima</Button></>}
    </div>
    {message && <p role="status" className="mt-2 text-sm text-muted-foreground">{message}</p>}
  </section>;
}