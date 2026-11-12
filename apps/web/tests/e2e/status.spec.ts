import { expect, test } from "@playwright/test";

test.use({ locale: "en-GB" });

test("renders sample data with sources, groups and filters", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  await page.goto("/?demo");
  await expect(page.locator("#headline")).toHaveText("Everything is up");
  await expect(page.locator(".src")).toHaveCount(3);
  await expect(page.locator(".svc")).toHaveCount(24);
  await expect(page.locator(".svc .tag")).toHaveCount(16);

  await page.locator('[data-act="filter"][data-filter="vpn"]').click();
  await expect(page.locator(".svc")).toHaveCount(16);
  await page.locator('[data-act="filter"][data-filter="public"]').click();
  await expect(page.locator(".svc")).toHaveCount(8);
  await page.locator('[data-act="filter"][data-filter="all"]').click();

  await page.getByRole("searchbox").fill("jellyfin");
  await expect(page.locator(".svc")).toHaveCount(1);
  await expect(page.locator(".svc .svc-host")).toHaveText(
    "jellyfin.kamilmarczak.pl",
  );
  await expect(
    page.locator(".svc .row.missing", { hasText: "OVH" }),
  ).toContainText("VPN only");
  expect(errors).toEqual([]);
});

test("shows an outage in the summary and on the affected card", async ({
  page,
}) => {
  await page.goto("/?demo=outage");
  await expect(page.locator("#summary")).toHaveClass(/st-down/);
  await expect(page.locator("#headline")).toHaveText("1 service is down");
  await expect(
    page.locator('.svc[data-id="sure.kamilmarczak.pl"]'),
  ).toHaveClass(/st-down/);
});

test("does not fall back to sample data without a configuration", async ({
  page,
}) => {
  await page.route("**/locations.json", async (route) =>
    route.fulfill({ status: 404 }),
  );
  await page.goto("/");
  await expect(page.locator("#headline")).toHaveText(
    "Could not load the configuration",
  );
  await expect(page.locator(".svc")).toHaveCount(0);
});
