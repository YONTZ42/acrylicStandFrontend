import { cn } from "@/shared/utils/cn";
import { useGalleriesList } from "@/features/galleries/hooks";
import { CreateGalleryButton, GalleryGrid } from "@/features/galleries/components";
import { useToast } from "@/app/providers/ToastProvider";

type Props = {
  selectedGalleryId?: string | null;
  onSelectGalleryId?: ( id: string) => void;
  className?: string;
};

export function GalleryLibraryTab(props: Props) {
  const toast = useToast();
  const q = useGalleriesList();
  return (
    <div className={cn("space-y-4", props.className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-semibold text-white">Galleries</div>
          <div className="mt-0.5 text-sm text-white/60">
            {q.isLoading
              ? "Loading..."
              : q.isError
              ? "Failed to load"
              : `${q.data?.length ?? 0} galleries`}
          </div>
        </div>

        <CreateGalleryButton
          onCreated={(id) => {
            toast.success("Gallery created", { title: "Success" });
            props.onSelectGalleryId?.(id);
          }}
        />
      </div>

      {q.isError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          Failed to fetch galleries.
        </div>
      ) : null}

        <GalleryGrid
        galleries={q.data ?? []}
        onOpen={(id) => props.onSelectGalleryId?.(id)}
        emptyTitle="No galleries yet"
        emptyMessage="Create a gallery to start exhibiting."
        />


      {/* 選択中の表示（デバッグ/仮） */}
      {props.selectedGalleryId ? (
        <div className="text-xs text-white/50">
          selected: <span className="font-mono">{props.selectedGalleryId}</span>
        </div>
      ) : null}
    </div>
  );
}
