import Header from '@/components/layout/Header';
import StudyGrid from '@/components/study/StudyGrid';
import { mockUsers } from '@/lib/mock-data';
import ControlPanel from '@/components/controls/ControlPanel';
import ClientOnly from '@/components/ClientOnly';

export default function StudyTogetherPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto pt-24 pb-12 px-4">
        <div className="grid grid-cols-1">
          <div className="lg:col-span-2">
            <StudyGrid users={mockUsers} />
          </div>
        </div>
      </main>
      <ClientOnly>
        <ControlPanel leaderboardUsers={mockUsers} />
      </ClientOnly>
    </div>
  );
}
