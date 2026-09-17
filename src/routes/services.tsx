import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
  Sparkles,
  Star,
  Store,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { canonical } from "@/lib/site";
import phoneRepairImage from "@/assets/service-phone-repair.jpg";
import laundryImage from "@/assets/service-laundry.jpg";
import printingImage from "@/assets/service-printing.jpg";
import beautyImage from "@/assets/service-beauty.jpg";

const SUPPORT_NUMBER = "255674044676";

const CATEGORIES = [
  { id: "all", label: "All Services", icon: "✦" },
  { id: "electronics", label: "Phone & Electronics", icon: "📱" },
  { id: "laundry", label: "Laundry & Pasi", icon: "🧺" },
  { id: "cleaning", label: "Usafi wa Gheto", icon: "🧹" },
  { id: "printing", label: "Printing & Stationery", icon: "🖨️" },
  { id: "beauty", label: "Beauty & Salon", icon: "✂️" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];
type ServiceCategory = Exclude<CategoryId, "all">;

type ServiceItem = { name: string; price: string };
type Provider = {
  id: string;
  category: ServiceCategory;
  name: string;
  location: string;
  phone: string;
  rating: string;
  reviews: number;
  image: string;
  bio: string;
  hours: string;
  topServices: ServiceItem[];
  pricing: ServiceItem[];
  gallery: string[];
};

const PROVIDERS: Provider[] = [
  {
    id: "sam-tech",
    category: "electronics",
    name: "Fundi Sam Tech",
    location: "Block B / Iyunga Gate",
    phone: "255674044676",
    rating: "4.9",
    reviews: 24,
    image: phoneRepairImage,
    bio: "Fast, careful phone and laptop repairs for MUST students, with a clear diagnosis before any work begins.",
    hours: "Mon–Sat · 8:00 AM–8:00 PM",
    topServices: [
      { name: "Phone diagnosis", price: "From TZS 5,000" },
      { name: "Screen replacement", price: "From TZS 35,000" },
      { name: "Laptop software repair", price: "From TZS 15,000" },
    ],
    pricing: [
      { name: "Charging port repair", price: "TZS 20,000+" },
      { name: "Battery replacement", price: "TZS 25,000+" },
      { name: "Windows installation", price: "TZS 15,000" },
      { name: "Laptop cleaning", price: "TZS 12,000" },
    ],
    gallery: [phoneRepairImage, printingImage, phoneRepairImage],
  },
  {
    id: "fresh-fold",
    category: "laundry",
    name: "FreshFold Campus Laundry",
    location: "Iyunga / Hostel pickup",
    phone: "255674044676",
    rating: "4.8",
    reviews: 31,
    image: laundryImage,
    bio: "Reliable wash, dry and ironing with convenient pickup around campus and nearby student ghettos.",
    hours: "Daily · 7:30 AM–7:00 PM",
    topServices: [
      { name: "Wash & fold", price: "From TZS 8,000" },
      { name: "Shirt & trouser pasi", price: "From TZS 1,500" },
      { name: "Bedding bundle", price: "From TZS 10,000" },
    ],
    pricing: [
      { name: "Small laundry basket", price: "TZS 8,000" },
      { name: "Large laundry basket", price: "TZS 15,000" },
      { name: "Duvet wash", price: "TZS 10,000+" },
      { name: "Campus pickup & return", price: "TZS 2,000" },
    ],
    gallery: [laundryImage, laundryImage, beautyImage],
  },
  {
    id: "sparkle-gheto",
    category: "cleaning",
    name: "Sparkle Gheto Cleaning",
    location: "Coca / Inyara / Iyunga",
    phone: "255674044676",
    rating: "4.7",
    reviews: 18,
    image: laundryImage,
    bio: "Student-friendly room cleaning for move-ins, busy weeks and fresh starts, with cleaning supplies included.",
    hours: "Mon–Sun · 8:00 AM–6:00 PM",
    topServices: [
      { name: "Single room refresh", price: "From TZS 10,000" },
      { name: "Deep room clean", price: "From TZS 20,000" },
      { name: "Move-in cleaning", price: "From TZS 25,000" },
    ],
    pricing: [
      { name: "Floor, surfaces & windows", price: "TZS 10,000" },
      { name: "Deep room cleaning", price: "TZS 20,000" },
      { name: "Kitchen area add-on", price: "TZS 6,000" },
      { name: "Shared room package", price: "TZS 28,000+" },
    ],
    gallery: [laundryImage, printingImage, laundryImage],
  },
  {
    id: "must-print",
    category: "printing",
    name: "MUST Print Hub",
    location: "Main Gate / Academic Blocks",
    phone: "255674044676",
    rating: "4.9",
    reviews: 46,
    image: printingImage,
    bio: "Quick academic printing, binding and stationery for assignments, reports and final-year projects.",
    hours: "Mon–Sat · 7:00 AM–9:00 PM",
    topServices: [
      { name: "B&W printing", price: "From TZS 100/page" },
      { name: "Spiral binding", price: "From TZS 2,500" },
      { name: "Project formatting", price: "From TZS 8,000" },
    ],
    pricing: [
      { name: "Colour printing", price: "TZS 500/page" },
      { name: "Photocopy", price: "TZS 100/page" },
      { name: "Spiral binding", price: "TZS 2,500+" },
      { name: "Report formatting", price: "TZS 8,000+" },
    ],
    gallery: [printingImage, printingImage, phoneRepairImage],
  },
  {
    id: "sharp-cut",
    category: "beauty",
    name: "Sharp Cut Campus Salon",
    location: "Iyunga Gate",
    phone: "255674044676",
    rating: "4.8",
    reviews: 37,
    image: beautyImage,
    bio: "Clean cuts and student-ready grooming in a relaxed studio a few minutes from the MUST gate.",
    hours: "Daily · 9:00 AM–9:00 PM",
    topServices: [
      { name: "Classic haircut", price: "From TZS 3,000" },
      { name: "Haircut & beard", price: "From TZS 5,000" },
      { name: "Line-up", price: "From TZS 2,000" },
    ],
    pricing: [
      { name: "Student haircut", price: "TZS 3,000" },
      { name: "Fade haircut", price: "TZS 5,000" },
      { name: "Haircut & beard", price: "TZS 6,000" },
      { name: "Home service", price: "TZS 10,000+" },
    ],
    gallery: [beautyImage, beautyImage, phoneRepairImage],
  },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Campus Services at MUST | MUST Service Mall" },
      {
        name: "description",
        content: "Find verified technicians, laundry, cleaning, printing and salon services near MUST campus in Mbeya.",
      },
      { property: "og:title", content: "MUST Service Mall — Trusted Campus Services" },
      {
        property: "og:description",
        content: "Browse trusted campus technicians and service providers, compare prices and contact them directly.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/services") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical("/services") }],
  }),
  component: ServicesPage,
});

function whatsappLink(provider: Provider) {
  const message = `Habari ${provider.name}! Nimekuona kwenye MUST Service Mall. Naomba maelezo zaidi kuhusu huduma zako.`;
  return `https://wa.me/${provider.phone}?text=${encodeURIComponent(message)}`;
}

function ServicesPage() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);

  const visibleProviders = useMemo(
    () => PROVIDERS.filter((provider) => category === "all" || provider.category === category),
    [category],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="hero-gradient border-b border-border">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                <BadgeCheck className="h-4 w-4" />
                Trusted services around MUST
              </div>
              <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
                MUST Service Mall <span aria-hidden="true">🛠️</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Pata mafundi waaminifu, usafi wa gheto, laundry, na huduma za stationery kampasi kwako.
              </p>
            </div>

            <div className="scrollbar-none -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter service providers">
              {CATEGORIES.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={category === item.id ? "default" : "outline"}
                  aria-pressed={category === item.id}
                  onClick={() => setCategory(item.id)}
                  className="h-10 shrink-0 rounded-full px-4 shadow-soft"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Campus-ready professionals</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Services you can trust</h2>
            </div>
            <p className="hidden text-sm text-muted-foreground sm:block">{visibleProviders.length} providers</p>
          </div>

          {visibleProviders.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleProviders.map((provider) => (
                <article key={provider.id} className="card-hover flex overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="flex w-full flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={provider.image}
                        alt={`${provider.name} at work`}
                        width={1200}
                        height={800}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-bold text-primary shadow-soft backdrop-blur">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        MUST Verified Provider
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{provider.name}</h3>
                          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {provider.location}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-lg bg-accent-soft px-2.5 py-1.5 text-xs font-bold text-accent-foreground">
                          <span aria-hidden="true">⭐</span> {provider.rating}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{provider.reviews} verified reviews</p>

                      <div className="my-4 h-px bg-border" />
                      <ul className="space-y-3">
                        {provider.topServices.map((service) => (
                          <li key={service.name} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-foreground">{service.name}</span>
                            <span className="shrink-0 font-semibold text-primary">{service.price}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-5">
                        <Button type="button" onClick={() => setSelectedProvider(provider)} className="h-11 rounded-xl">
                          <Search className="h-4 w-4" />
                          View Full Profile
                        </Button>
                        <Button asChild variant="outline" size="icon" className="h-11 w-11 rounded-xl border-primary/20 text-primary" title="WhatsApp provider">
                          <a href={whatsappLink(provider)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${provider.name}`}>
                            <MessageCircle className="h-5 w-5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
              <Wrench className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 font-semibold text-foreground">Providers are joining soon</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try another service category for now.</p>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary p-6 shadow-lift sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" /> Grow with MUST Market
                </div>
                <h2 className="mt-4 text-2xl font-bold text-primary-foreground sm:text-3xl">Unatoa Huduma Kampasi au Ni Fundi?</h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/80">Fikia wanafunzi wengi zaidi na ujenge jina la biashara yako ndani ya jamii ya MUST.</p>
              </div>
              <Button type="button" onClick={() => setJoinOpen(true)} className="h-12 shrink-0 rounded-xl bg-accent px-6 font-bold text-accent-foreground shadow-amber hover:bg-accent/90">
                Orodhesha Biashara Yako 🚀
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <ProviderDialog provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
      <ProviderSignupDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}

function ProviderDialog({ provider, onClose }: { provider: Provider | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(provider)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl border-border bg-card p-0 shadow-lift">
        {provider && (
          <>
            <div className="relative aspect-[16/7] overflow-hidden rounded-t-2xl bg-muted">
              <img src={provider.image} alt={`${provider.name} portfolio cover`} width={1200} height={800} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-primary-foreground">
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold">
                  <BadgeCheck className="h-3.5 w-3.5" /> MUST Verified
                </div>
                <DialogTitle className="text-2xl font-bold">{provider.name}</DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-1.5 text-primary-foreground/85">
                  <MapPin className="h-3.5 w-3.5" /> {provider.location}
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-7 p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <p className="text-sm leading-6 text-muted-foreground">{provider.bio}</p>
                <div className="flex h-fit items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-foreground">
                  <Star className="h-4 w-4 fill-current" /> {provider.rating} · {provider.reviews} reviews
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-4">
                <Clock3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Operating hours</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{provider.hours}</p>
                </div>
              </div>

              <section>
                <h3 className="text-lg font-bold text-foreground">Service menu</h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                  {provider.pricing.map((service, index) => (
                    <div key={service.name} className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${index > 0 ? "border-t border-border" : ""}`}>
                      <span className="text-foreground">{service.name}</span>
                      <span className="font-bold text-primary">{service.price}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground">Portfolio</h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {provider.gallery.map((image, index) => (
                    <img key={`${provider.id}-${index}`} src={image} alt={`${provider.name} work sample ${index + 1}`} width={1200} height={800} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                  ))}
                </div>
              </section>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline" className="h-12 rounded-xl">
                  <a href={`tel:+${provider.phone}`}><Phone className="h-4 w-4" /> Call Now</a>
                </Button>
                <Button asChild className="h-12 rounded-xl">
                  <a href={whatsappLink(provider)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> Message on WhatsApp</a>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProviderSignupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !business.trim() || !service.trim() || !phone.trim()) {
      toast.error("Tafadhali jaza jina, biashara, huduma na namba ya simu.");
      return;
    }
    const message = [
      "Habari MUST Market! Naomba kuorodhesha biashara yangu kwenye MUST Service Mall:",
      `👤 Jina: ${name.trim()}`,
      `🏪 Biashara: ${business.trim()}`,
      `🛠️ Huduma: ${service.trim()}`,
      `📍 Eneo: ${location.trim() || "-"}`,
      `📞 Simu: ${phone.trim()}`,
      `📝 Maelezo: ${notes.trim() || "-"}`,
    ].join("\n");
    window.open(`https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    toast.success("Asante! WhatsApp yako inafunguka sasa...");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-2xl border-border bg-card shadow-lift">
        <DialogHeader className="pr-8 text-left">
          <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Store className="h-5 w-5" /></div>
          <DialogTitle className="text-xl text-foreground">Orodhesha Biashara Yako</DialogTitle>
          <DialogDescription>Tuma taarifa zako kwa WhatsApp. Timu yetu itakupigia kwa hatua inayofuata.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jina Kamili" required><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jina lako" className="h-11 rounded-xl bg-surface-2" /></Field>
            <Field label="Namba ya Simu" required><Input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="07..." className="h-11 rounded-xl bg-surface-2" /></Field>
          </div>
          <Field label="Jina la Biashara" required><Input value={business} onChange={(event) => setBusiness(event.target.value)} placeholder="Mfano: Sam Tech" className="h-11 rounded-xl bg-surface-2" /></Field>
          <Field label="Huduma Unayotoa" required><Input value={service} onChange={(event) => setService(event.target.value)} placeholder="Mfano: Phone repair, laundry" className="h-11 rounded-xl bg-surface-2" /></Field>
          <Field label="Eneo"><Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Mfano: Iyunga Gate" className="h-11 rounded-xl bg-surface-2" /></Field>
          <Field label="Maelezo ya Ziada"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Bei, muda wa kazi au taarifa nyingine..." className="rounded-xl bg-surface-2" /></Field>
          <Button type="submit" className="h-12 w-full rounded-xl font-bold"><Send className="h-4 w-4" /> Tuma kwa WhatsApp</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}{required ? " *" : ""}</span>
      {children}
    </label>
  );
}