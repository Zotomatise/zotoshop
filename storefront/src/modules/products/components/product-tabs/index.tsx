"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Informations produit",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Livraison & Retours",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const metadata = (product.metadata || {}) as Record<string, string>
  const countryOfOrigin = metadata.country_of_origin || product.origin_country || "-"
  const dimensions = metadata.dimensions || (product.length && product.width && product.height
    ? `${product.length}L x ${product.width}W x ${product.height}H`
    : "-")
  const weight = metadata.weight_display || (product.weight ? `${product.weight} g` : "-")

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Matériau</span>
            <p>{product.material || "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Pays d&apos;origine</span>
            <p>{countryOfOrigin}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Poids</span>
            <p>{weight}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>{dimensions}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Livraison rapide</span>
            <p className="max-w-sm">
              Votre colis arrivera sous 3 à 5 jours ouvrés à votre point de
              retrait ou directement chez vous.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Échanges simplifiés</span>
            <p className="max-w-sm">
              Le produit ne convient pas ? Pas de souci, nous l&apos;échangeons
              contre un nouveau.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Retours faciles</span>
            <p className="max-w-sm">
              Retournez simplement votre produit et nous vous rembourserons.
              Sans condition — nous ferons tout pour simplifier votre retour.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
