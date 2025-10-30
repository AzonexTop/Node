import { Button, Card } from '@repo/ui';
import { formatDate } from '@repo/shared';

export default function Home() {
  const today = formatDate(new Date());

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Welcome to the Monorepo</h1>
      <p>Today is {today}</p>
      
      <Card title="Getting Started">
        <p>This is a Next.js application using shared components and utilities.</p>
        <Button variant="primary" onClick={() => alert('Button clicked!')}>
          Click Me
        </Button>
      </Card>
    </main>
  );
}
