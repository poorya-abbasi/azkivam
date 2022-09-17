class TargetNotFoundError {
  constructor() {
    return {
      code: 1,
      message:
        "RedirectURI and FallbackURI needs to be specified at least once",
    } as AzkivamError;
  }
}

export default TargetNotFoundError;
