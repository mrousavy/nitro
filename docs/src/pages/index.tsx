import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

const Icon = require('@site/static/img/nos.png').default;
const Logo = require('@site/static/img/logo.svg').default;

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('', styles.heroBanner)}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContentContainer}>
          <img className={styles.heroIcon} src={Icon} />
          <Logo className={styles.heroLogo} />
          <p className="hero__subtitle">{siteConfig.tagline}</p>

          <Link to="/docs/what-is-nitro" className={styles.heroButton}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Welcome to Nitro!"
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
