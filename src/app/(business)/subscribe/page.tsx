'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscribePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage newsletter section
    router.replace('/#newsletter');
  }, [router]);

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <p className="text-muted">Redirecting to newsletter signup...</p>
    </div>
  );
}
