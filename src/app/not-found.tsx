import Image from 'next/image';
import Link from 'next/link';
import { NotFoundContent } from '@/components/business/not-found-content';

export default function NotFound() {
  return (
    <div className="bg-canvas min-h-screen">
      <header className="border-line bg-surface border-b">
        <div className="mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image src="/Whatsnew.ng.png" alt="Whatsnew.ng" width={72} height={48} className="h-12 w-auto" priority />
          </Link>
        </div>
      </header>
      <NotFoundContent standalone />
    </div>
  );
}
