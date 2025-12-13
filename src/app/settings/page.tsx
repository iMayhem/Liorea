import { ProfileSettings } from '@/features/settings/components/ProfileSettings';
import Header from '@/components/layout/Header';

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <Header />
            <div className="flex-1 pt-[72px] relative z-0 overflow-hidden h-full">
                {/* Added pt to account for fixed header and z-0 for context */}
                <ProfileSettings
                // No onClose -> dedicated page mode
                />
            </div>
        </div>
    );
}
