import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { CreateGalleryModal } from "./CreateGalleryModal";

type Props = {
  onCreated?: (galleryId: string) => void;
  className?: string;
  defaultTitle?: string;
};

export function CreateGalleryButton(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "rounded-full bg-brand-primary px-6 py-2.5 text-sm font-extrabold text-white shadow-md shadow-brand-primary/20",
          "hover:bg-brand-primary-hover active:scale-95 transition-all",
          "focus:outline-none focus:ring-4 focus:ring-brand-primary-soft",
          props.className
        )}
        onClick={() => setOpen(true)}
      >
        + Create
      </button>

      <CreateGalleryModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={props.onCreated}
        defaultTitle={props.defaultTitle}
      />
    </>
  );
}