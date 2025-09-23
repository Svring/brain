import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnvVar {
  name: string;
  value: string;
}

interface UpdateLaunchpadEnvToolCallMessageProps {
  launchpad_name: string;
  env_vars: EnvVar[];
}

export function UpdateLaunchpadEnvToolCallMessage({ launchpad_name, env_vars }: UpdateLaunchpadEnvToolCallMessageProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="text-xs">
            Tool Call
          </Badge>
          <span className="font-mono text-sm">update_launchpad_env</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  launchpad_name:
                </span>
              </div>
              <div className="mt-1">
                <pre className="text-sm text-foreground whitespace-pre-wrap break-words font-mono">
                  {launchpad_name}
                </pre>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  env_vars:
                </span>
              </div>
              <div className="mt-1">
                <pre className="text-sm text-foreground whitespace-pre-wrap break-words font-mono">
                  {JSON.stringify(env_vars, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
