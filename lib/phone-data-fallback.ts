// Fallback phone data for when API is unavailable
export const FALLBACK_BRANDS = [
  { brand_name: 'Apple', brand_slug: 'apple' },
  { brand_name: 'Samsung', brand_slug: 'samsung' },
  { brand_name: 'Xiaomi', brand_slug: 'xiaomi' },
  { brand_name: 'Oppo', brand_slug: 'oppo' },
  { brand_name: 'Vivo', brand_slug: 'vivo' },
  { brand_name: 'Infinix', brand_slug: 'infinix' },
  { brand_name: 'Tecno', brand_slug: 'tecno' },
  { brand_name: 'Nokia', brand_slug: 'nokia' },
  { brand_name: 'Realme', brand_slug: 'realme' },
  { brand_name: 'OnePlus', brand_slug: 'oneplus' },
]

export const FALLBACK_MODELS: Record<string, Array<{ phone_name: string; slug: string }>> = {
  apple: [
    { phone_name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max' },
    { phone_name: 'iPhone 15 Pro', slug: 'iphone-15-pro' },
    { phone_name: 'iPhone 15', slug: 'iphone-15' },
    { phone_name: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max' },
    { phone_name: 'iPhone 14', slug: 'iphone-14' },
    { phone_name: 'iPhone 13', slug: 'iphone-13' },
  ],
  samsung: [
    { phone_name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra' },
    { phone_name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24' },
    { phone_name: 'Samsung Galaxy S23 FE', slug: 'samsung-galaxy-s23-fe' },
    { phone_name: 'Samsung Galaxy A55', slug: 'samsung-galaxy-a55' },
    { phone_name: 'Samsung Galaxy A35', slug: 'samsung-galaxy-a35' },
    { phone_name: 'Samsung Galaxy Z Fold 5', slug: 'samsung-galaxy-z-fold-5' },
  ],
  xiaomi: [
    { phone_name: 'Xiaomi 14 Pro', slug: 'xiaomi-14-pro' },
    { phone_name: 'Xiaomi 13T Pro', slug: 'xiaomi-13t-pro' },
    { phone_name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13-pro' },
    { phone_name: 'Xiaomi Redmi Note 12', slug: 'xiaomi-redmi-note-12' },
    { phone_name: 'Xiaomi Poco X6', slug: 'xiaomi-poco-x6' },
  ],
  oppo: [
    { phone_name: 'Oppo Find X6 Pro', slug: 'oppo-find-x6-pro' },
    { phone_name: 'Oppo Reno 11 Pro', slug: 'oppo-reno-11-pro' },
    { phone_name: 'Oppo A78', slug: 'oppo-a78' },
  ],
  vivo: [
    { phone_name: 'Vivo X100 Pro', slug: 'vivo-x100-pro' },
    { phone_name: 'Vivo V29', slug: 'vivo-v29' },
    { phone_name: 'Vivo Y100', slug: 'vivo-y100' },
  ],
  infinix: [
    { phone_name: 'Infinix Note 30 Pro', slug: 'infinix-note-30-pro' },
    { phone_name: 'Infinix Hot 30', slug: 'infinix-hot-30' },
    { phone_name: 'Infinix Zero 30', slug: 'infinix-zero-30' },
  ],
  tecno: [
    { phone_name: 'Tecno Camon 20 Pro', slug: 'tecno-camon-20-pro' },
    { phone_name: 'Tecno Spark 10 Pro', slug: 'tecno-spark-10-pro' },
    { phone_name: 'Tecno Phantom X2', slug: 'tecno-phantom-x2' },
  ],
  nokia: [
    { phone_name: 'Nokia G60', slug: 'nokia-g60' },
    { phone_name: 'Nokia X30', slug: 'nokia-x30' },
  ],
  realme: [
    { phone_name: 'Realme 12 Pro+', slug: 'realme-12-pro-plus' },
    { phone_name: 'Realme GT 5', slug: 'realme-gt-5' },
    { phone_name: 'Realme C55', slug: 'realme-c55' },
  ],
  oneplus: [
    { phone_name: 'OnePlus 12', slug: 'oneplus-12' },
    { phone_name: 'OnePlus 11', slug: 'oneplus-11' },
    { phone_name: 'OnePlus Nord 3', slug: 'oneplus-nord-3' },
  ],
}

export const FALLBACK_SPECS: Record<string, any> = {
  'iphone-15-pro-max': {
    phone_name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    specifications: [
      {
        title: 'Display',
        specs: [
          { key: 'Size', val: ['6.7 inches', 'Super Retina XDR OLED'] },
          { key: 'Resolution', val: ['1290 x 2796 pixels'] },
        ],
      },
      {
        title: 'Platform',
        specs: [
          { key: 'OS', val: ['iOS 17'] },
          { key: 'CPU', val: ['A17 Pro chip'] },
        ],
      },
      {
        title: 'Memory',
        specs: [
          { key: 'Internal', val: ['256GB 8GB RAM', '512GB 8GB RAM', '1TB 8GB RAM'] },
        ],
      },
      {
        title: 'Main Camera',
        specs: [
          { key: 'Triple', val: ['48MP (wide)', '12MP (telephoto)', '12MP (ultrawide)'] },
        ],
      },
      {
        title: 'Battery',
        specs: [
          { key: 'Type', val: ['Li-Ion 4422 mAh'] },
          { key: 'Charging', val: ['27W wired', '15W MagSafe wireless'] },
        ],
      },
    ],
  },
  'samsung-galaxy-s24-ultra': {
    phone_name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    specifications: [
      {
        title: 'Display',
        specs: [
          { key: 'Size', val: ['6.8 inches', 'Dynamic AMOLED 2X'] },
          { key: 'Resolution', val: ['1440 x 3120 pixels'] },
        ],
      },
      {
        title: 'Platform',
        specs: [
          { key: 'OS', val: ['Android 14'] },
          { key: 'CPU', val: ['Snapdragon 8 Gen 3'] },
        ],
      },
      {
        title: 'Memory',
        specs: [
          { key: 'Internal', val: ['256GB 12GB RAM', '512GB 12GB RAM', '1TB 12GB RAM'] },
        ],
      },
      {
        title: 'Main Camera',
        specs: [
          { key: 'Quad', val: ['200MP (wide)', '50MP (periscope)', '10MP (telephoto)', '12MP (ultrawide)'] },
        ],
      },
      {
        title: 'Battery',
        specs: [
          { key: 'Type', val: ['Li-Ion 5000 mAh'] },
          { key: 'Charging', val: ['45W wired', '15W wireless'] },
        ],
      },
    ],
  },
  'xiaomi-13t-pro': {
    phone_name: 'Xiaomi 13T Pro',
    brand: 'Xiaomi',
    specifications: [
      {
        title: 'Display',
        specs: [
          { key: 'Size', val: ['6.67 inches', 'AMOLED'] },
          { key: 'Resolution', val: ['1220 x 2712 pixels'] },
        ],
      },
      {
        title: 'Platform',
        specs: [
          { key: 'OS', val: ['Android 13, MIUI 14'] },
          { key: 'CPU', val: ['MediaTek Dimensity 9200+'] },
        ],
      },
      {
        title: 'Memory',
        specs: [
          { key: 'Internal', val: ['256GB 12GB RAM', '512GB 12GB RAM'] },
        ],
      },
      {
        title: 'Main Camera',
        specs: [
          { key: 'Triple', val: ['50MP (wide)', '50MP (telephoto)', '12MP (ultrawide)'] },
        ],
      },
      {
        title: 'Battery',
        specs: [
          { key: 'Type', val: ['Li-Po 5000 mAh'] },
          { key: 'Charging', val: ['120W wired'] },
        ],
      },
    ],
  },
}

