import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  LegalDoc,
  LegalDomain,
  LegalEmail,
  LegalList,
  LegalTable,
  type LegalSection,
} from "@/components/legal-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MUST Market" },
      {
        name: "description",
        content:
          "How MUST Market collects, uses, shares, retains and protects personal data across the student marketplace and Msosi Fasta food ordering.",
      },
      { property: "og:title", content: "Privacy Policy — MUST Market" },
      {
        property: "og:description",
        content:
          "How MUST Market collects, uses, shares, retains and protects personal data across the student marketplace and Msosi Fasta food ordering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://mustmarket.store/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://mustmarket.store/privacy" }],
  }),
  component: PrivacyPage,
});

const sections: LegalSection[] = [
  {
    id: "who-this-policy-applies-to",
    title: "Who this Policy applies to",
    body: (
      <>
        <p>
          The Services are intended for people aged 18 or older. We do not knowingly invite or
          intentionally collect personal data from children under 18. If you believe a person under 18
          has submitted personal data to us, contact us at <LegalEmail /> so that we can investigate
          and take appropriate action.
        </p>
        <p>
          The Services are designed primarily for students connected with Mbeya University of Science
          and Technology (“MUST”), but approved businesses, restaurants, food vendors, delivery
          providers, and other service providers may use relevant vendor features. This Policy
          applies to customers, buyers, sellers, vendors, restaurants, delivery participants,
          visitors, and account holders.
        </p>
      </>
    ),
  },
  {
    id: "data-controller-and-service-providers",
    title: "Data controller and service providers",
    body: (
      <>
        <p>
          MUST Market determines the purposes and means of processing personal data for the Services
          and may act as a data controller or equivalent responsible entity under applicable Tanzanian
          data-protection law. We may also use service providers as processors or service providers to
          host, secure, authenticate, communicate, store, analyze, and operate the Services.
        </p>
        <p>
          We will not appoint a formal Data Protection Officer or claim regulatory registration in
          this Policy unless that appointment or registration has actually been completed. We will
          update this Policy if our legal structure, registration status, or responsible privacy
          contact changes.
        </p>
      </>
    ),
  },
  {
    id: "personal-data-we-collect",
    title: "Personal data we collect",
    body: (
      <>
        <LegalTable
          caption="Categories of personal data collected by MUST Market"
          head={["Category", "What it may include"]}
          rows={[
            [
              "Identity and account data",
              "Name, email address, profile image, university identity information, login provider information, and account identifiers.",
            ],
            [
              "Contact data",
              "Phone number, WhatsApp number, email address, and preferred contact details.",
            ],
            [
              "Campus and delivery data",
              "Hostel, room or delivery location, nearby landmark, pickup information, and campus-related location details that you provide.",
            ],
            [
              "Marketplace data",
              "Listings, product titles, descriptions, prices, category, condition, images, seller information, messages, reports, and transaction-related communications.",
            ],
            [
              "Food-order data",
              "Food items, restaurant or vendor selected, order details, delivery information, phone number, order status, complaints, and payment-related status.",
            ],
            [
              "Payment data",
              "Mobile-money provider, payment reference, transaction status, amount, currency, and limited payment metadata. We aim not to store mobile-money PINs or full financial authentication credentials.",
            ],
            [
              "Rewards and referral data",
              "Streak activity, reward points, referral link or code, inviter and referred-user relationship, qualifying order status, coupon or reward redemption, and eligibility records.",
            ],
            [
              "Communications",
              "Messages sent to us, customer-support requests, WhatsApp conversations where shared with us or our vendors, feedback, and reports.",
            ],
            [
              "Device and technical data",
              "IP address, browser type, device identifiers, operating system, language, approximate location inferred from technical data, timestamps, pages viewed, referring page, crash information, and security logs.",
            ],
            [
              "Cookies and similar technologies",
              "Session identifiers, authentication state, preferences, analytics information, and security-related identifiers.",
            ],
            [
              "User-generated media",
              "Photos and other files uploaded for listings, profile information, restaurant information, menus, or support.",
            ],
          ]}
        />
        <p>
          Please do not submit unnecessary sensitive information, passwords, mobile-money PINs,
          national identification numbers, medical information, or private information about another
          person through a listing, message, image, or support channel.
        </p>
      </>
    ),
  },
  {
    id: "how-we-collect-data",
    title: "How we collect data",
    body: (
      <>
        <p>
          We collect information directly when you create or use an account, browse or post a
          listing, order food, communicate with a seller or vendor, submit a support request, join a
          rewards or referral programme, subscribe to communications, or contact us.
        </p>
        <p>
          We may collect information automatically from your browser or device through server logs,
          cookies, analytics tools, and similar technologies. We may receive limited information from
          authentication providers such as Google or a university identity system when you choose to
          use those services. We may also receive order or delivery status from independent
          restaurants, food vendors, delivery providers, payment providers, and other service
          partners.
        </p>
      </>
    ),
  },
  {
    id: "why-we-use-personal-data",
    title: "Why we use personal data",
    body: (
      <>
        <p>We may use personal data to:</p>
        <LegalList
          ordered
          items={[
            "Create, authenticate, maintain, and secure accounts;",
            "Provide the marketplace, including publishing listings and helping buyers and sellers communicate;",
            "Facilitate Msosi Fasta menus, orders, vendor communication, payment status, and delivery coordination;",
            "Connect customers with independent restaurants, food vendors, sellers, and delivery participants;",
            "Process mobile-money payments through applicable payment providers and reconcile payment records;",
            "Provide customer support, respond to complaints, investigate reports, and resolve disputes;",
            "Operate, calculate, administer, and audit experimental or future day-streak, reward-point, referral, coupon, and promotional programmes;",
            "Detect fraud, abuse, manipulation, prohibited listings, account compromise, spam, and other security or policy violations;",
            "Improve usability, reliability, performance, safety, and features;",
            "Send service messages, order updates, security notices, and account notices;",
            "Send marketing or promotional communications where permitted and where you have not opted out;",
            "Comply with applicable laws, lawful requests, court orders, regulatory requirements, and tax or accounting obligations; and",
            "Establish, exercise, or defend legal claims and protect the rights, safety, and property of MUST Market, users, vendors, and the public.",
          ]}
        />
        <p>
          We will not use personal data for a materially incompatible purpose without providing an
          appropriate notice or obtaining consent where required.
        </p>
      </>
    ),
  },
  {
    id: "lawful-basis-and-consent",
    title: "Lawful basis and consent",
    body: (
      <>
        <p>
          Depending on the circumstances and applicable law, our lawful basis may include providing a
          service you requested, performing or taking steps toward an agreement, complying with a
          legal obligation, protecting safety and security, pursuing legitimate operational interests
          that do not override your rights, or obtaining your consent.
        </p>
        <p>
          You may withdraw consent where processing is based on consent. Withdrawal does not
          necessarily affect processing already carried out lawfully before withdrawal, and it may
          prevent us from providing a feature that requires the relevant data.
        </p>
      </>
    ),
  },
  {
    id: "sharing-and-disclosure",
    title: "Sharing and disclosure",
    body: (
      <>
        <LegalTable
          caption="Recipients of personal data and the reason for sharing"
          head={["Recipient", "Purpose"]}
          rows={[
            [
              "Sellers and buyers",
              "To enable marketplace communication, fulfilment, safe transactions, and reporting.",
            ],
            [
              "Independent restaurants and food vendors",
              "To prepare and fulfil Msosi Fasta orders, respond to customer issues, and coordinate delivery.",
            ],
            [
              "Delivery providers or riders",
              "To complete delivery and contact the customer where necessary. At present delivery may be handled by vendors; MUST Market may hire or coordinate riders in the future.",
            ],
            [
              "Payment providers",
              "To initiate, confirm, reconcile, investigate, or refund mobile-money transactions where supported.",
            ],
            [
              "Authentication providers",
              "To authenticate accounts when you select Google, university, or another login method.",
            ],
            [
              "Hosting, database, storage, analytics, communications, and security providers",
              "To operate the technical infrastructure and protect the Services.",
            ],
            [
              "Professional advisers and insurers",
              "To obtain legal, accounting, compliance, security, or insurance support subject to appropriate confidentiality.",
            ],
            [
              "Authorities and legal recipients",
              "Where required by law, legal process, public safety, fraud prevention, or protection of rights.",
            ],
            [
              "Business successors",
              "In connection with a merger, restructuring, financing, sale, or transfer of all or part of the Services, subject to appropriate safeguards.",
            ],
          ]}
        />
        <p>
          We do not sell personal data as a business model. We do not disclose personal data to
          unrelated third parties for their independent direct marketing unless you have been informed
          and have provided the required consent.
        </p>
      </>
    ),
  },
  {
    id: "marketplace-and-public-listings",
    title: "Marketplace and public listings",
    body: (
      <>
        <p>
          If you publish a marketplace listing, some information may be visible publicly or to other
          users, including the product title, description, price, category, condition, location area,
          listing image, seller display name, and listing date. Do not publish your private address,
          financial credentials, passwords, or another person’s personal data.
        </p>
        <p>
          A buyer or seller may contact you through WhatsApp or another communication channel. Once
          you communicate directly with another user, that person may process information
          independently of MUST Market. Review the privacy practices and security settings of those
          services and do not share information that you do not want the other participant to have.
        </p>
      </>
    ),
  },
  {
    id: "msosi-fasta-and-independent-vendors",
    title: "Msosi Fasta and independent vendors",
    body: (
      <>
        <p>
          Msosi Fasta listings and orders may be fulfilled by independent restaurants and food vendors
          rather than by MUST Market. We may share the customer’s name, phone number, food order,
          delivery location, payment status, and relevant instructions with the vendor or delivery
          participant to fulfil the order.
        </p>
        <p>
          Independent vendors may have their own legal and privacy responsibilities. We expect them to
          use customer data only for legitimate fulfilment, support, safety, and legal purposes and
          not for unrelated marketing without an appropriate lawful basis.
        </p>
      </>
    ),
  },
  {
    id: "mobile-money-payments",
    title: "Mobile-money payments",
    body: (
      <>
        <p>
          MUST Market currently supports mobile-money payments only and does not accept cash for
          applicable paid orders. Payment processing may involve third-party mobile-money or payment
          providers. We may receive payment status, transaction reference, amount, currency, and
          related metadata, but we do not intend to collect or store your mobile-money PIN.
        </p>
        <p>
          Payment providers may process information under their own terms and privacy notices. Payment
          disputes, reversals, failed payments, and refunds may require us to share relevant order and
          payment references with the provider and the vendor.
        </p>
      </>
    ),
  },
  {
    id: "rewards-streaks-referrals-and-promotions",
    title: "Rewards, streaks, referrals, and promotions",
    body: (
      <>
        <p>
          Day streaks, reward points, referrals, coupons, free-soda promotions, and similar features
          may currently be experimental and may become active or change in the future. We may collect
          activity and eligibility data needed to prevent abuse and determine whether a qualifying
          action occurred.
        </p>
        <p>
          Unless a specific promotion states otherwise, rewards are not cash, are not transferable,
          are not guaranteed, have no independent monetary value, and may expire or be cancelled if
          obtained through fraud, duplicate accounts, self-referrals, chargebacks, cancelled orders,
          prohibited conduct, or technical error. We may change or discontinue a programme
          prospectively, subject to applicable law and any specific terms published for a promotion.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-analytics",
    title: "Cookies and analytics",
    body: (
      <>
        <p>
          We may use essential cookies and similar technologies for authentication, security, session
          management, preferences, and core functionality. We may use analytics or performance tools
          to understand how the Services are used and improve them. Where required, we will request
          consent for non-essential cookies and provide appropriate controls.
        </p>
        <p>
          You can control cookies through your browser settings. Disabling essential cookies may
          prevent login, ordering, referral attribution, or other features from functioning.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Retention",
    body: (
      <>
        <p>
          We retain personal data only for as long as reasonably necessary for the purposes described
          in this Policy, including account operation, order and payment records, rewards and referral
          audit records, customer support, fraud prevention, legal claims, tax/accounting obligations,
          and dispute resolution.
        </p>
        <p>
          Retention periods depend on the type of data, the sensitivity and volume of the information,
          whether an account remains active, legal requirements, and legitimate operational needs.
          When data is no longer needed, we will delete, anonymize, or securely dispose of it, subject
          to lawful exceptions.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <>
        <p>
          We use reasonable technical and organizational safeguards appropriate to the nature of the
          data and the risks involved. These may include access controls, authentication, encryption
          in transit where supported, logging, backups, vendor controls, least-privilege access, and
          procedures for incident response.
        </p>
        <p>
          No internet service is completely secure. You are responsible for protecting your account
          credentials, device, mobile phone, and mobile-money authentication information. We will not
          ask you to disclose your mobile-money PIN or account password through an unsolicited
          message.
        </p>
        <p>
          If we become aware of a personal-data incident, we will investigate, take reasonable
          remedial steps, and make notifications where required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "international-transfers-and-third-party-services",
    title: "International transfers and third-party services",
    body: (
      <>
        <p>
          Some service providers, hosting systems, authentication providers, analytics providers,
          messaging platforms, or payment providers may process data outside Tanzania or in
          jurisdictions different from your own. Where applicable, we will use appropriate
          contractual, organizational, or legal safeguards and provide information required by
          applicable law.
        </p>
        <p>
          Third-party websites and services linked from MUST Market, including WhatsApp, Google,
          social media, mobile-money providers, restaurants, and delivery services, are governed by
          their own terms and privacy notices. We are not responsible for the independent practices of
          third parties.
        </p>
      </>
    ),
  },
  {
    id: "your-privacy-rights-and-requests",
    title: "Your privacy rights and requests",
    body: (
      <>
        <p>
          Subject to applicable Tanzanian law and lawful limitations, you may have rights to request
          information about processing, access a copy of personal data, correct inaccurate data,
          request deletion or restriction, object to certain processing, withdraw consent, request
          portability where applicable, and complain to the relevant supervisory authority.
        </p>
        <p>
          To make a request, email <LegalEmail /> with the subject “Privacy Request”. Explain the
          request, identify the account or information concerned, and provide reasonable information to
          help us verify your identity. We may request additional verification to protect against
          unauthorized disclosure.
        </p>
        <p>
          We aim to respond within the period required by applicable law. We may retain limited
          information where necessary for legal compliance, security, fraud prevention, payment
          reconciliation, dispute resolution, or establishment or defence of legal claims.
        </p>
        <p>
          You may also contact the Personal Data Protection Commission where you believe your rights
          have been infringed or a complaint has not been resolved. The relevant contact details
          should be confirmed from the Commission’s current official channels.
        </p>
      </>
    ),
  },
  {
    id: "marketing-choices",
    title: "Marketing choices",
    body: (
      <p>
        You may unsubscribe from non-essential marketing messages by using the unsubscribe option
        where provided or by contacting <LegalEmail />. Service, security, account, payment, and order
        communications may still be sent where necessary to provide the Services.
      </p>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to this Policy",
    body: (
      <p>
        We may update this Policy to reflect changes in the Services, law, vendors, rewards
        programmes, or data practices. We will publish the updated version on the website and revise
        the effective date. Where the law requires additional notice or consent for a material change,
        we will take the required steps.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <address className="not-italic">
        MUST Market
        <br />
        Iyunga, Mbeya, Tanzania
        <br />
        Email: <LegalEmail />
      </address>
    ),
  },
];

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <LegalDoc
        icon={<Lock className="h-8 w-8 text-primary" />}
        title="Privacy Policy"
        effectiveDate="12 September 2026"
        lastUpdated="12 September 2026"
        sections={sections}
        preamble={
          <>
            <p>
              MUST Market (“MUST Market,” “we,” “us,” or “our”) operates a student-focused digital
              marketplace and the Msosi Fasta campus food-ordering service. Our operating address is
              Iyunga, Mbeya, Tanzania. For privacy questions, requests, or complaints, contact{" "}
              <LegalEmail />.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, retain, and protect personal
              data when you use <LegalDomain />, our marketplace, Msosi Fasta, account features,
              reward and referral features, communications, and related services (together, the
              “Services”).
            </p>
            <p>
              By using the Services, you acknowledge that you have read this Policy. Where the law
              requires consent, we will ask for consent separately or rely on another lawful basis
              permitted by applicable law.
            </p>
          </>
        }
      />
      <Footer />
    </div>
  );
}
