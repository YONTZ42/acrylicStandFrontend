import { SlotCard } from "./SlotCard";

type Props = {
  slots: Array<any | null>; // length=12
  selectedSlotIndex: number | null;
  onSelect: (slotIndex: number) => void;
};

export function SlotGrid({ slots, selectedSlotIndex, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {slots.map((exhibit, i) => (
        <SlotCard
          key={i}
          slotIndex={i}
          exhibit={exhibit}
          isSelected={selectedSlotIndex === i}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
