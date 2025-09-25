import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import ThemedImage from '@theme/ThemedImage';
import styles from './index.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';

const Icon = require('@site/static/img/nos.png').default;

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('', styles.heroBanner)}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContentContainer}>
          <img className={styles.heroIcon} src={Icon} />
          <ThemedImage
            className={styles.heroLogo}
            alt="Nitrous Logo"
            sources={{
              light: useBaseUrl('/img/logo.svg'),
              dark: useBaseUrl('/img/logo-dark.svg'),
            }}
          />
          <p className="hero__subtitle">{siteConfig.tagline}</p>

          <Link to="/docs/what-is-nitro" className={styles.heroButton}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): React.ReactElement {
  return (
    <Layout
      title="Welcome to Nitro!"
      description="A framework to build mindblowingly fast native modules with type-safe statically compiled JS bindings."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
