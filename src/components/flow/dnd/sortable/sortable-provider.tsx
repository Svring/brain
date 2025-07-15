import { SortableContext } from "@dnd-kit/sortable";

export default function SortableProvider({
  children,
  items,
}: {
  children: React.ReactNode;
  items: string[];
}) {
  return <SortableContext items={items}>{children}</SortableContext>;
}
