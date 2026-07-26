import { describe, expect, it } from "vitest";
import { resolveGoogleCredentialSource } from "./credentials";

describe("resolveGoogleCredentialSource", () => {
  it("treats a local file path as a file source", () => {
    const result = resolveGoogleCredentialSource("./credentials/google-service-account.json");
    expect(result).toEqual({ type: "file", path: "./credentials/google-service-account.json" });
  });

  it("trims incidental whitespace/newlines around a file path", () => {
    const result = resolveGoogleCredentialSource("  ./credentials/google-service-account.json\n");
    expect(result).toEqual({ type: "file", path: "./credentials/google-service-account.json" });
  });

  it("treats a raw JSON credentials blob as a json source", () => {
    const raw = JSON.stringify({
      client_email: "mirora-dashboard@example.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----\n",
      project_id: "example-project",
    });

    const result = resolveGoogleCredentialSource(raw);

    expect(result).toEqual({
      type: "json",
      credentials: {
        client_email: "mirora-dashboard@example.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----\n",
      },
    });
  });

  it("trims incidental whitespace/newlines around raw JSON", () => {
    const raw = `\n  ${JSON.stringify({
      client_email: "a@example.iam.gserviceaccount.com",
      private_key: "key",
    })}  \n`;

    const result = resolveGoogleCredentialSource(raw);

    expect(result).toEqual({
      type: "json",
      credentials: { client_email: "a@example.iam.gserviceaccount.com", private_key: "key" },
    });
  });

  it("throws a clear error for malformed JSON that starts with '{'", () => {
    expect(() => resolveGoogleCredentialSource("{ this is not valid json")).toThrow(/not valid JSON/);
  });

  it("throws a clear error when required fields are missing from otherwise-valid JSON", () => {
    expect(() => resolveGoogleCredentialSource(JSON.stringify({ project_id: "example-project" }))).toThrow(
      /missing required fields/
    );
  });

  it("throws when client_email is present but private_key is missing", () => {
    expect(() =>
      resolveGoogleCredentialSource(JSON.stringify({ client_email: "a@example.iam.gserviceaccount.com" }))
    ).toThrow(/missing required fields/);
  });
});
