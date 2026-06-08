import React from 'react';
import styles from './styles.module.css';

type App = {
  name: string;
  company: string;
  scale: string;
  category: string;
  icon?: string;
  accent: string;
  featured?: boolean;
};

const apps: App[] = [
  {
    name: 'Discord',
    company: 'Discord Inc.',
    scale: '500M+ installs',
    category: 'Social',
    icon: 'https://play-lh.googleusercontent.com/0oO5sAneb9lJP6l8c6DH4aj6f85qNpplQVHmPmbbBxAukDnlO7DarDW0b-kEIHa8SQ',
    accent: '#5865f2',
    featured: true,
  },
  {
    name: 'PlayStation App',
    company: 'PlayStation Mobile Inc.',
    scale: '100M+ installs',
    category: 'Gaming',
    icon: 'https://play-lh.googleusercontent.com/zi6QgTtIiAnGqQMizfoj2LnE85kzHyZlgTruSzJ7Zw_79NAmB3fhxuDegwxby7P0yw',
    accent: '#006fcd',
    featured: true,
  },
  {
    name: 'Xbox',
    company: 'Microsoft Corporation',
    scale: '100M+ installs',
    category: 'Gaming',
    icon: 'https://play-lh.googleusercontent.com/zARzhQw-V25X6KCiciynwWtlzOfaS41kx2rZYecxPoY5Z248n-d3lyotuKL0fJYLEvQQ40QNsx8J2VSm2G7RjA',
    accent: '#107c10',
    featured: true,
  },
  {
    name: 'Zalando',
    company: 'Zalando SE',
    scale: '100M+ installs',
    category: 'Commerce',
    icon: 'https://play-lh.googleusercontent.com/Iwk_bPilB4vXqMjXVX1aYD3yhihBzpGuVm3bEqPRcuX-Mz0sQJmN3ukpooXpL_lXoQ',
    accent: '#ff6900',
    featured: true,
  },
  {
    name: 'Zepto',
    company: 'Zepto Marketplace Private Limited',
    scale: '100M+ installs',
    category: 'Commerce',
    icon: 'https://play-lh.googleusercontent.com/jrtmMFv4qjtgMPQeaQzUFZ3EYBkHd_8OFYl6O1Ngt5Pey52RJAR4u8K4IoPILkJz76a7s5U3DNaY3r3xnl7t8X4',
    accent: '#45227c',
    featured: true,
  },
  {
    name: 'Coinbase',
    company: 'Coinbase Inc.',
    scale: '50M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
    accent: '#0052ff',
    featured: true,
  },
  {
    name: 'MetaMask',
    company: 'MetaMask Web3 Wallet',
    scale: '10M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/7QXUoW9QGYGgWZT5i67yuDiWKC9t4D9BOfT-NSSw1o_0tPMBbv5jq2o-KOZlF_MWgA_w1idVpET8j-M_zFkU',
    accent: '#f6851b',
  },
  {
    name: 'Shopify',
    company: 'Shopify Inc.',
    scale: '10M+ installs',
    category: 'Commerce',
    icon: 'https://play-lh.googleusercontent.com/PLiiyY4mk3jTy7XxZj9FGvztn12qdefPWJtxDfpBCvPUt4PBdhdjiQPJ5EbgeAZZLw',
    accent: '#95bf47',
  },
  {
    name: 'Sonic',
    company: 'Sonic Industries Services, Inc.',
    scale: '10M+ installs',
    category: 'Food',
    icon: 'https://play-lh.googleusercontent.com/BprNXPQjtfbURMKfsoE4f1PR015ViN8KVSFCJ_trcQBoXhezruhe4UaF2ZhvmMX-59o',
    accent: '#f4d21f',
  },
  {
    name: 'Starlink',
    company: 'Space Exploration Technologies Corp.',
    scale: '10M+ installs',
    category: 'Connectivity',
    icon: 'https://play-lh.googleusercontent.com/5qA3NMVbVvvprSXwq_Xc87I664Bf2xK8BxY8TjZFvGWKlR53uJWN3YwP8UpNCMjUCFhTwzalW5k9Hj7EqXm4RVA',
    accent: '#4a5568',
  },
  {
    name: 'Urban Company',
    company: 'Urban Company',
    scale: '10M+ installs',
    category: 'Services',
    icon: 'https://play-lh.googleusercontent.com/axx68Ova4QcYBxfuXy5MQQpW2WUd_XbQtqkHLZewNn4II1Imkr8yc5UL9HwP80XS35o',
    accent: '#6d4aff',
  },
  {
    name: 'Affirm',
    company: 'Affirm, Inc.',
    scale: '10M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/RQT93evGkOBQXqvPj9tkma1XUk_y8BXmX_MPFDO9hmE3Ko5URslbIPzz-gsmLcPFn7j6OgXLnPRu_1UgyuCHoA',
    accent: '#4a4af4',
  },
  {
    name: 'Base',
    company: 'Coinbase Wallet',
    scale: '10M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/EzgUgulJb5ul-ed3SiXCyK6J22LD9vcEI1xo6INYI4Jd64LGQ7eubZkpeDclqHEM83A',
    accent: '#0052ff',
  },
  {
    name: 'Bloomberg',
    company: 'Bloomberg LP CM',
    scale: '10M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/WYBbOFxImmxXuQ-OQGT2ANSg8Hc7GuxCnYCpvXe8JeVnVOiPlwGr7yfpISlp7HvQcS8',
    accent: '#111111',
  },
  {
    name: 'Bluesky',
    company: 'Bluesky PBLLC',
    scale: '10M+ installs',
    category: 'Social',
    icon: 'https://play-lh.googleusercontent.com/54eUk_UXr65meQqoOIMXAnuNIyLOuznb-Ad19ZytLq7nBqSaeF0fefspnZkDSKbbZASMSpKaAUCSGD_c0eliSRM',
    accent: '#1185fe',
  },
  {
    name: 'HelloFresh',
    company: 'HelloFresh SE',
    scale: '10M+ installs',
    category: 'Food',
    icon: 'https://play-lh.googleusercontent.com/JYdCS8st6m86qcQj6zeECRU-0RSK16i429ae9i7bNAF8YLz97RAO45FYupRRymvsZbO0EBrBKvDcASO0edZPNyA',
    accent: '#5c8f22',
  },
  {
    name: 'Spaces',
    company: 'Wix.com, Inc.',
    scale: '10M+ installs',
    category: 'Business',
    icon: 'https://play-lh.googleusercontent.com/3BgaiAGHRfSDkDHQb_KYdV49nF5t7ZfmPS-8bd0nVcy0rkY0yJHRMG-NVZolfkDIgJTX',
    accent: '#116dff',
  },
  {
    name: "Arby's",
    company: "Arby's Restaurant Group, Inc.",
    scale: '5M+ installs',
    category: 'Food',
    icon: 'https://play-lh.googleusercontent.com/8X7S4S5_vUnPQ7oAu-UvV2fwNpBQiO6_qt_Y4EBxX0nW5jRT59r0_Ol5Cn9e_vMVPNs',
    accent: '#b12634',
  },
  {
    name: 'Buffalo Wild Wings',
    company: 'Buffalo Wild Wings, Inc.',
    scale: '5M+ installs',
    category: 'Food',
    icon: 'https://play-lh.googleusercontent.com/jLKCdJXdn0yx__qa0iknvMls4nwvnthThX6b8CEOI34A3VBh54ZCu1NlGJAAWabt6tE',
    accent: '#f7b500',
  },
  {
    name: 'Picnic',
    company: 'Picnic Technologies B.V.',
    scale: '5M+ installs',
    category: 'Commerce',
    icon: 'https://play-lh.googleusercontent.com/tP_lMPgF6jnx0RNCenZm6qzCy0VWK747QZQUSxjugn1END4KTLXJzgw8XlrndGrfKnFbKZNH10-mhUnyN6TgKDc',
    accent: '#e52320',
  },
  {
    name: 'PUMA',
    company: 'PUMA SE',
    scale: '5M+ installs',
    category: 'Commerce',
    icon: 'https://play-lh.googleusercontent.com/HbAETPY7O6QoY0Y0Zp2d6wUgtSY4L1dTyUYZB2gqLlWAcsrrdhvHjVBUDrk2Uol8SfQ',
    accent: '#111111',
  },
  {
    name: 'Kraken',
    company: 'Payward, Inc.',
    scale: '5M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/G-mTJMGsq2k6jzWzhW9DpPQ_shO6wjoQOyLxFdHrzEbuUDsk1XZqYFlmLq6aA-yev7k',
    accent: '#5741d9',
  },
  {
    name: 'AutoZone',
    company: 'AutoZone, Inc.',
    scale: '5M+ installs',
    category: 'Commerce',
    icon: 'https://play-lh.googleusercontent.com/qMwdQAO4vILU6cM0F_v2voKPOkuH7VmtxD-CXHrzOYHUIK7HOVjBXQg5xaYLXQOogSx1',
    accent: '#f36f21',
  },
  {
    name: 'Enterprise',
    company: 'EAN Services, LLC',
    scale: '5M+ installs',
    category: 'Travel',
    icon: 'https://play-lh.googleusercontent.com/SkZ_0N5KVeNSpYWvgUPhKPrbHa4o504S6XHsOVNcyaZQuRVds5Pk-3qAus5g-FQfnQk',
    accent: '#169b62',
  },
  {
    name: 'Wix',
    company: 'Wix.com, Inc.',
    scale: '5M+ installs',
    category: 'Business',
    icon: 'https://play-lh.googleusercontent.com/EbdHNp8uMZcyzHqqf6IxkqYaUf0QjMzJyNOk33qEsrjf0_vVCPKq4QbOCjJx7jZ3LCs',
    accent: '#116dff',
  },
  {
    name: 'Expensify',
    company: 'Expensify Inc.',
    scale: '1M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/qk_tP7kxV-wfeqqMrY51ltXBGSprzyMWC9O95wpGz1aMsKijjWPT_v7aL8ymz3rYz5g',
    accent: '#36d36f',
  },
  {
    name: 'Ledger',
    company: 'Ledger',
    scale: '1M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/mHjR3KaAMw3RGA15-t8gXNAy_Onr4ZYUQ07Z9fG2vd51IXO5rd7wtdqEWbNMPTgdqrk',
    accent: '#111111',
  },
  {
    name: 'National',
    company: 'EAN Services, LLC',
    scale: '1M+ installs',
    category: 'Travel',
    icon: 'https://play-lh.googleusercontent.com/i59CoaCC-QhWuMiqt9K1slXYNHIYKT3j1OAl_HSX3YHM7fNd1Ex8kr8cBN7E0gwEKX2V',
    accent: '#17783d',
  },
  {
    name: 'Gemini',
    company: 'Gemini Space Station, Inc.',
    scale: '1M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/94WeEFfCBINrvpKxGB4YkR6-yau-aCx4PZVivlDDFbdPOajiwJ-E7ew3gC9WfsYiHmfvwFRfQATzPOBKzJGQIA',
    accent: '#00dcfa',
  },
  {
    name: 'Sleeper',
    company: 'Blitz Studios, Inc.',
    scale: '1M+ installs',
    category: 'Sports',
    icon: 'https://play-lh.googleusercontent.com/665BCAjC-zqlHf1gt9GAKS6HJIT35yvK_j-KLByPYNc60F4AHWSkuiXMEYFvsrD7cB8C_gypCaRS_d6FOlyjUA',
    accent: '#111111',
  },
  {
    name: 'Status',
    company: 'Status Research and Development GmbH',
    scale: '1M+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/-sQOKSPTDDGrLwyMMgTbSKY5AAI-X4PMx6YYYsVNJxSD9-ejcwvT9dFfGF1qoAqncO86eI2g0yBoTTycHb5jgw',
    accent: '#4360df',
  },
  {
    name: 'SnapCalorie',
    company: 'Perception Labs, Inc.',
    scale: '500K+ installs',
    category: 'Health',
    icon: 'https://play-lh.googleusercontent.com/PzOt2l1BO7-LM2eYQ28D7qRfiEun85sZJTbQEVAOE7hM8cXSaFcdZo_k3ldJxmXkMg',
    accent: '#ff6250',
  },
  {
    name: 'Extra',
    company: 'The Aligned Company',
    scale: '100K+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/XgHxX8awDbhtBrjPbeYFoRAJyqiUhf7csBM_tCqeQvawk5NLJbKOH5mBxznjg0u94Xc',
    accent: '#111111',
  },
  {
    name: 'MyGroove',
    company: 'MyGroove',
    scale: '10K+ installs',
    category: 'Music',
    icon: 'https://play-lh.googleusercontent.com/PShRNXBEnOjt1BfV_soaC8FiDeA6-TxjcK4E54j1-zpLojrDVbSvXVqRQh88niekTdaG',
    accent: '#ff8a00',
  },
  {
    name: 'Omni',
    company: 'Omni Wallet',
    scale: '10K+ installs',
    category: 'Finance',
    icon: 'https://play-lh.googleusercontent.com/sUr9dkfBcp54A2X-a7EpF61QGXGwIceUeyWVE5CVPONGuN_a7w-WMnKAKWx2qydh7bqvLjyXfy9p3QT-9_NQO2w',
    accent: '#62db73',
  },
  {
    name: 'ScribeWare',
    company: 'ScribeWare',
    scale: '1K+ installs',
    category: 'Productivity',
    icon: 'https://play-lh.googleusercontent.com/7xQqxFS5mZCPRtl3cNHR57ttWwzOnEKhOQ66STA8HvQ4e7PL-hF4t4DKT5jU0txhlIY',
    accent: '#3484ff',
  },
  {
    name: 'Klarna',
    company: 'Klarna Bank AB',
    scale: 'iOS app',
    category: 'Finance',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e7/1b/05/e71b05f7-32cb-57f7-5cc1-a83e057b901b/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg',
    accent: '#ffb3c7',
  },
  {
    name: 'Showtime',
    company: 'Showtime',
    scale: 'Public app',
    category: 'Social',
    accent: '#dd2a7b',
  },
  {
    name: 'Steddy',
    company: 'Steddy',
    scale: 'Public app',
    category: 'Lifestyle',
    accent: '#27b47e',
  },
];

function AppIcon({ app, size }: { app: App; size: 'large' | 'small' }) {
  const initials = app.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${styles.iconFrame} ${size === 'large' ? styles.iconLarge : styles.iconSmall}`}
      style={{ '--app-accent': app.accent } as React.CSSProperties}
      aria-hidden="true"
    >
      {app.icon == null ? (
        <span className={styles.iconFallback}>{initials}</span>
      ) : (
        <img src={app.icon} alt="" loading="lazy" />
      )}
    </div>
  );
}

function FeaturedAppCard({ app }: { app: App }) {
  return (
    <article
      className={styles.featuredCard}
      style={{ '--app-accent': app.accent } as React.CSSProperties}
    >
      <AppIcon app={app} size="large" />
      <div className={styles.cardBody}>
        <span className={styles.appCategory}>{app.category}</span>
        <h3>{app.name}</h3>
        <p>{app.company}</p>
        <span className={styles.scaleBadge}>{app.scale}</span>
      </div>
    </article>
  );
}

function AppCard({ app }: { app: App }) {
  return (
    <article
      className={styles.appCard}
      style={{ '--app-accent': app.accent } as React.CSSProperties}
    >
      <AppIcon app={app} size="small" />
      <div className={styles.compactBody}>
        <h3>{app.name}</h3>
        <p>{app.company}</p>
      </div>
      <span className={styles.compactScale}>{app.scale}</span>
    </article>
  );
}

export default function AppsUsingNitroShowcase() {
  const featuredApps = apps.filter((app) => app.featured);
  const regularApps = apps.filter((app) => !app.featured);

  return (
    <section className={styles.showcase}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Production ready</span>
          <h2>Nitro is already running inside apps people use every day.</h2>
          <p>
            From social networks and finance to commerce, travel, food, music, and
            creator tools, Nitro powers native code paths in real production apps.
          </p>
        </div>
        <div className={styles.statsGrid} aria-label="Nitro production usage stats">
          <div>
            <strong>18M+</strong>
            <span>npm downloads</span>
          </div>
          <div>
            <strong>1B+</strong>
            <span>combined public app install counts</span>
          </div>
          <div>
            <strong>10+</strong>
            <span>product categories</span>
          </div>
        </div>
      </div>

      <div className={styles.featuredGrid}>
        {featuredApps.map((app) => (
          <FeaturedAppCard key={app.name} app={app} />
        ))}
      </div>

      <div className={styles.appGrid}>
        {regularApps.map((app) => (
          <AppCard key={app.name} app={app} />
        ))}
      </div>

      <p className={styles.note}>
        Based on public app data and public native symbols. App names and icons belong
        to their respective owners; no affiliation or endorsement is implied.
      </p>
    </section>
  );
}
