import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { useGalleriesList } from "@/features/galleries/hooks";
import { CreateGalleryButton, GalleryGrid } from "@/features/galleries/components";
import { useToast } from "@/app/providers/ToastProvider";

export function GalleriesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const q = useGalleriesList();

  const handleOpenGallery = (id: string) => {
    navigate(`/app/galleries/${id}`);
  };

  return (
    <div className={cn("space-y-6 p-4 sm:p-8 max-w-6xl mx-auto min-h-full bg-brand-bg")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-brand-surface p-6 rounded-3xl border border-brand-border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Galleries</h1>
          <p className="mt-1 text-sm font-medium text-brand-text-muted">
            {q.isLoading
              ? "Loading..."
              : q.isError
              ? "Failed to load"
              : `${q.data?.length ?? 0} galleries`}
          </p>
        </div>

        <CreateGalleryButton
          onCreated={(id) => {
            toast.success("Gallery created", { title: "Success" });
            handleOpenGallery(id);
          }}
        />
      </div>

      {q.isError ? (
        <div className="rounded-2xl border border-brand-secondary/30 bg-brand-secondary/10 p-4 text-sm font-bold text-brand-secondary">
          Failed to fetch galleries.
        </div>
      ) : null}

      <GalleryGrid
        galleries={q.data ??[]}
        onOpen={handleOpenGallery}
        emptyTitle="No galleries yet"
        emptyMessage="Create a gallery to start exhibiting."
      />
    </div>
  );
}