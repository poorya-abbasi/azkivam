class RequestError {
  constructor(status: number) {
    return {
      code: status,
      message: "Request failed with status " + status,
    } as AzkivamError;
  }
}

export default RequestError;
