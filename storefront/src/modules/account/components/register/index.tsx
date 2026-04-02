"use client"

import { useState, useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const COUNTRIES = [
  { value: "", label: "Sélectionner un pays" },
  { value: "fr", label: "France" },
  { value: "be", label: "Belgique" },
  { value: "ch", label: "Suisse" },
  { value: "de", label: "Allemagne" },
  { value: "es", label: "Espagne" },
  { value: "it", label: "Italie" },
  { value: "gb", label: "Royaume-Uni" },
  { value: "us", label: "États-Unis" },
  { value: "ca", label: "Canada" },
]

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmPassword, setConfirmPassword] = useState("")

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {}
    const password = formData.get("password") as string
    const confirm = formData.get("confirm_password") as string
    const email = formData.get("email") as string
    const terms = formData.get("terms")

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email invalide"
    }

    if (!password || password.length < 8) {
      newErrors.password = "Mot de passe trop court (min 8 caractères)"
    }

    if (password !== confirm) {
      newErrors.confirm_password = "Les mots de passe ne correspondent pas"
    }

    if (!terms) {
      newErrors.terms = "Veuillez accepter les CGU"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (formData: FormData) => {
    if (!validateForm(formData)) return
    formAction(formData)
  }

  return (
    <div
      className="max-w-lg flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Devenir membre ZotoShop
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Créez votre profil ZotoShop et profitez d&apos;une expérience
        d&apos;achat améliorée.
      </p>
      <form className="w-full flex flex-col" action={handleSubmit}>
        {/* Section 1: Identité */}
        <fieldset className="mb-6">
          <legend className="text-base-semi mb-3 font-semibold">
            Identité
          </legend>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="Prénom"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="register-first-name"
            />
            <Input
              label="Nom"
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="register-last-name"
            />
            <Input
              label="E-mail"
              name="email"
              required
              type="email"
              autoComplete="email"
              data-testid="register-email"
            />
            {errors.email && (
              <p
                className="text-rose-500 text-small-regular"
                data-testid="register-error-email"
              >
                {errors.email}
              </p>
            )}
            <Input
              label="Mot de passe"
              name="password"
              required
              type="password"
              autoComplete="new-password"
              data-testid="register-password"
            />
            {errors.password && (
              <p
                className="text-rose-500 text-small-regular"
                data-testid="register-error-password"
              >
                {errors.password}
              </p>
            )}
            <Input
              label="Confirmer le mot de passe"
              name="confirm_password"
              required
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="register-confirm-password"
            />
            {errors.confirm_password && (
              <p
                className="text-rose-500 text-small-regular"
                data-testid="register-error-confirm-password"
              >
                {errors.confirm_password}
              </p>
            )}
          </div>
        </fieldset>

        {/* Section 2: Informations personnelles */}
        <fieldset className="mb-6">
          <legend className="text-base-semi mb-3 font-semibold">
            Informations personnelles
          </legend>
          <div className="flex flex-col w-full gap-y-2">
            <div>
              <label
                htmlFor="birthdate"
                className="block text-sm text-ui-fg-base mb-1"
              >
                Date de naissance
              </label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                className="w-full px-4 py-2.5 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base focus:outline-none focus:border-ui-fg-interactive"
                data-testid="register-birthdate"
              />
            </div>
            <Input
              label="Téléphone"
              name="phone"
              type="tel"
              autoComplete="tel"
              data-testid="register-phone"
            />
            <div>
              <span className="block text-sm text-ui-fg-base mb-2">Genre</span>
              <div
                className="flex gap-x-6"
                data-testid="register-gender"
              >
                <label className="flex items-center gap-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="homme"
                    className="accent-ui-fg-interactive"
                    data-testid="register-gender-homme"
                  />
                  <span className="text-sm">Homme</span>
                </label>
                <label className="flex items-center gap-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="femme"
                    className="accent-ui-fg-interactive"
                    data-testid="register-gender-femme"
                  />
                  <span className="text-sm">Femme</span>
                </label>
                <label className="flex items-center gap-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="autre"
                    className="accent-ui-fg-interactive"
                    data-testid="register-gender-autre"
                  />
                  <span className="text-sm">Autre</span>
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Section 3: Adresse */}
        <fieldset className="mb-6">
          <legend className="text-base-semi mb-3 font-semibold">Adresse</legend>
          <div className="flex flex-col w-full gap-y-2">
            <div>
              <label
                htmlFor="address"
                className="block text-sm text-ui-fg-base mb-1"
              >
                Adresse
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                className="w-full px-4 py-2.5 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base focus:outline-none focus:border-ui-fg-interactive resize-none"
                placeholder="Numéro et nom de rue"
                data-testid="register-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-2">
              <Input
                label="Code postal"
                name="postal_code"
                pattern="[0-9]*"
                data-testid="register-postal-code"
              />
              <Input
                label="Ville"
                name="city"
                data-testid="register-city"
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm text-ui-fg-base mb-1"
              >
                Pays
              </label>
              <select
                id="country"
                name="country"
                className="w-full px-4 py-2.5 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base focus:outline-none focus:border-ui-fg-interactive"
                data-testid="register-country"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Section 4: Consentements */}
        <fieldset className="mb-4">
          <legend className="text-base-semi mb-3 font-semibold">
            Préférences
          </legend>
          <div className="flex flex-col gap-y-3">
            <label className="flex items-start gap-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="newsletter"
                className="mt-0.5 accent-ui-fg-interactive"
                data-testid="register-newsletter"
              />
              <span className="text-sm text-ui-fg-base">
                Je souhaite recevoir la newsletter ZotoShop
              </span>
            </label>
            <label className="flex items-start gap-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="terms"
                className="mt-0.5 accent-ui-fg-interactive"
                data-testid="register-terms"
              />
              <span className="text-sm text-ui-fg-base">
                J&apos;accepte les{" "}
                <LocalizedClientLink
                  href="/content/terms-of-use"
                  className="underline"
                >
                  Conditions Générales d&apos;Utilisation
                </LocalizedClientLink>{" "}
                et la{" "}
                <LocalizedClientLink
                  href="/content/privacy-policy"
                  className="underline"
                >
                  Politique de confidentialité
                </LocalizedClientLink>
                *
              </span>
            </label>
            {errors.terms && (
              <p
                className="text-rose-500 text-small-regular"
                data-testid="register-error-terms"
              >
                {errors.terms}
              </p>
            )}
          </div>
        </fieldset>

        <ErrorMessage error={message} data-testid="register-error" />

        <SubmitButton className="w-full mt-4" data-testid="register-submit">
          S&apos;inscrire
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Déjà membre ?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Se connecter
        </button>
        .
      </span>
    </div>
  )
}

export default Register
