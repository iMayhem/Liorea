import { Dashboard } from "@/components/dashboard";
import { timetableData, user1ProgressData, user2ProgressData } from "@/lib/data";

export default function Home() {
  return (
    <Dashboard
      timetable={timetableData}
      user1Progress={user1ProgressData}
      user2Progress={user2ProgressData}
    />
  );
}
