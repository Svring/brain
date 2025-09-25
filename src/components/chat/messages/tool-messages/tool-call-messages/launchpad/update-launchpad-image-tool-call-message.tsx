interface UpdateLaunchpadImageToolCallMessageProps {
  launchpad_name: string;
  image: string;
}

export function UpdateLaunchpadImageToolCallMessage({ launchpad_name, image }: UpdateLaunchpadImageToolCallMessageProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Launchpad:</span>
          <span className="text-sm text-foreground font-mono">{launchpad_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Image:</span>
          <span className="text-sm text-foreground font-mono">{image}</span>
        </div>
      </div>
    </div>
  );
}
