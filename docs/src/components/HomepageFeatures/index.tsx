import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
  imageSource: any;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Mindblowingly Fast',
    imageSource: require('@site/static/img/lightning-bolt.png').default,
    description: (
      <>
        Nitro Modules are built ontop of a highly optimized JSI foundation that
        handles caching and property lookup really well. Nitro is up to{' '}
        <b>55x faster</b> than ExpoModules and 15x faster than TurboModules.
      </>
    ),
  },
  {
    title: 'Statically Typed',
    imageSource: require('@site/static/img/dna.png').default,
    description: (
      <>
        Nitro's code-generator ("Nitrogen") statically generates{' '}
        <b>type-safe</b> C++/Swift/Kotlin types from your TypeScript interfaces.
        This way you'll never pass wrong types, nulls or undefined again!
      </>
    ),
  },
  {
    title: 'Powerful and Flexible',
    imageSource: require('@site/static/img/spring.png').default,
    description: (
      <>
        Similar to pure JavaScript objects, a "HybridObject" in Nitro can work
        with almost <b>all JavaScript types</b> such as primitives, typed- or
        untyped- objects, arrays and even variants or other native objects.
      </>
    ),
  },
];

function Feature({ title, imageSource, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={imageSource} className={styles.featureSvg} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3" className={styles.title}>
          {title}
        </Heading>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
