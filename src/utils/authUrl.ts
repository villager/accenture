export interface AuthTokensFromUrl {
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
}

export function parseSupabaseUrlTokens(url: string): AuthTokensFromUrl {
  try {
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
      return { accessToken: null, refreshToken: null, type: null };
    }

    const fragment = url.substring(hashIndex + 1);
    const params = new URLSearchParams(fragment);

    return {
      accessToken: params.get("access_token"),
      refreshToken: params.get("refresh_token"),
      type: params.get("type"),
    };
  } catch {
    return { accessToken: null, refreshToken: null, type: null };
  }
}
