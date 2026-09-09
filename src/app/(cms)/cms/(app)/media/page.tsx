export default function MediaPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Media library</h1>
      <p className="text-muted mt-2 text-sm">
        Uploads go direct to the bucket via a presigned URL from{' '}
        <code>POST /api/v1/media/presign</code>, then <code>POST /api/v1/media/confirm</code>{' '}
        records them here. Grid + uploader: TODO.
      </p>
    </div>
  );
}
