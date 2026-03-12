import  { useState } from "react";
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
          "rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white",
          "hover:bg-white/15 active:scale-[0.99]",
          "focus:outline-none focus:ring-2 focus:ring-sky-400/50",
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
