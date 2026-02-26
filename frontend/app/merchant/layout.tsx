import { MerchantNav } from '../../components/MerchantNav';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen w-full">
        <MerchantNav />
        <main className="flex-1">
          <div className="w-full px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
