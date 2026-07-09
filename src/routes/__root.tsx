import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  // Hapa ndipo tunaambia Google habari za MUST Market
  meta: () => [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "MUST Market |  Soko rasmi la Chuo Kikuu cha MUST " },
    { name: "description", content: "Jukwaa rasmi la wanafunzi wa Mbeya University of Science and Technology (MUST) kununua na kuuza vifaa vya masomo, simu, laptop, na malazi campus bila madalali." },
    { name: "keywords", content: "must market, must store, vitu  used must, mbeya university, must, wanafunzi wa must, duka la chuo" },
    { name: "author", content: "Hassani Mfwangavo" },
    
    // Facebook / WhatsApp Link Preview (Mtu akituma link WhatsApp ionekane vizuri)
    { property: "og:type", content: "website" },
    { property: "og:title", content: "MUST Market | Soko la Wanafunzi Chuo Kikuu cha MUST" },
    { property: "og:description", content: "Nunu na uze vifaa vya chuo kwa urahisi na usalama. Imetengenezwa na wanafunzi, kwa ajili ya wanafunzi." },
    { property: "og:image", content: "https://i.ibb.co/YF6Bm1t8/IMG-20251111-WA0067-1.jpg" },
  ],
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
