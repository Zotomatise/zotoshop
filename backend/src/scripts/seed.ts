import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["fr", "be", "ch", "de", "es", "it", "gb"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "eur",
          is_default: true,
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const regionModuleService = container.resolve(Modules.REGION);
  let region: any;
  const existingRegions = await regionModuleService.listRegions({ name: "Europe" });
  if (existingRegions.length > 0) {
    region = existingRegions[0];
    logger.info("Region 'Europe' already exists, skipping.");
  } else {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  try {
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  } catch (e: any) {
    logger.info("Tax regions already exist, skipping.");
  }
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const existingLocations = await stockLocationModuleService.listStockLocations({ name: "ZotoShop Warehouse Paris" });
  let stockLocation: any;
  if (existingLocations.length > 0) {
    stockLocation = existingLocations[0];
    logger.info("Stock location already exists, skipping.");
  } else {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "ZotoShop Warehouse Paris",
            address: {
              city: "Paris",
              country_code: "FR",
              address_1: "42 rue du Commerce",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          default_location_id: stockLocation.id,
        },
      },
    });

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  }

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({ name: "ZotoShop Livraison Europe" });
  const fulfillmentSet = existingFulfillmentSets.length > 0 ? existingFulfillmentSets[0] : await fulfillmentModuleService.createFulfillmentSets({
    name: "ZotoShop Livraison Europe",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  if (existingFulfillmentSets.length === 0) {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  }

  try {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 2-3 days.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 10,
            },
            {
              currency_code: "eur",
              amount: 10,
            },
            {
              region_id: region.id,
              amount: 10,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 24 hours.",
            code: "express",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 10,
            },
            {
              currency_code: "eur",
              amount: 10,
            },
            {
              region_id: region.id,
              amount: 10,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  } catch (e: any) {
    logger.info("Shipping options already exist, skipping.");
  }
  logger.info("Finished seeding fulfillment data.");

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (e: any) {
    logger.info("Sales channel already linked to stock location, skipping.");
  }
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (e: any) {
    logger.info("API key already linked to sales channel, skipping.");
  }
  logger.info("Finished seeding publishable API key data.");

  // Check if products already exist — skip seeding if so
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
  });

  if (existingProducts.length > 0) {
    logger.info(`Found ${existingProducts.length} existing products, skipping product seed.`);
  } else {
  logger.info("Seeding ZotoShop product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Smartphones", is_active: true },
        { name: "Laptops", is_active: true },
        { name: "Accessoires", is_active: true },
        { name: "Audio", is_active: true },
        { name: "Gaming", is_active: true },
      ],
    },
  });

  const getCatId = (name: string) =>
    categoryResult.find((cat) => cat.name === name)!.id;

  await createProductsWorkflow(container).run({
    input: {
      products: [
        // ─── SMARTPHONES ───
        {
          title: "ZotoPhone Pro 15",
          category_ids: [getCatId("Smartphones")],
          description: "Le smartphone ultime pour les professionnels. Ecran AMOLED 6.7 pouces, 256Go, double SIM, charge rapide 65W.",
          handle: "zotophone-pro-15",
          weight: 200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Stockage", values: ["128Go", "256Go", "512Go"] },
            { title: "Couleur", values: ["Noir", "Bleu", "Blanc"] },
          ],
          variants: [
            { title: "128Go / Noir", sku: "ZPHONE-128-BLK", options: { Stockage: "128Go", Couleur: "Noir" }, prices: [{ amount: 699, currency_code: "eur" }] },
            { title: "256Go / Noir", sku: "ZPHONE-256-BLK", options: { Stockage: "256Go", Couleur: "Noir" }, prices: [{ amount: 849, currency_code: "eur" }] },
            { title: "256Go / Bleu", sku: "ZPHONE-256-BLU", options: { Stockage: "256Go", Couleur: "Bleu" }, prices: [{ amount: 849, currency_code: "eur" }] },
            { title: "512Go / Blanc", sku: "ZPHONE-512-WHT", options: { Stockage: "512Go", Couleur: "Blanc" }, prices: [{ amount: 999, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "ZotoPhone Lite",
          category_ids: [getCatId("Smartphones")],
          description: "Un smartphone accessible et performant. Ecran 6.1 pouces, 64Go, batterie longue duree 5000mAh.",
          handle: "zotophone-lite",
          weight: 180,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Stockage", values: ["64Go", "128Go"] },
            { title: "Couleur", values: ["Vert", "Rose", "Noir"] },
          ],
          variants: [
            { title: "64Go / Vert", sku: "ZLITE-64-GRN", options: { Stockage: "64Go", Couleur: "Vert" }, prices: [{ amount: 299, currency_code: "eur" }] },
            { title: "64Go / Rose", sku: "ZLITE-64-PNK", options: { Stockage: "64Go", Couleur: "Rose" }, prices: [{ amount: 299, currency_code: "eur" }] },
            { title: "128Go / Noir", sku: "ZLITE-128-BLK", options: { Stockage: "128Go", Couleur: "Noir" }, prices: [{ amount: 379, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        // ─── LAPTOPS ───
        {
          title: "ZotoBook Air 14",
          category_ids: [getCatId("Laptops")],
          description: "Ultrabook leger pour le quotidien. Ecran 14 pouces IPS, processeur i5, 16Go RAM, SSD 512Go. Parfait pour les developpeurs.",
          handle: "zotobook-air-14",
          weight: 1300,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "RAM", values: ["8Go", "16Go", "32Go"] },
          ],
          variants: [
            { title: "8Go RAM", sku: "ZBOOK-AIR-8", options: { RAM: "8Go" }, prices: [{ amount: 799, currency_code: "eur" }] },
            { title: "16Go RAM", sku: "ZBOOK-AIR-16", options: { RAM: "16Go" }, prices: [{ amount: 999, currency_code: "eur" }] },
            { title: "32Go RAM", sku: "ZBOOK-AIR-32", options: { RAM: "32Go" }, prices: [{ amount: 1299, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "ZotoBook Pro 16",
          category_ids: [getCatId("Laptops")],
          description: "La bete de course pour les pros. Ecran 16 pouces 4K, processeur i9, GPU RTX 4060, 32Go RAM, SSD 1To.",
          handle: "zotobook-pro-16",
          weight: 2100,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Configuration", values: ["Standard", "Max"] },
          ],
          variants: [
            { title: "Standard (32Go/1To)", sku: "ZBOOK-PRO-STD", options: { Configuration: "Standard" }, prices: [{ amount: 1899, currency_code: "eur" }] },
            { title: "Max (64Go/2To)", sku: "ZBOOK-PRO-MAX", options: { Configuration: "Max" }, prices: [{ amount: 2499, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        // ─── ACCESSOIRES ───
        {
          title: "ZotoCoque Protection",
          category_ids: [getCatId("Accessoires")],
          description: "Coque de protection robuste pour ZotoPhone. Anti-choc, grip texture, compatible charge sans fil.",
          handle: "zotocoque",
          weight: 50,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Modele", values: ["Pro 15", "Lite"] },
            { title: "Couleur", values: ["Transparent", "Noir Mat", "Rouge"] },
          ],
          variants: [
            { title: "Pro 15 / Transparent", sku: "ZCOQUE-PRO-TRANS", options: { Modele: "Pro 15", Couleur: "Transparent" }, prices: [{ amount: 29, currency_code: "eur" }] },
            { title: "Pro 15 / Noir Mat", sku: "ZCOQUE-PRO-BLK", options: { Modele: "Pro 15", Couleur: "Noir Mat" }, prices: [{ amount: 29, currency_code: "eur" }] },
            { title: "Lite / Rouge", sku: "ZCOQUE-LITE-RED", options: { Modele: "Lite", Couleur: "Rouge" }, prices: [{ amount: 19, currency_code: "eur" }] },
            { title: "Lite / Transparent", sku: "ZCOQUE-LITE-TRANS", options: { Modele: "Lite", Couleur: "Transparent" }, prices: [{ amount: 19, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "ZotoCharge 65W",
          category_ids: [getCatId("Accessoires")],
          description: "Chargeur rapide USB-C 65W GaN. Compact, compatible laptop et smartphone. Double port.",
          handle: "zotocharge-65w",
          weight: 120,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Type", values: ["Simple (1 port)", "Double (2 ports)"] },
          ],
          variants: [
            { title: "Simple (1 port)", sku: "ZCHARGE-1P", options: { Type: "Simple (1 port)" }, prices: [{ amount: 39, currency_code: "eur" }] },
            { title: "Double (2 ports)", sku: "ZCHARGE-2P", options: { Type: "Double (2 ports)" }, prices: [{ amount: 59, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Cable USB-C ZotoLink",
          category_ids: [getCatId("Accessoires")],
          description: "Cable USB-C tresse haute qualite. Charge rapide 100W, transfert donnees 10Gbps.",
          handle: "cable-zotolink",
          weight: 40,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Longueur", values: ["1m", "2m", "3m"] },
          ],
          variants: [
            { title: "1m", sku: "ZCABLE-1M", options: { Longueur: "1m" }, prices: [{ amount: 15, currency_code: "eur" }] },
            { title: "2m", sku: "ZCABLE-2M", options: { Longueur: "2m" }, prices: [{ amount: 19, currency_code: "eur" }] },
            { title: "3m", sku: "ZCABLE-3M", options: { Longueur: "3m" }, prices: [{ amount: 24, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        // ─── AUDIO ───
        {
          title: "ZotoBuds Pro",
          category_ids: [getCatId("Audio")],
          description: "Ecouteurs sans fil avec ANC (reduction de bruit active). Autonomie 8h + 24h avec boitier. Bluetooth 5.3.",
          handle: "zotobuds-pro",
          weight: 60,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Couleur", values: ["Noir", "Blanc", "Bleu Nuit"] },
          ],
          variants: [
            { title: "Noir", sku: "ZBUDS-BLK", options: { Couleur: "Noir" }, prices: [{ amount: 129, currency_code: "eur" }] },
            { title: "Blanc", sku: "ZBUDS-WHT", options: { Couleur: "Blanc" }, prices: [{ amount: 129, currency_code: "eur" }] },
            { title: "Bleu Nuit", sku: "ZBUDS-BLU", options: { Couleur: "Bleu Nuit" }, prices: [{ amount: 139, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "ZotoSpeaker Boom",
          category_ids: [getCatId("Audio")],
          description: "Enceinte bluetooth portable. Son 360 degres, etanche IP67, autonomie 12h. Parfaite pour l'exterieur.",
          handle: "zotospeaker-boom",
          weight: 550,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Couleur", values: ["Gris", "Orange", "Vert Foret"] },
          ],
          variants: [
            { title: "Gris", sku: "ZSPEAK-GRY", options: { Couleur: "Gris" }, prices: [{ amount: 89, currency_code: "eur" }] },
            { title: "Orange", sku: "ZSPEAK-ORG", options: { Couleur: "Orange" }, prices: [{ amount: 89, currency_code: "eur" }] },
            { title: "Vert Foret", sku: "ZSPEAK-GRN", options: { Couleur: "Vert Foret" }, prices: [{ amount: 89, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        // ─── GAMING ───
        {
          title: "ZotoPad Controller",
          category_ids: [getCatId("Gaming")],
          description: "Manette gaming sans fil. Compatible PC, mobile, console. Vibration HD, gyroscope, autonomie 20h.",
          handle: "zotopad-controller",
          weight: 280,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Couleur", values: ["Noir Carbon", "Blanc Arctique", "Rouge Rubis"] },
          ],
          variants: [
            { title: "Noir Carbon", sku: "ZPAD-BLK", options: { Couleur: "Noir Carbon" }, prices: [{ amount: 69, currency_code: "eur" }] },
            { title: "Blanc Arctique", sku: "ZPAD-WHT", options: { Couleur: "Blanc Arctique" }, prices: [{ amount: 69, currency_code: "eur" }] },
            { title: "Rouge Rubis", sku: "ZPAD-RED", options: { Couleur: "Rouge Rubis" }, prices: [{ amount: 79, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "ZotoScreen 27 QHD",
          category_ids: [getCatId("Gaming")],
          description: "Ecran gaming 27 pouces QHD 165Hz. Temps de reponse 1ms, HDR400, FreeSync Premium.",
          handle: "zotoscreen-27",
          weight: 5500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Dalle", values: ["IPS", "VA"] },
          ],
          variants: [
            { title: "IPS 165Hz", sku: "ZSCREEN-IPS", options: { Dalle: "IPS" }, prices: [{ amount: 349, currency_code: "eur" }] },
            { title: "VA 144Hz", sku: "ZSCREEN-VA", options: { Dalle: "VA" }, prices: [{ amount: 279, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "ZotoMouse Precision",
          category_ids: [getCatId("Gaming")],
          description: "Souris gaming ultra-legere 58g. Capteur 26000 DPI, switches optiques, cable paracord.",
          handle: "zotomouse-precision",
          weight: 58,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            { title: "Connexion", values: ["Filaire", "Sans fil"] },
          ],
          variants: [
            { title: "Filaire", sku: "ZMOUSE-WIRE", options: { Connexion: "Filaire" }, prices: [{ amount: 49, currency_code: "eur" }] },
            { title: "Sans fil", sku: "ZMOUSE-WIFI", options: { Connexion: "Sans fil" }, prices: [{ amount: 79, currency_code: "eur" }] },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });
  logger.info("Finished seeding ZotoShop product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
  } // end of product seed block

  // ============================================
  // SEED TEST USERS FOR QA TRAINING
  // ============================================
  logger.info("Seeding test users for QA training...");

  const authModuleService = container.resolve(Modules.AUTH);
  const customerModuleService = container.resolve(Modules.CUSTOMER);

  const testUsers = [
    { email: "standard_user@zotoshop.com", first_name: "Standard", last_name: "User" },
    { email: "locked_out_user@zotoshop.com", first_name: "Locked", last_name: "User" },
    { email: "slow_user@zotoshop.com", first_name: "Slow", last_name: "User" },
    { email: "error_user@zotoshop.com", first_name: "Error", last_name: "User" },
    { email: "visual_user@zotoshop.com", first_name: "Visual", last_name: "User" },
  ];

  for (const user of testUsers) {
    try {
      // Check if customer already exists
      let customer: any = null;
      const existing = await customerModuleService.listCustomers({ email: user.email });
      if (existing.length > 0) {
        customer = existing[0];
        logger.info(`Customer ${user.email} already exists (id: ${customer.id}).`);
      } else {
        customer = await customerModuleService.createCustomers({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          has_account: true,
        });
        logger.info(`Created customer: ${user.email}`);
      }

      // Delete existing auth identity (if any) to recreate cleanly
      try {
        const providerIdentities = await authModuleService.listProviderIdentities({
          entity_id: user.email,
          provider: "emailpass",
        });
        if (providerIdentities.length > 0) {
          const oldAuthId = providerIdentities[0].auth_identity_id!;
          logger.info(`Deleting old auth identity for ${user.email}: ${oldAuthId}`);
          await authModuleService.deleteAuthIdentities([oldAuthId]);
        }
      } catch (e: any) {
        logger.info(`Cleanup for ${user.email}: ${e.message}`);
      }

      // Register auth identity via emailpass provider (hashes password with scrypt)
      const registerResult = await authModuleService.register("emailpass", {
        body: { email: user.email, password: "password123" },
      });

      if (registerResult.success && registerResult.authIdentity) {
        const authIdentityId = registerResult.authIdentity.id;
        logger.info(`Registered auth for ${user.email}: ${authIdentityId}`);

        // Link auth identity to customer via app_metadata.customer_id
        await authModuleService.updateAuthIdentities({
          id: authIdentityId,
          app_metadata: { customer_id: customer.id },
        });
        logger.info(`Linked auth(${authIdentityId}) → customer(${customer.id}) for ${user.email}`);
      } else {
        logger.info(`Register FAILED for ${user.email}: ${registerResult.error}`);
      }
    } catch (error: any) {
      logger.info(`Error with test user ${user.email}: ${error.message}`);
    }
  }

  logger.info("Finished seeding test users.");
}
