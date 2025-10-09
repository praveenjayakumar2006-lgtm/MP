
import { Header } from '@/components/layout/header';
import { ProfileForm } from '@/components/account/profile-form';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8">
      <Header title="Account Settings" />
      <main className="px-4 md:px-6">
        <ProfileForm />
      </main>
    </div>
  );
}
