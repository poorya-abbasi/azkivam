import { getTimestamp } from "./shared";
import CryptoJS from "crypto-js";
import TargetNotFoundError from "./errors/TargetNotFoundError";

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

  generateCreateBody(payload: CreateDTO) {
    if (payload.fallback_uri) this.fallback_uri = payload.fallback_uri;
    if (payload.redirect_uri) this.redirect_uri = payload.redirect_uri;
    if (!this.fallback_uri || !this.redirect_uri)
      throw new TargetNotFoundError();

    const requestBody = {
      fallback_uri: this.fallback_uri,
      redirect_uri: this.redirect_uri,
      merchand_id: this.merchand_id,
      amount: payload.amount,
      mobile_number: payload.mobile_number,
      items: payload.items,
      provider_id: 0,
    };

    if (payload.provider_id) {
      requestBody.provider_id = payload.provider_id;
    } else {
      const generatedProviderId = Math.floor(
        Math.floor(100000 + Math.random() * 900000)
      );
      requestBody.provider_id = generatedProviderId;
    }
    return requestBody;
  }
}

//Types
type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

type Items = {
  name: string;
  count: number;
  amount: number;
  url: string;
};

type CreateDTO = {
  amount: number;
  mobile_number: string;
  items: Array<Items>;
  provider_id?: number;
  redirect_uri?: string;
  fallback_uri?: string;
};

type CreateResponse = {
  provider_id: number;
  rsCode: number;
  payment_uri: string;
  ticket_id: string;
};

export default Azkivam;
