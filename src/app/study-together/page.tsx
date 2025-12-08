import Header from '@/components/layout/Header';
import StudyGrid from '@/components/study/StudyGrid';

const mockUsers = [
  { id: 1, name: 'Alex', avatarImageId: 'user-avatar-1', studyTime: 4 * 60 + 25 }, // 4h 25m
  { id: 2, name: 'Brenda', avatarImageId: 'user-avatar-2', studyTime: 3 * 60 + 50 }, // 3h 50m
  { id: 3, name: 'Charlie', avatarImageId: 'user-avatar-3', studyTime: 3 * 60 + 15 },
  { id: 4, name: 'Diana', avatarImageId: 'user-avatar-4', studyTime: 2 * 60 + 30 },
  { id: 5, name: 'Ethan', avatarImageId: 'user-avatar-5', studyTime: 2 * 60 + 5 },
  { id: 6, name: 'Fiona', avatarImageId: 'user-avatar-6', studyTime: 1 * 60 + 45 },
  { id: 7, name: 'George', avatarImageId: 'user-avatar-7', studyTime: 1 * 60 + 10 },
  { id: 8, name: 'Hannah', avatarImageId: 'user-avatar-8', studyTime: 55 },
];


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
    </div>
  );
}
