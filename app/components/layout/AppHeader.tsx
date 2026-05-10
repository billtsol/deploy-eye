import { RefreshButton } from "../actions/RefreshButton";
import { PrivacyToggle } from "../theme/PrivacyToggle";
import { ThemeToggle } from "../theme/ThemeToggle";

interface AppHeaderProps {
  generatedAt?: string;
}

export function AppHeader({ generatedAt }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <PrivacyToggle />
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">Deploy Eye</h1>
          <p className="text-sm text-muted">
            {generatedAt ? `Updated ${new Date(generatedAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}` : "Deployment monitor"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RefreshButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
