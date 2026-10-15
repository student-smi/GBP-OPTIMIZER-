import { describe, it, expect } from "vitest";
import { validatePublicWebsiteUrl } from "../lib/security/ssrf-guard";

describe("SSRF Protection Guard", () => {
  it("approves legitimate public websites with HTTP or HTTPS", () => {
    const validUrls = [
      "https://example.com",
      "https://www.google.com/search",
      "http://localbusiness.org",
      "https://austin-dentist.net/services",
    ];

    for (const url of validUrls) {
      const result = validatePublicWebsiteUrl(url);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBeDefined();
    }
  });

  it("blocks localhost, loopback, and private IPv4 ranges", () => {
    const dangerousUrls = [
      "http://localhost:3000",
      "http://127.0.0.1",
      "http://127.0.0.1:8080",
      "http://0.0.0.0",
      "http://10.0.0.1/admin",
      "https://192.168.1.1/router",
      "http://172.16.0.5",
      "http://169.254.169.254/latest/meta-data/", // AWS metadata
    ];

    for (const url of dangerousUrls) {
      const result = validatePublicWebsiteUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    }
  });

  it("blocks dangerous schemes, credentials, and non-standard ports", () => {
    const invalidProtocols = [
      "ftp://example.com/file.txt",
      "file:///etc/passwd",
      "gopher://example.com",
      "javascript:alert(1)",
      "https://user:pass@example.com", // Embedded credentials
      "https://example.com:8443", // Non-standard port
    ];

    for (const url of invalidProtocols) {
      const result = validatePublicWebsiteUrl(url);
      expect(result.isValid).toBe(false);
    }
  });
});
