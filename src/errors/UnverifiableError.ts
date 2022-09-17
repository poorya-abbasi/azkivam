class UnverifiableError {
  constructor() {
    return {
      code: 28,
      message: "Ticket status is not valid for verifying.",
    } as AzkivamError;
  }
}

export default UnverifiableError;
