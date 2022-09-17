import { getTimestamp } from "./shared";
import CryptoJS from "crypto-js";

class Azkivam {
  private merchand_id: string;
  private api_key: string;
  private redirect_uri: string | undefined;
  private fallback_uri: string | undefined;

  constructor(
    merchant_id: string,
    api_key: string,
    redirect_uri?: string,
    fallback_uri?: string
  ) {
    this.merchand_id = merchant_id;
    this.api_key = api_key;
    if (redirect_uri) this.redirect_uri = redirect_uri;
    if (fallback_uri) this.fallback_uri = fallback_uri;
  }

  generateSignature = (subUrl: string, requestMethod: RequestMethod) => {
    const api_key = this.api_key;
    const timestamp = getTimestamp();
    const plainSignature = `${subUrl}#${timestamp}#${requestMethod}#${api_key}`;
    const signature = CryptoJS.AES.encrypt(plainSignature, api_key, {
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    return signature;
  };
}

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export default Azkivam;
