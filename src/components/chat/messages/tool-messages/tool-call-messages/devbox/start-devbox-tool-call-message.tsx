interface StartDevboxToolCallMessageProps {
  devbox_name: string;
}

export function StartDevboxToolCallMessage({
  devbox_name,
}: StartDevboxToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none">
            Devbox
          </span>
          <span className="text-lg font-bold text-foreground leading-tight">
            {devbox_name.length > 15 ? `${devbox_name.slice(0, 15)}...` : devbox_name}
          </span>
        </div>
      </div>
    </div>
  );
}
