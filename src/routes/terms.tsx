import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  LegalDoc,
  LegalDomain,
  LegalEmail,
  LegalList,
  type LegalSection,
} from "@/components/legal-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — MUST Market" },
      {
        name: "description",
        content:
          "The rules for using MUST Market, the student marketplace and Msosi Fasta food ordering, including payments, refunds, halal policy and rewards.",
      },
      { property: "og:title", content: "Terms of Service — MUST Market" },
      {
        property: "og:description",
        content:
          "The rules for using MUST Market, the student marketplace and Msosi Fasta food ordering, including payments, refunds, halal policy and rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://www.mustmarket.store/terms" },
    ],
    links: [{ rel: "canonical", href: "https://www.mustmarket.store/terms" }],
  }),
  component: TermsPage,
});

const sections: LegalSection[] = [
  {
    id: "eligibility-and-user-categories",
    title: "Eligibility and user categories",
    body: (
      <>
        <p>
          You must be at least 18 years old to use the Services. The Services are intended primarily
          for students connected with Mbeya University of Science and Technology (“MUST”), but
          approved businesses, restaurants, cafeterias, food vendors, delivery providers, and other
          service providers may use relevant vendor features.
        </p>
        <p>
          You must provide accurate information, keep your account secure, and use the Services only
          for lawful and permitted purposes. You may not create an account for another person
          without authorization, impersonate another person or organization, or maintain multiple
          accounts to manipulate rewards, referrals, listings, or promotions.
        </p>
        <p>
          If you are a business, restaurant, food vendor, delivery provider, or other commercial
          user, you confirm that you have authority to represent the business and that you will
          comply with all licences, tax, food-safety, employment, consumer-protection, advertising,
          payment, and other requirements applicable to your activities.
        </p>
      </>
    ),
  },
  {
    id: "role-of-must-market",
    title: "Role of MUST Market",
    body: (
      <>
        <p>
          MUST Market provides a technology platform and community service. Unless a page or written
          agreement expressly states otherwise:
        </p>
        <LegalList
          items={[
            "The marketplace connects buyers and sellers;",
            "MUST Market is not the owner, seller, manufacturer, agent, or guarantor of marketplace products;",
            "Msosi Fasta connects customers with independent restaurants and food vendors;",
            "Independent restaurants or food vendors prepare the food and are responsible for their ingredients, preparation, packaging, quality, availability, legal compliance, and fulfilment;",
            "Delivery may be performed by the restaurant, vendor, their own delivery staff, or another delivery provider; and",
            "MUST Market does not currently guarantee that every vendor, seller, product, meal, image, review, location, price, or delivery estimate is accurate, safe, lawful, available, or suitable.",
          ]}
        />
        <p>
          MUST Market may introduce features in the future in which it collects payments directly,
          operates a bookstore or other direct-sale service, hires or coordinates riders, provides
          fulfilment, or enters into separate vendor arrangements. Those features may be governed by
          additional terms displayed at the time of use.
        </p>
      </>
    ),
  },
  {
    id: "accounts-and-authentication",
    title: "Accounts and authentication",
    body: (
      <>
        <p>
          Some features require an account. You may register using an email address, Google, a
          university identity provider, or another method made available by MUST Market. You are
          responsible for providing accurate information, maintaining access to your account, and
          notifying us promptly of suspected unauthorized access.
        </p>
        <p>
          You must not share your password, authentication code, mobile-money PIN, or account access
          with another person. MUST Market will not ask for your mobile-money PIN through an
          unsolicited message.
        </p>
        <p>
          We may suspend or terminate an account if information is false, the account is compromised,
          the user violates these Terms, the account is used for fraud or abuse, or suspension is
          necessary for safety, legal, security, or operational reasons.
        </p>
      </>
    ),
  },
  {
    id: "marketplace-use",
    title: "Marketplace use",
    body: (
      <>
        <p>
          MUST Market may allow users to list, discover, discuss, buy, sell, or arrange transactions
          involving permitted products and services. Sellers are responsible for the accuracy,
          legality, authenticity, safety, condition, ownership, price, availability, and fulfilment
          of their listings.
        </p>
        <p>
          A seller must have the legal right to sell the listed item, must accurately describe used
          or refurbished condition, must disclose material defects, and must not use copied images or
          descriptions in a misleading way. A buyer must inspect products where reasonably possible,
          ask appropriate questions, use safe public meeting places, and avoid sending money before
          receiving sufficient assurance of the transaction.
        </p>
        <p>
          Unless MUST Market expressly states otherwise, the purchase contract is between the buyer
          and seller. MUST Market is not responsible for the seller’s failure to deliver, the buyer’s
          failure to pay, product defects, counterfeit goods, injury, loss, damage, or disputes
          arising from a transaction, except to the extent liability cannot lawfully be excluded or is
          caused by MUST Market’s own proven wrongdoing.
        </p>
        <p>
          Users must report suspected fraud, theft, counterfeit products, unsafe products,
          harassment, or prohibited content through the available reporting or support channel.
        </p>
      </>
    ),
  },
  {
    id: "msosi-fasta-food-orders",
    title: "Msosi Fasta food orders",
    body: (
      <>
        <p>
          Msosi Fasta may display menus, prices, promotions, availability, restaurants, cafeterias,
          vendors, and delivery information. Menus, prices, estimated preparation times, and
          availability may change. An order request is not accepted until the vendor or the Services
          confirm it.
        </p>
        <p>
          Independent restaurants and food vendors are responsible for preparing and packaging food
          safely and legally, accurately describing ingredients and allergens to the extent required,
          honouring accepted orders, and responding to food-quality or preparation complaints.
          Customers must provide accurate contact and delivery information, remain reachable, and
          promptly report missing, incorrect, unsafe, or damaged food.
        </p>
        <p>
          Delivery may be delayed by preparation time, vendor capacity, weather, traffic, campus
          access, incorrect information, payment issues, or events outside reasonable control. A
          delivery estimate is not an absolute guarantee unless expressly stated in writing.
        </p>
        <p>
          MUST Market may assist with communication and support, but an independent vendor may remain
          responsible for preparation, food safety, delivery, refunds, replacement, or other
          fulfilment obligations. Where a complaint concerns food quality or safety, contact MUST
          Market promptly at <LegalEmail /> and also notify the relevant vendor if requested.
        </p>
      </>
    ),
  },
  {
    id: "mobile-money-payments",
    title: "Mobile-money payments and no-cash rule",
    body: (
      <>
        <p>
          MUST Market currently supports mobile-money payments only for applicable paid Services and
          does not accept cash for those transactions. You authorize the applicable payment provider
          to process the payment amount shown at checkout or otherwise confirmed for the order.
        </p>
        <p>
          You are responsible for entering accurate payment information, authorizing the
          transaction, maintaining sufficient funds, and protecting your mobile-money PIN. MUST
          Market does not request or store your mobile-money PIN.
        </p>
        <p>
          Payment processing may be performed by third-party providers. A payment may fail, be
          delayed, reversed, or require investigation. Payment references and status may be shared
          with the vendor and provider to reconcile an order.
        </p>
        <p>
          Prices should be displayed in Tanzanian shillings unless stated otherwise. Taxes, delivery
          charges, service charges, discounts, promotions, and mobile-money charges will be shown
          where applicable. An order is not necessarily complete merely because a user has initiated
          payment; the relevant confirmation or order status controls.
        </p>
      </>
    ),
  },
  {
    id: "cancellations-refunds-and-order-disputes",
    title: "Cancellations, refunds, and order disputes",
    body: (
      <>
        <p>
          Cancellation and refund eligibility may depend on whether the order has been accepted,
          prepared, dispatched, delivered, cancelled by the vendor, affected by a payment error, or
          subject to a promotion. A vendor may have additional published cancellation or refund
          rules.
        </p>
        <p>
          To request help, contact <LegalEmail /> promptly with the account details, order reference,
          payment reference, issue, and requested resolution. We may request reasonable evidence,
          including screenshots, payment confirmations, photographs, or messages.
        </p>
        <p>
          Where a refund is approved, it will ordinarily be processed through the applicable
          mobile-money or payment channel, subject to provider capability, verification, and
          applicable law. We do not promise a refund for a customer’s change of mind, inaccurate
          delivery information, failure to remain reachable, or refusal to receive an accurately
          prepared order, unless required by law or a vendor’s published policy.
        </p>
        <p>
          Nothing in this section removes any mandatory consumer right or remedy available under
          applicable Tanzanian law.
        </p>
      </>
    ),
  },
  {
    id: "halal-ethical-and-prohibited-content",
    title: "Halal, ethical, and prohibited-content policy",
    body: (
      <>
        <p>
          MUST Market is intended to operate according to a strict halal and ethical content
          standard. This platform policy is a business and community rule; it is not a religious
          ruling or a substitute for advice from a qualified Islamic scholar. Where an item’s status
          is uncertain, MUST Market may refuse, restrict, remove, or request clarification before
          allowing publication.
        </p>
        <p>
          Users must not list, advertise, sell, promote, facilitate, or request any product, service,
          image, instruction, transaction, or opportunity that MUST Market reasonably determines is
          prohibited, harmful, unlawful, exploitative, deceptive, or inconsistent with this policy.
        </p>
        <p>Prohibited categories include, without limitation:</p>
        <LegalList
          ordered
          items={[
            "Alcohol, intoxicants, illegal drugs, tobacco, vaping products, and products intended to facilitate substance abuse;",
            "Pork or pork-derived products and food that is represented as non-halal or whose halal status is materially uncertain;",
            "Gambling, betting, lotteries, casinos, games of chance for money, prediction schemes, or betting-related services;",
            "Riba-based lending, interest-based financial products, payday lending, exploitative debt arrangements, or services primarily designed around prohibited interest;",
            "Pyramid schemes, Ponzi schemes, multi-level marketing, network-marketing recruitment, chain-referral compensation, get-rich-quick schemes, or opportunities requiring payment primarily to recruit others;",
            "Witchcraft, wizardry, sorcery, divination, fortune-telling, occult services, charms, amulets, or products promoted through shirk or ushirikina;",
            "Theft, stolen goods, unauthorized property, counterfeit goods, pirated media, hacked accounts, stolen credentials, or tools intended to facilitate crime;",
            "Weapons, explosives, ammunition, dangerous materials, or illegal surveillance equipment;",
            "Sexual services, pornography, explicit sexual products, exploitative content, or content that sexualizes or exploits any person;",
            "Products or listings displaying any woman or female model, whether in a photograph, video, advertisement, or promotional image, unless MUST Market gives a written exception for a narrowly defined operational reason;",
            "Hateful, abusive, harassing, humiliating, discriminatory, violent, or extremist material;",
            "Fraudulent health, medical, investment, immigration, academic, employment, or legal claims;",
            "Products or services that violate intellectual-property, privacy, consumer-protection, food-safety, licensing, or other applicable laws; and",
            "Any item or service that MUST Market reasonably believes conflicts with its halal, modesty, safety, or ethical standards.",
          ]}
        />
        <p>
          Listings must not use sexually suggestive imagery, misleading before-and-after claims,
          false scarcity, deceptive testimonials, or images that conceal material defects. Users must
          have permission to upload all images and text.
        </p>
        <p>
          MUST Market may remove a listing, reject an order, suspend an account, withhold an
          unredeemed promotional benefit, or refer suspected criminal conduct to appropriate
          authorities. We may apply this policy conservatively where the product, image, service, or
          business model is ambiguous.
        </p>
      </>
    ),
  },
  {
    id: "food-and-halal-requirements",
    title: "Food and halal requirements",
    body: (
      <>
        <p>
          Restaurants and food vendors using Msosi Fasta must provide food that complies with the
          halal standard communicated by MUST Market and must disclose relevant ingredients,
          preparation limitations, and material cross-contamination concerns where applicable. A
          vendor must not label food halal if it cannot support that representation.
        </p>
        <p>
          MUST Market may request vendor information, remove menus, pause orders, or suspend a vendor
          where there is a credible concern about prohibited ingredients, contamination,
          misrepresentation, food safety, or legal compliance. Users with allergies or dietary
          restrictions must communicate them before ordering and must not assume that a listing is
          suitable without confirmation from the vendor.
        </p>
      </>
    ),
  },
  {
    id: "rewards-streaks-referrals-and-promotions",
    title: "Rewards, day streaks, referrals, coupons, and promotions",
    body: (
      <>
        <p>
          MUST Market may offer experimental or future programmes involving day streaks, points,
          referrals, coupons, free soda, discounts, or other rewards. A promotion may have additional
          rules, eligibility requirements, expiry dates, limits, qualifying actions, and redemption
          conditions.
        </p>
        <p>Unless expressly stated otherwise:</p>
        <LegalList
          ordered
          items={[
            "Points, streaks, coupons, and rewards are promotional benefits, not money, deposits, investments, or property;",
            "Points cannot be sold, transferred, exchanged for cash, or pledged;",
            "A referral reward may require the referred person to create a legitimate account and complete a qualifying first order that is paid, fulfilled, and not refunded, cancelled, or charged back;",
            "Self-referrals, duplicate accounts, fabricated orders, collusion, automated activity, false information, chargebacks, and prohibited transactions do not qualify;",
            "Streaks may reset when the required activity is missed, reversed, or determined to be invalid;",
            "Rewards may be delayed while eligibility or fraud is reviewed;",
            "MUST Market may correct technical errors, reverse improperly issued rewards, pause a programme, or discontinue a programme prospectively; and",
            "No reward is guaranteed unless MUST Market has confirmed eligibility and the specific programme terms have been satisfied.",
          ]}
        />
        <p>
          Where a promotion promises a free item such as a soda, the vendor, available stock, delivery
          conditions, substitution rules, and redemption deadline may apply. Promotional terms
          displayed at the time of participation control if they conflict with this general section.
        </p>
      </>
    ),
  },
  {
    id: "user-content-and-licence",
    title: "User content and licence",
    body: (
      <>
        <p>
          You retain ownership of original content that you submit, including listing text,
          photographs, logos, menus, reviews, and feedback. You grant MUST Market a worldwide,
          non-exclusive, royalty-free, transferable to service providers, sublicensable where
          necessary, licence to host, reproduce, format, adapt, display, distribute, and communicate
          that content solely to operate, promote, secure, and improve the Services.
        </p>
        <p>
          You represent that you own or have permission to submit the content, that it is accurate to
          the best of your knowledge, that it does not violate another person’s rights, and that it
          complies with the halal, ethical, safety, and legal rules in these Terms.
        </p>
        <p>
          MUST Market may remove, restrict, modify, or refuse content that violates these Terms, is
          inaccurate, is reported, creates legal or safety risk, or is inconsistent with the
          Services.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <>
        <p>
          The MUST Market name, logo, design, software, text, graphics, interfaces, compilations,
          trademarks, and other materials provided by MUST Market are owned by or licensed to MUST
          Market and are protected by applicable law. Except as expressly permitted, you may not
          copy, modify, reverse engineer, scrape, reproduce, sell, distribute, or create derivative
          works from the Services.
        </p>
        <p>
          You may use the Services only for their intended personal or authorized business purposes.
          You may not use automated tools to overload, harvest, manipulate, or interfere with the
          Services.
        </p>
      </>
    ),
  },
  {
    id: "prohibited-conduct",
    title: "Prohibited conduct",
    body: (
      <>
        <p>You must not:</p>
        <LegalList
          ordered
          items={[
            "Break the law or encourage another person to break the law;",
            "Evade identity, age, payment, security, or reward controls;",
            "Create fake accounts, manipulate reviews, inflate orders, or abuse referrals;",
            "Upload malware, harmful code, spam, or phishing content;",
            "Scrape listings or personal data without permission;",
            "Harass, threaten, exploit, or defraud users, sellers, vendors, delivery participants, or staff;",
            "Sell or request prohibited goods or services;",
            "Misuse another person’s account, image, name, phone number, or payment information; or",
            "Interfere with the availability, security, integrity, or lawful operation of the Services.",
          ]}
        />
      </>
    ),
  },
  {
    id: "safety-and-user-responsibility",
    title: "Safety and user responsibility",
    body: (
      <>
        <p>
          Marketplace users should meet in public, well-lit campus locations, inspect products before
          payment, keep records of communications, and avoid sending goods or money before verifying
          the transaction. Never disclose your mobile-money PIN, password, verification code, or full
          financial credentials.
        </p>
        <p>
          Customers should provide safe and accurate delivery instructions and promptly report
          food-safety concerns. Vendors must follow applicable food-safety, licensing, employment,
          tax, and consumer requirements.
        </p>
      </>
    ),
  },
  {
    id: "suspension-and-termination",
    title: "Suspension and termination",
    body: (
      <>
        <p>
          You may stop using the Services at any time and may request account deletion through{" "}
          <LegalEmail />, subject to lawful retention requirements.
        </p>
        <p>
          MUST Market may suspend, limit, remove, or terminate access, listings, orders, rewards, or
          accounts when reasonably necessary for security, fraud prevention, policy enforcement,
          legal compliance, vendor or user safety, non-payment, abuse, or violation of these Terms.
        </p>
        <p>
          Where appropriate, we may provide notice and an opportunity to resolve the issue. We may
          act without prior notice where delay could cause harm, fraud, legal exposure, or
          disruption. Termination does not eliminate obligations that by their nature should
          continue, including payment obligations, intellectual-property rights, confidentiality,
          dispute provisions, liability provisions, and records required by law.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <>
        <p>
          To the maximum extent permitted by applicable law, the Services are provided on an “as
          available” and “as is” basis. We do not guarantee that the Services will be uninterrupted,
          error-free, secure at all times, or available in every location.
        </p>
        <p>
          MUST Market does not guarantee the quality, safety, legality, halal status, ownership,
          authenticity, availability, price, delivery, or suitability of a third-party listing,
          restaurant, food vendor, delivery provider, product, or service. Users must exercise their
          own judgment and conduct appropriate checks.
        </p>
        <p>
          Nothing in these Terms excludes a representation or liability that cannot lawfully be
          excluded, including mandatory consumer rights, fraud, deliberate misconduct, or liability
          for death or personal injury caused by negligence where applicable law prevents exclusion.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the maximum extent permitted by applicable law, MUST Market and its owner, personnel,
          contractors, service providers, and affiliates will not be liable for indirect, incidental,
          special, consequential, exemplary, or punitive losses, loss of profits, loss of
          opportunity, loss of data, reputational loss, or business interruption arising from or
          connected with:
        </p>
        <LegalList
          ordered
          items={[
            "A user-to-user marketplace transaction;",
            "An independent restaurant, food vendor, or delivery provider;",
            "A product, meal, ingredient, allergy, delivery delay, or vendor act or omission;",
            "Unauthorized access caused by a user’s failure to secure their account;",
            "Temporary unavailability, technical error, payment-provider failure, or service interruption; or",
            "A reward, referral, coupon, streak, or promotional programme.",
          ]}
        />
        <p>
          Where liability may lawfully be limited, the aggregate liability of MUST Market for a claim
          arising directly from the Services will not exceed the amount the claimant paid to MUST
          Market for the specific transaction giving rise to the claim during the three months before
          the event, or TZS 100,000 if no amount was paid to MUST Market, whichever is greater. This
          limit does not apply to liability that cannot lawfully be limited.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <p>
        To the extent permitted by law, you agree to defend, indemnify, and hold harmless MUST Market
        and its owner, personnel, contractors, service providers, and affiliates from claims, losses,
        liabilities, costs, and reasonable expenses arising from your unlawful conduct, prohibited
        listing, user content, breach of these Terms, violation of another person’s rights, or misuse
        of the Services.
      </p>
    ),
  },
  {
    id: "disputes-and-complaints",
    title: "Disputes and complaints",
    body: (
      <>
        <p>
          Please first contact <LegalEmail /> so that we can try to resolve the issue informally.
          Include your name, account email or phone number, order or listing reference, relevant
          payment reference, facts, and requested outcome.
        </p>
        <p>
          If the dispute cannot be resolved informally, these Terms and the relationship between you
          and MUST Market will be governed by the laws of the United Republic of Tanzania, without
          excluding mandatory rights that apply to you. Subject to any mandatory alternative forum or
          procedure, the courts of competent jurisdiction in Tanzania, with a proposed venue in or
          near Mbeya where legally permissible, may hear the dispute.
        </p>
        <p>
          Nothing in this section prevents a user from contacting a regulator, law-enforcement body,
          consumer-protection authority, payment provider, or other authority with jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: "changes-to-these-terms",
    title: "Changes to these Terms",
    body: (
      <p>
        We may update these Terms when the Services, rewards programmes, vendors, payment
        arrangements, technology, or law changes. We will publish the updated Terms and revise the
        effective date. Continued use after the effective date means that you accept the updated
        Terms to the extent permitted by law. Material changes may require additional notice or
        consent.
      </p>
    ),
  },
  {
    id: "general-provisions",
    title: "General provisions",
    body: (
      <>
        <p>
          If a provision is held invalid or unenforceable, it will be modified or severed only to the
          minimum extent necessary and the remaining provisions will continue. Failure to enforce a
          provision is not a waiver. You may not assign your account or rights under these Terms
          without our written consent. MUST Market may assign these Terms in connection with a
          restructuring, sale, merger, or transfer of the Services.
        </p>
        <p>
          These Terms, together with the Privacy Policy and any promotion-specific or vendor-specific
          terms displayed at the time of use, form the agreement between you and MUST Market
          regarding the Services. If a specific order or promotion has terms that conflict with these
          Terms, the specific terms will control for that transaction or promotion.
        </p>
      </>
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

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <LegalDoc
        icon={<FileText className="h-8 w-8 text-primary" />}
        title="Terms of Service"
        effectiveDate="12 September 2026"
        lastUpdated="12 September 2026"
        sections={sections}
        preamble={
          <>
            <p>
              These Terms of Service (“Terms”) govern access to and use of <LegalDomain />, the MUST
              Market student marketplace, Msosi Fasta, account features, rewards, referrals,
              communications, and related services (together, the “Services”).
            </p>
            <p>
              The Services are operated by MUST Market, based in Iyunga, Mbeya, Tanzania. Contact:{" "}
              <LegalEmail />.
            </p>
            <p>
              By accessing, registering for, or using the Services, you agree to these Terms and the
              MUST Market Privacy Policy. If you do not agree, do not use the Services.
            </p>
          </>
        }
      />
      <Footer />
    </div>
  );
}
