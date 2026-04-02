import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guide QA — ZotoShop",
  description:
    "Documentation complète pour tester ZotoShop : comptes, scénarios, types de tests et endpoints API.",
}

const testUsers = [
  {
    email: "standard_user@zotoshop.com",
    password: "password123",
    type: "Standard",
    behavior: "Aucun comportement spécial. Compte classique pour tester les parcours normaux.",
    color: "bg-green-100 text-green-800",
  },
  {
    email: "locked_out_user@zotoshop.com",
    password: "password123",
    type: "Bloqué",
    behavior:
      "Le login est intercepté côté frontend : affiche \"Ce compte est bloqué. Contactez le support.\" sans appeler l'API.",
    color: "bg-red-100 text-red-800",
  },
  {
    email: "slow_user@zotoshop.com",
    password: "password123",
    type: "Lent",
    behavior:
      "Un overlay de chargement (3-5s) s'affiche à chaque changement de page. Utile pour tester les waits et timeouts.",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    email: "error_user@zotoshop.com",
    password: "password123",
    type: "Erreurs",
    behavior:
      "40% de chance qu'une action (ajout panier, mise à jour, etc.) échoue avec une erreur aléatoire. Utile pour tester la gestion d'erreurs et les retries.",
    color: "bg-orange-100 text-orange-800",
  },
  {
    email: "visual_user@zotoshop.com",
    password: "password123",
    type: "Bugs visuels",
    behavior:
      "Des bugs CSS sont activés : images manquantes, polices incorrectes, boutons décalés, footer qui chevauche le contenu. Utile pour les tests de régression visuelle.",
    color: "bg-purple-100 text-purple-800",
  },
]

const promoCodes = [
  {
    code: "ZOTO10",
    result: "Réduction de 10% sur le total",
    type: "Valide (API Medusa)",
  },
  {
    code: "ZOTO20",
    result: "Réduction de 20% sur le total",
    type: "Valide (API Medusa)",
  },
  {
    code: "EXPIRED",
    result: "\"Ce code promo a expiré.\"",
    type: "Simulé (intercepté frontend)",
  },
  {
    code: "INVALID",
    result: "\"Code promo invalide.\"",
    type: "Simulé (intercepté frontend)",
  },
  {
    code: "FREESHIP",
    result: "\"Livraison offerte appliquée !\"",
    type: "Simulé (intercepté frontend)",
  },
  {
    code: "EMPTY",
    result: "\"Veuillez saisir un code promo.\"",
    type: "Simulé (intercepté frontend)",
  },
]

const scenarios = [
  {
    category: "Authentification",
    items: [
      "Se connecter avec un compte valide (standard_user)",
      "Se connecter avec un compte bloqué (locked_out_user)",
      "Se connecter avec un email invalide",
      "Se connecter avec un mot de passe incorrect",
      "Se connecter avec des champs vides",
      "Se déconnecter et vérifier la redirection",
    ],
  },
  {
    category: "Inscription",
    items: [
      "Remplir le formulaire complet (15+ champs)",
      "Valider les messages d'erreur champ par champ",
      "Vérifier la correspondance des mots de passe",
      "Tester les champs obligatoires (CGU, email, password)",
      "Tester les formats (email, téléphone, code postal)",
      "Soumettre avec un email déjà utilisé",
    ],
  },
  {
    category: "Navigation & Catalogue",
    items: [
      "Parcourir les produits depuis la boutique",
      "Filtrer par collections / catégories",
      "Accéder à la fiche produit détaillée",
      "Vérifier les images, prix et descriptions",
      "Tester la navigation breadcrumb",
    ],
  },
  {
    category: "Panier & Checkout",
    items: [
      "Ajouter un produit au panier",
      "Modifier la quantité dans le panier",
      "Supprimer un article du panier",
      "Appliquer un code promo (valide et invalide)",
      "Remplir les informations de livraison",
      "Compléter le processus de commande",
    ],
  },
  {
    category: "Compte utilisateur",
    items: [
      "Consulter le profil",
      "Modifier les informations personnelles",
      "Gérer les adresses de livraison",
      "Consulter l'historique des commandes",
    ],
  },
  {
    category: "Comportements spéciaux",
    items: [
      "Se connecter en slow_user et observer l'overlay de chargement",
      "Se connecter en error_user et tenter des actions (ajout panier, etc.)",
      "Se connecter en visual_user et identifier les bugs visuels CSS",
      "Vérifier que standard_user n'a aucun comportement anormal",
    ],
  },
]

const testTypes = [
  {
    type: "Tests fonctionnels (UI)",
    icon: "🖱️",
    description: "Tester les parcours utilisateur via l'interface web.",
    tools: "Playwright, Cypress, Selenium",
    examples: [
      "Login / Logout",
      "Inscription complète",
      "Ajout au panier et checkout",
      "Application de codes promo",
      "Navigation et filtrage produits",
    ],
  },
  {
    type: "Tests API",
    icon: "🔌",
    description: "Tester directement les endpoints REST du backend Medusa.",
    tools: "Postman, RestAssured, Playwright API, requests (Python)",
    examples: [
      "POST /auth/customer/emailpass — Authentification",
      "GET /store/products — Liste des produits",
      "POST /store/carts — Création de panier",
      "POST /store/carts/:id/line-items — Ajout au panier",
      "POST /store/customers — Inscription",
    ],
  },
  {
    type: "Tests de régression visuelle",
    icon: "👁️",
    description:
      "Comparer des screenshots pour détecter les régressions CSS. Le compte visual_user active des bugs visuels intentionnels.",
    tools: "Playwright (toHaveScreenshot), Percy, BackstopJS, Applitools",
    examples: [
      "Comparer la page d'accueil avant/après",
      "Détecter les images manquantes (visual_user)",
      "Vérifier l'alignement des boutons",
      "Tester le responsive (mobile, tablet, desktop)",
    ],
  },
  {
    type: "Tests de performance",
    icon: "⚡",
    description:
      "Mesurer les temps de réponse et la réactivité. Le compte slow_user simule de la latence.",
    tools: "Lighthouse, k6, Artillery, Playwright (timing)",
    examples: [
      "Temps de chargement de la page d'accueil",
      "Temps de réponse API /store/products",
      "Comportement sous charge (requêtes concurrentes)",
      "Vérifier les timeouts avec slow_user",
    ],
  },
  {
    type: "Tests d'accessibilité",
    icon: "♿",
    description: "Vérifier la conformité WCAG et l'utilisabilité pour tous.",
    tools: "axe-core, Playwright (accessibility), Lighthouse",
    examples: [
      "Audit axe sur chaque page",
      "Navigation au clavier (Tab, Enter, Escape)",
      "Contraste des couleurs",
      "Attributs ARIA et labels des formulaires",
      "Textes alternatifs des images",
    ],
  },
  {
    type: "Tests de sécurité",
    icon: "🔒",
    description:
      "Vérifier la résistance aux attaques courantes (OWASP Top 10).",
    tools: "OWASP ZAP, Burp Suite, tests manuels",
    examples: [
      "Injection XSS dans les champs de recherche/formulaires",
      "Injection SQL via les paramètres API",
      "Test CSRF sur les formulaires",
      "Vérifier les headers de sécurité (CSP, HSTS)",
      "Accès non autorisé aux endpoints protégés",
    ],
  },
]

const apiEndpoints = [
  {
    method: "POST",
    path: "/auth/customer/emailpass",
    description: "Authentification client",
    body: '{ "email": "...", "password": "..." }',
    headers: "Content-Type: application/json",
  },
  {
    method: "POST",
    path: "/auth/customer/emailpass/register",
    description: "Inscription (création auth identity)",
    body: '{ "email": "...", "password": "..." }',
    headers: "Content-Type: application/json",
  },
  {
    method: "GET",
    path: "/store/products",
    description: "Liste des produits",
    body: null,
    headers: "x-publishable-api-key: pk_...",
  },
  {
    method: "GET",
    path: "/store/products/:id",
    description: "Détail d'un produit",
    body: null,
    headers: "x-publishable-api-key: pk_...",
  },
  {
    method: "GET",
    path: "/store/collections",
    description: "Liste des collections",
    body: null,
    headers: "x-publishable-api-key: pk_...",
  },
  {
    method: "POST",
    path: "/store/carts",
    description: "Créer un panier",
    body: '{ "region_id": "..." }',
    headers: "x-publishable-api-key: pk_...",
  },
  {
    method: "POST",
    path: "/store/carts/:id/line-items",
    description: "Ajouter un article au panier",
    body: '{ "variant_id": "...", "quantity": 1 }',
    headers: "x-publishable-api-key: pk_...",
  },
  {
    method: "POST",
    path: "/store/customers",
    description: "Créer un compte client",
    body: '{ "first_name": "...", "last_name": "...", "email": "...", "phone": "..." }',
    headers: "Authorization: Bearer <token>",
  },
  {
    method: "GET",
    path: "/store/customers/me",
    description: "Profil du client connecté",
    body: null,
    headers: "Authorization: Bearer <token>",
  },
]

export default function GuidePage() {
  return (
    <div
      className="content-container py-12 max-w-4xl"
      data-testid="guide-page"
    >
      {/* Header */}
      <div className="mb-12">
        <h1
          className="text-3xl font-bold mb-4"
          data-testid="guide-title"
        >
          Guide QA — ZotoShop
        </h1>
        <p className="text-ui-fg-subtle text-lg leading-relaxed">
          ZotoShop est une application e-commerce conçue pour la{" "}
          <strong>pratique de l&apos;automatisation de test</strong>. Elle propose
          des comptes de test avec des comportements spéciaux, des formulaires
          complets, des codes promo simulés et une API REST complète.
        </p>
        <p className="text-ui-fg-subtle mt-2">
          Développée par{" "}
          <a
            href="https://zotomatise.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ui-fg-interactive hover:underline"
          >
            Zotomatise
          </a>{" "}
          — la plateforme de formation #1 francophone pour les testeurs
          logiciels.
        </p>
      </div>

      {/* Comptes de test */}
      <section className="mb-12" data-testid="guide-section-accounts">
        <h2 className="text-2xl font-semibold mb-2">
          Comptes de test
        </h2>
        <p className="text-ui-fg-subtle mb-4">
          Tous les comptes utilisent le mot de passe :{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">
            password123
          </code>
        </p>
        <div className="space-y-4">
          {testUsers.map((user) => (
            <div
              key={user.email}
              className="border border-ui-border-base rounded-lg p-4"
              data-testid={`guide-user-${user.type.toLowerCase()}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${user.color}`}
                >
                  {user.type}
                </span>
                <code className="font-mono text-sm">{user.email}</code>
              </div>
              <p className="text-sm text-ui-fg-subtle">{user.behavior}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Codes promo */}
      <section className="mb-12" data-testid="guide-section-promo">
        <h2 className="text-2xl font-semibold mb-2">
          Codes promo
        </h2>
        <p className="text-ui-fg-subtle mb-4">
          Utilisables dans le checkout. Certains sont gérés par l&apos;API Medusa,
          d&apos;autres sont interceptés côté frontend pour simuler différents
          scénarios.
        </p>
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm border-collapse"
            data-testid="guide-promo-table"
          >
            <thead>
              <tr className="border-b border-ui-border-base">
                <th className="text-left py-2 pr-4 font-semibold">Code</th>
                <th className="text-left py-2 pr-4 font-semibold">Résultat</th>
                <th className="text-left py-2 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr
                  key={promo.code}
                  className="border-b border-ui-border-base"
                >
                  <td className="py-2 pr-4">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">
                      {promo.code}
                    </code>
                  </td>
                  <td className="py-2 pr-4 text-ui-fg-subtle">
                    {promo.result}
                  </td>
                  <td className="py-2 text-ui-fg-subtle text-xs">
                    {promo.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Scénarios de test */}
      <section className="mb-12" data-testid="guide-section-scenarios">
        <h2 className="text-2xl font-semibold mb-4">
          Scénarios de test
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {scenarios.map((s) => (
            <div
              key={s.category}
              className="border border-ui-border-base rounded-lg p-4"
            >
              <h3 className="font-semibold mb-2">{s.category}</h3>
              <ul className="space-y-1">
                {s.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-ui-fg-subtle flex items-start gap-2"
                  >
                    <span className="text-ui-fg-muted mt-0.5">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Types de tests */}
      <section className="mb-12" data-testid="guide-section-test-types">
        <h2 className="text-2xl font-semibold mb-4">
          Types de tests possibles
        </h2>
        <div className="space-y-6">
          {testTypes.map((t) => (
            <div
              key={t.type}
              className="border border-ui-border-base rounded-lg p-5"
            >
              <h3 className="text-lg font-semibold mb-1">
                {t.icon} {t.type}
              </h3>
              <p className="text-sm text-ui-fg-subtle mb-2">
                {t.description}
              </p>
              <p className="text-xs text-ui-fg-muted mb-3">
                <strong>Outils :</strong> {t.tools}
              </p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {t.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="text-sm text-ui-fg-subtle flex items-start gap-2"
                  >
                    <span className="text-ui-fg-muted mt-0.5">-</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Endpoints API */}
      <section className="mb-12" data-testid="guide-section-api">
        <h2 className="text-2xl font-semibold mb-2">
          Endpoints API principaux
        </h2>
        <p className="text-ui-fg-subtle mb-4">
          Le backend expose une API REST Medusa v2. La plupart des endpoints
          nécessitent le header{" "}
          <code className="bg-gray-100 px-1 rounded font-mono text-xs">
            x-publishable-api-key
          </code>
          .
        </p>
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm border-collapse"
            data-testid="guide-api-table"
          >
            <thead>
              <tr className="border-b border-ui-border-base">
                <th className="text-left py-2 pr-4 font-semibold">Méthode</th>
                <th className="text-left py-2 pr-4 font-semibold">Endpoint</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {apiEndpoints.map((ep) => (
                <tr
                  key={`${ep.method}-${ep.path}`}
                  className="border-b border-ui-border-base"
                >
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                        ep.method === "GET"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <code className="font-mono text-xs">{ep.path}</code>
                  </td>
                  <td className="py-2 text-ui-fg-subtle">{ep.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* data-testid reference */}
      <section className="mb-12" data-testid="guide-section-testids">
        <h2 className="text-2xl font-semibold mb-2">
          Sélecteurs data-testid
        </h2>
        <p className="text-ui-fg-subtle mb-4">
          Tous les éléments interactifs ont un attribut{" "}
          <code className="bg-gray-100 px-1 rounded font-mono text-xs">
            data-testid
          </code>{" "}
          pour faciliter l&apos;automatisation. Exemples :
        </p>
        <div className="grid gap-2 sm:grid-cols-2 text-sm font-mono">
          {[
            "nav-store-link",
            "nav-account-link",
            "nav-cart-link",
            "nav-menu-button",
            "product-price",
            "add-product-button",
            "add-discount-button",
            "discount-input",
            "discount-apply-button",
            "discount-error-message",
            "register-first-name",
            "register-last-name",
            "register-email",
            "register-password",
            "register-confirm-password",
            "register-birthdate",
            "register-phone",
            "register-gender",
            "register-address",
            "register-postal-code",
            "register-city",
            "register-country",
            "register-newsletter",
            "register-terms",
            "register-submit",
            "slow-user-overlay",
            "random-error-message",
            "guide-page",
          ].map((id) => (
            <div
              key={id}
              className="bg-gray-50 px-3 py-1.5 rounded border border-ui-border-base"
            >
              {id}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-ui-border-base pt-6 text-center text-sm text-ui-fg-muted">
        <p>
          Cette page est mise à jour à chaque évolution de l&apos;application.
        </p>
        <p className="mt-1">
          Besoin de formation ?{" "}
          <a
            href="https://zotomatise.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ui-fg-interactive hover:underline"
          >
            zotomatise.com
          </a>
        </p>
      </div>
    </div>
  )
}
