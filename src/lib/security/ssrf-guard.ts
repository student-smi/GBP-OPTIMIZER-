/**
 * Production SSRF Protection Guard
 * Validates URLs before server-side website inspection to prevent Server-Side Request Forgery,
 * private network access, cloud metadata leaks, and non-standard protocols.
 */

export interface SSRFValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "metadata.google.internal",
  "metadata.internal",
  "instance-data",
]);

/**
 * Checks whether an IPv4 address string falls into private or restricted ranges.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 10.0.0.0/8 (Private)
  if (a === 10) return true;
  // 172.16.0.0/12 (Private 172.16 - 172.31)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link-local / AWS / GCP Metadata)
  if (a === 169 && b === 254) return true;
  // 0.0.0.0/8
  if (a === 0) return true;
  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  return false;
}

/**
 * Validates a website URL against SSRF threats.
 */
export function validatePublicWebsiteUrl(inputUrl: string): SSRFValidationResult {
  if (!inputUrl || typeof inputUrl !== "string") {
    return { isValid: false, error: "Website URL must be a non-empty string" };
  }

  let parsed: URL;
  try {
    let normalized = inputUrl.trim();
    // If it has a scheme like ftp:, file:, javascript:, mailto:, don't prepend https://
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalized);
    if (!hasScheme) {
      normalized = "https://" + normalized;
    }
    parsed = new URL(normalized);
  } catch {
    return { isValid: false, error: "Invalid URL structure" };
  }

  // 1. Only allow HTTP and HTTPS
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isValid: false, error: "Only HTTP and HTTPS protocols are permitted" };
  }

  // 2. Reject credentials embedded in URL
  if (parsed.username || parsed.password) {
    return { isValid: false, error: "URLs with embedded authentication credentials are not permitted" };
  }

  // 3. Port restrictions: only allow standard 80, 443, or empty
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    return { isValid: false, error: `Non-standard port (${parsed.port}) is blocked for security` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 4. Block explicit dangerous hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { isValid: false, error: "Access to loopback or metadata endpoints is strictly prohibited" };
  }

  // 5. Block dangerous suffix patterns (.local, .internal, .onion, etc.)
  if (
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".corp") ||
    hostname.endsWith(".home")
  ) {
    return { isValid: false, error: "Access to private or internal domains is not allowed" };
  }

  // 6. Check if hostname is an IP literal
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { isValid: false, error: "Access to private IP ranges is prohibited" };
    }
  }

  // 7. Check IPv6 literal
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    const rawIpv6 = hostname.slice(1, -1).toLowerCase();
    if (rawIpv6 === "::1" || rawIpv6.startsWith("fe80:") || rawIpv6.startsWith("fc00:")) {
      return { isValid: false, error: "Access to local/private IPv6 addresses is prohibited" };
    }
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.origin + parsed.pathname,
  };
}
