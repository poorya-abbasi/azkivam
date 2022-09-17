import Azkivam from "../src/index";
import TestInfo from "./info";

describe("Ticket Creation", () => {
  const api_key = TestInfo.api_key;
  const merchant_id = TestInfo.merchant_id;

  test("Redirect url and fallback url must be specified at least once", () => {
    let azkivam = new Azkivam(merchant_id, api_key);
    expect(() =>
      azkivam.generateCreateBody({
        amount: 0,
        mobile_number: "",
        items: [],
      })
    ).toThrowError();
    expect(() =>
      azkivam.generateCreateBody({
        amount: 0,
        mobile_number: "",
        items: [],
        redirect_uri: "REDIRECT",
        fallback_uri: "FALLBACK",
      })
    ).not.toThrowError();
    azkivam = new Azkivam(merchant_id, api_key, "REDIRECT", "FALLBACK");
    expect(() =>
      azkivam.generateCreateBody({
        amount: 0,
        mobile_number: "",
        items: [],
      })
    ).not.toThrowError();
  });

  test("The ticket creation payload must be generated and must be valid", () => {
    const azkivam = new Azkivam(merchant_id, api_key, "REDIRECT", "FALLBACK");
    const amount = 999;
    const mobile_number = "0000";
    const provider_id = 333;
    const items = [
      {
        name: "ProductOne",
        count: 2,
        amount: 300000,
        url: "ProductURL",
      },
    ];
    const body = azkivam.generateCreateBody({
      amount,
      mobile_number,
      items,
      provider_id,
    });
    expect(body.fallback_uri).toBe("FALLBACK");
    expect(body.redirect_uri).toBe("REDIRECT");
    expect(body.merchant_id).toBe(merchant_id);
    expect(body.amount).toBe(amount);
    expect(body.mobile_number).toBe(mobile_number);
    expect(body.provider_id).toBe(provider_id);
    expect(body.items.length).toBe(items.length);
    expect(body.items[0]).toBe(items[0]);
  });

  test("The provider id must be generated if not provided", () => {
    const azkivam = new Azkivam(merchant_id, api_key, "REDIRECT", "FALLBACK");
    const body = azkivam.generateCreateBody({
      amount: 999,
      mobile_number: "0000",
      items: [
        {
          name: "ProductOne",
          count: 2,
          amount: 300000,
          url: "ProductURL",
        },
      ],
    });
    expect(body.provider_id).toBeDefined();
  });

  test("Calling create ticket API must result in 502 because api key is invalid", async () => {
    const azkivam = new Azkivam(merchant_id, api_key, "REDIRECT", "FALLBACK");
    const response = await azkivam
      .createTicket({
        amount: 999,
        mobile_number: "0000",
        items: [
          {
            name: "ProductOne",
            count: 2,
            amount: 300000,
            url: "ProductURL",
          },
        ],
      })
      .catch((err) => err.code);
    expect(response).toBe(502);
  });
});
