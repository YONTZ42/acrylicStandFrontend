type Props = {
  title: string;
  description: string;
  onChange: (next: { title: string; description: string }) => void;
};

export function TitleDescriptionForm({ title, description, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">Title & Description</div>

      <input
        value={title}
        onChange={(e) => onChange({ title: e.target.value, description })}
        placeholder="Title"
        className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/35"
      />
      <textarea
        value={description}
        onChange={(e) => onChange({ title, description: e.target.value })}
        placeholder="Description"
        rows={3}
        className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/35"
      />
    </div>
  );
}
