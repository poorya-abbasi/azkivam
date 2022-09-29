import CryptoJS from "crypto-js";
import TargetNotFoundError from "./errors/TargetNotFoundError";
import axios, { AxiosInstance } from "axios";
import RequestError from "./errors/RequestError";
import UnverifiableError from "./errors/UnverifiableError";

class Azkivam {
  private endpoint = "https://api.azkiloan.com";
  private merchant_id: string;
  private api_key: string;
  private redirect_uri: string | undefined;
  private fallback_uri: string | undefined;
  private instance: AxiosInstance;

  constructor(
    merchant_id: string,
    api_key: string,
    redirect_uri?: string,
    fallback_uri?: string
  ) {
    this.merchant_id = merchant_id;
    this.api_key = api_key;
    if (redirect_uri) this.redirect_uri = redirect_uri;
    if (fallback_uri) this.fallback_uri = fallback_uri;
    this.instance = axios.create({
      baseURL: this.endpoint,
    });
    this.instance.defaults.headers.common.MerchantId = this.merchant_id;
  }

  generateProviderId = () =>
    Math.floor(Math.floor(100000 + Math.random() * 900000));

  generateSignature = (subUrl: string, requestMethod: RequestMethod) => {
    const api_key = this.api_key;
    const plainSignature = `${subUrl}##${requestMethod}#${api_key}`;
    const generatedSignature = CryptoJS.AES.encrypt(
      plainSignature,
      CryptoJS.enc.Hex.parse(api_key),
      {
        iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString();
    const signature = CryptoJS.enc.Hex.stringify(
      CryptoJS.enc.Base64.parse(generatedSignature.toString())
    );
    this.instance.defaults.headers.common.Signature = signature;
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
      merchant_id: this.merchant_id,
      amount: payload.amount,
      mobile_number: payload.mobile_number,
      items: payload.items,
      provider_id: 0,
    };

    if (payload.provider_id) {
      requestBody.provider_id = payload.provider_id;
    } else {
      const generatedProviderId = this.generateProviderId();
      requestBody.provider_id = generatedProviderId;
    }
    return requestBody;
  }

  createTicket = async (payload: CreateDTO): Promise<CreateResponse> => {
    const subURL = "/payment/purchase";
    this.generateSignature(subURL, "POST");
    const body = this.generateCreateBody(payload);
    console.log(this.instance.defaults.headers.common);
    const data = await this.instance
      .post(subURL, body)
      .then((res) => res.data)
      .catch((err) => {
        console.log(err.response.data);
        throw new RequestError(err.response.status);
      });
    return {
      rsCode: data.rsCode,
      provider_id: body.provider_id,
      payment_uri: data.result.payment_uri,
      ticket_id: data.result.ticket_id,
    };
  };

  cancelTicket = async (ticket_id: string): Promise<CancelResponse> => {
    const subURL = "/payment/cancel";
    this.generateSignature(subURL, "POST");
    const data = await this.instance
      .post(subURL, { ticketId: ticket_id })
      .then((res) => res.data)
      .catch((err) => {
        throw new RequestError(err.response.status);
      });
    return {
      rsCode: data.rsCode,
      fallback_uri: data.result.fallbackUri,
    };
  };

  reserveTicket = async (
    ticket_id: string,
    provider_id?: string
  ): Promise<ReserveResponse> => {
    const subURL = "/payment/reserve";
    this.generateSignature(subURL, "POST");
    const data = await this.instance
      .post(subURL, {
        ticket_id,
        provider_id: provider_id || this.generateProviderId(),
      })
      .then((res) => res.data)
      .catch((err) => {
        throw new RequestError(err.response.status);
      });
    return {
      rsCode: data.rsCode,
      ticket_id: data.result.ticket_id,
      alreadyReserved: data.result.rsCode === 16,
    };
  };

  verifyTicket = async (ticket_id: string): Promise<VerifyResponse> => {
    const subURL = "/payment/verify";
    this.generateSignature(subURL, "POST");
    const data = await this.instance
      .post(subURL, { ticket_id })
      .then((res) => res.data)
      .catch((err) => {
        throw new RequestError(err.response.status);
      });
    if (data.rsCode === 28) {
      throw new UnverifiableError();
    }
    return {
      rsCode: data.rsCode,
      ticket_id: data.result.ticket_id,
      status: data.result.status,
    };
  };

  getTicketStatus = async (ticket_id: string): Promise<StatusResponse> => {
    const subURL = "/payment/status";
    this.generateSignature(subURL, "POST");
    const data = await this.instance
      .post(subURL, { ticket_id })
      .then((res) => res.data)
      .catch((err) => {
        throw new RequestError(err.response.status);
      });
    return {
      rsCode: data.rsCode,
      ticket_id: data.result.ticket_id,
      status: data.result.status,
    };
  };
}

export default Azkivam;
