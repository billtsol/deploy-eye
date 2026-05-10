export function readTokenList(name: string): string[] {
  const rawValue = process.env[name];

  if (!rawValue) {
    return [];
  }

  const normalized = rawValue.trim();

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    try {
      const parsed = JSON.parse(normalized) as unknown;
      if (Array.isArray(parsed)) {
        return uniqueTokens(parsed.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      return [];
    }
  }

  return uniqueTokens(
    normalized
      .replace(/\\n/g, "\n")
      .split(/[\s,;]+/)
      .map((token) => token.trim())
      .filter(Boolean),
  );
}

export function tokenLabel(token: string, index: number): string {
  const suffix = token.slice(-4);
  return `Token ${index + 1} · ...${suffix}`;
}

export function accountId(platform: string, token: string, index: number): string {
  return `${platform}-${index}-${token.slice(-8)}`;
}

function uniqueTokens(tokens: string[]): string[] {
  return Array.from(new Set(tokens));
}
