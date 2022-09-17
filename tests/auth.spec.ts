import Azkivam from "../src/index";
import { getTimestamp } from "../src/shared";
import CryptoJS from "crypto-js";
import TestInfo from "./info";

describe("Authentication And Signature Generation", () => {
  const api_key = TestInfo.api_key;
  const merchand_id = TestInfo.merchant_id;

  test("Signature is generated and is valid", () => {
    const subUrl = "/payment/create";
    const requestMethod = "POST";
    const timestamp = getTimestamp();
    const expectedPlainSignature = `${subUrl}#${timestamp}#${requestMethod}#${api_key}`;
    const azkivam = new Azkivam(merchand_id, api_key);
    const signature = azkivam.generateSignature(subUrl, requestMethod);
    const decrypted = CryptoJS.AES.decrypt(signature, api_key, {
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    expect(decrypted).toBe(expectedPlainSignature);
  });
});
