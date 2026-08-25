import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  to: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'A closed agentic loop',
    to: '/architecture/overview',
    description: (
      <>
        KLIMA → VERO → ROSTR → GEAR → SHOVL → FLOW. Six specialized agents
        predict, plan, execute, communicate, and monetize field work, each
        feeding signal back into the next.
      </>
    ),
  },
  {
    title: 'One data contract, five repos',
    to: '/repos/overview',
    description: (
      <>
        Every agent reads and writes through NDS&apos;s Host-Component model
        with branded IDs — nobody hand-rolls a query against another
        domain&apos;s Firestore collections.
      </>
    ),
  },
  {
    title: 'Built by AI subagents',
    to: '/ai-agent-context/overview',
    description: (
      <>
        Each repo has a dedicated Claude Code subagent with a scoped
        mandate, coordinated by a Chief Architect that sequences work across
        repo boundaries.
      </>
    ),
  },
];

function Feature({title, to, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md">
        <Heading as="h3">
          <Link to={to}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
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
