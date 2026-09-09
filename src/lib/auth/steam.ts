const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const CLAIMED_ID_PATTERN = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

/** Builds the URL that starts the Steam OpenID 2.0 login handshake. */
export function buildSteamLoginUrl(returnTo: string): string {
  const realm = new URL(returnTo).origin;
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

/**
 * Verifies a Steam OpenID callback against Steam itself (never trust the
 * claimed_id without this round-trip — anyone can forge the redirect
 * params otherwise) and returns the player's steamid64, or null.
 */
export async function verifySteamCallback(callbackParams: URLSearchParams): Promise<string | null> {
  const claimedId = callbackParams.get("openid.claimed_id");
  const mode = callbackParams.get("openid.mode");
  if (mode !== "id_res" || !claimedId) return null;

  const match = claimedId.match(CLAIMED_ID_PATTERN);
  if (!match) return null;

  const verificationParams = new URLSearchParams(callbackParams);
  verificationParams.set("openid.mode", "check_authentication");

  const response = await fetch(STEAM_OPENID_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verificationParams.toString(),
  });

  if (!response.ok) return null;

  const body = await response.text();
  const isValid = body.split("\n").some((line) => line.trim() === "is_valid:true");

  return isValid ? match[1] : null;
}

export interface SteamPlayerSummary {
  personaName: string;
  avatarUrl: string;
}

/** Optional: fetches persona name + avatar so the profile isn't blank on first login. */
export async function fetchSteamPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null> {
  const apiKey = process.env.STEAM_WEB_API_KEY;
  if (!apiKey) return null;

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const player = data?.response?.players?.[0];
    if (!player) return null;

    return { personaName: player.personaname as string, avatarUrl: player.avatarfull as string };
  } catch {
    return null;
  }
}
