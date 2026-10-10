import RoadmapGenerator from '@/components/generator/RoadmapGenerator';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'Career Generator — PATHORA',
  description: 'Reverse-engineer your dream job into an adaptive, personalized technical career roadmap.',
};

export default function GeneratorPage() {
  return (
    <AppShell>
      <RoadmapGenerator />
    </AppShell>
  );
}

