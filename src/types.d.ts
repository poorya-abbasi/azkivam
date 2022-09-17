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

type CancelResponse = {
  rsCode: number;
  fallback_uri: string;
};

type ReserveResponse = {
  rsCode: number;
  ticket_id: string;
  alreadyReserved: boolean;
};

type VerifyResponse = {
  rsCode: number;
  ticket_id: string;
  status: number;
};

type StatusResponse = {
  rsCode: number;
  ticket_id: string;
  status: number;
};

type AzkivamError = {
  code: number;
  message: string;
};
