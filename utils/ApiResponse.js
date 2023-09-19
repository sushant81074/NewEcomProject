class ApiResponse extends Response {
  constructor(statusCode, data, message = "success") {
    super();
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = { ApiResponse };
