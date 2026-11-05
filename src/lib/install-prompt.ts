export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

declare global {
  interface Window {
    mustMarketInstall?: { prompt: InstallPromptEvent | null; installed: boolean };
  }
}

// Captures Chrome's event in the document head, before React hydrates.
export const installPromptBootstrap = `(function(){
  if(window.mustMarketInstall)return;
  var state=window.mustMarketInstall={prompt:null,installed:false};
  window.addEventListener('beforeinstallprompt',function(event){
    event.preventDefault();
    state.prompt=event;
  });
  window.addEventListener('appinstalled',function(){
    state.prompt=null;
    state.installed=true;
  });
})();`;

export function takeInstallPrompt(): InstallPromptEvent | null {
  const state = window.mustMarketInstall;
  if (!state) return null;
  const prompt = state.prompt;
  state.prompt = null;
  return prompt;
}
