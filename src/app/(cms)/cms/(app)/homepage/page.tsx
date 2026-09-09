export default function HomepageCurationPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Homepage curation</h1>
      <p className="text-muted mt-2 text-sm">
        Shelves per city (or global “Everywhere”). Each shelf is MANUAL (pinned items, drag to
        reorder) or AUTO_RECENT / AUTO_POPULAR / AUTO_TRENDING. Backed by{' '}
        <code>PUT /api/v1/homepage/shelves</code> and{' '}
        <code>POST /api/v1/homepage/shelves/:id/slots</code>. Drag-and-drop UI: TODO.
      </p>
    </div>
  );
}
