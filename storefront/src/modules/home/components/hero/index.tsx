import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 small:p-32 gap-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-white/80 font-medium tracking-wide">
            Application de test QA
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Heading
            level="h1"
            className="text-4xl small:text-6xl leading-tight text-white font-bold tracking-tight"
          >
            Bienvenue sur{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              ZotoShop
            </span>
          </Heading>
          <p className="text-lg small:text-xl text-white/60 font-normal max-w-2xl mx-auto">
            Votre boutique tech de test — conçue pour pratiquer
            l&apos;automatisation de test avec Zotomatise Labs
          </p>
        </div>

        <div className="flex flex-col small:flex-row gap-4 mt-4">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-slate-900 font-semibold text-base hover:bg-white/90 transition-colors"
          >
            Découvrir nos produits
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-colors"
          >
            Créer un compte
          </LocalizedClientLink>
        </div>

        <div className="flex items-center gap-8 mt-8 text-white/40 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">12</span>
            <span>Produits</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">5</span>
            <span>Catégories</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">100%</span>
            <span>Gratuit</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
