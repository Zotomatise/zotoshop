import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Service Client",
  description: "Contactez notre service client pour toute question.",
}

export default async function ServiceClientPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="service-client-page">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Service Client</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          Notre équipe est là pour vous aider. Choisissez le moyen de contact
          qui vous convient.
        </p>
      </div>

      <div className="flex flex-col gap-y-8">
        {/* Contact par e-mail */}
        <div className="border border-ui-border-base rounded-rounded p-6">
          <div className="flex items-start gap-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-base">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="flex flex-col gap-y-1">
              <h3 className="text-base-semi">E-mail</h3>
              <p className="text-small-regular text-ui-fg-subtle">
                Envoyez-nous un e-mail et nous vous répondrons sous 24h.
              </p>
              <a
                href="mailto:support@zotoshop.com"
                className="text-ui-fg-interactive text-small-semi mt-2 hover:underline"
                data-testid="email-link"
              >
                support@zotoshop.com
              </a>
            </div>
          </div>
        </div>

        {/* Téléphone */}
        <div className="border border-ui-border-base rounded-rounded p-6">
          <div className="flex items-start gap-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-base">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <div className="flex flex-col gap-y-1">
              <h3 className="text-base-semi">Téléphone</h3>
              <p className="text-small-regular text-ui-fg-subtle">
                Disponible du lundi au vendredi, de 9h à 18h.
              </p>
              <a
                href="tel:+33100000000"
                className="text-ui-fg-interactive text-small-semi mt-2 hover:underline"
                data-testid="phone-link"
              >
                01 00 00 00 00
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="border border-ui-border-base rounded-rounded p-6">
          <div className="flex items-start gap-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-base">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex flex-col gap-y-1">
              <h3 className="text-base-semi">Questions fréquentes</h3>
              <div className="flex flex-col gap-y-4 mt-3">
                <details className="group" data-testid="faq-item">
                  <summary className="text-small-semi cursor-pointer list-none flex items-center justify-between">
                    Comment suivre ma commande ?
                    <span className="text-ui-fg-subtle group-open:rotate-180 transition-transform">&#9662;</span>
                  </summary>
                  <p className="text-small-regular text-ui-fg-subtle mt-2">
                    Rendez-vous dans la section &quot;Commandes&quot; de votre compte pour voir le statut de vos commandes en temps réel.
                  </p>
                </details>
                <details className="group" data-testid="faq-item">
                  <summary className="text-small-semi cursor-pointer list-none flex items-center justify-between">
                    Quels sont les délais de livraison ?
                    <span className="text-ui-fg-subtle group-open:rotate-180 transition-transform">&#9662;</span>
                  </summary>
                  <p className="text-small-regular text-ui-fg-subtle mt-2">
                    Les livraisons sont effectuées sous 3 à 5 jours ouvrés en France métropolitaine.
                  </p>
                </details>
                <details className="group" data-testid="faq-item">
                  <summary className="text-small-semi cursor-pointer list-none flex items-center justify-between">
                    Comment retourner un article ?
                    <span className="text-ui-fg-subtle group-open:rotate-180 transition-transform">&#9662;</span>
                  </summary>
                  <p className="text-small-regular text-ui-fg-subtle mt-2">
                    Vous disposez de 30 jours après réception pour retourner un article. Contactez-nous par e-mail pour obtenir une étiquette de retour.
                  </p>
                </details>
                <details className="group" data-testid="faq-item">
                  <summary className="text-small-semi cursor-pointer list-none flex items-center justify-between">
                    Quels moyens de paiement acceptez-vous ?
                    <span className="text-ui-fg-subtle group-open:rotate-180 transition-transform">&#9662;</span>
                  </summary>
                  <p className="text-small-regular text-ui-fg-subtle mt-2">
                    Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal et les virements bancaires.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
