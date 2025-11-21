const axios = require("axios");
const { randomUUID } = require("crypto");

// Create axios instance with connection pooling
const sfmcAxios = axios.create({
  timeout: 10000, // 10 second timeout
  maxRedirects: 0,
  // Keep connections alive for better performance
  headers: {
    Connection: "keep-alive",
  },
});

class SFMCService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await sfmcAxios.post(
        `https://${process.env.ET_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`,
        {
          grant_type: "client_credentials",
          client_id: process.env.ET_CLIENT_ID,
          client_secret: process.env.ET_CLIENT_SECRET,
          account_id: process.env.ET_MID,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(
        Date.now() + (response.data.expires_in - 60) * 1000
      );

      return this.accessToken;
    } catch (error) {
      console.error("SFMC Authentication Error:", error.message);
      throw error;
    }
  }

  async sendMail(email, subject, content) {
    try {
      const accessToken = await this.authenticate();
      const guid = randomUUID();
      const subKey = randomUUID();

      const payload = {
        definitionKey: "Vikasa",
        recipient: {
          contactKey: subKey,
          to: email,
          attributes: {
            SubscriberKey: subKey,
            EmailAddress: email,
            Subject: subject,
            Content: content,
          },
        },
      };

      const response = await sfmcAxios.post(
        `https://${process.env.ET_SUBDOMAIN}.rest.marketingcloudapis.com/messaging/v1/email/messages/${guid}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`Email sent to ${email} via SFMC`);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error(
          "SFMC Error:",
          error.response.data || error.message
        );
      } else {
        console.error("Error:", error.message);
      }
      throw error;
    }
  }
}

module.exports = {
  sendMail: async (email, subject, content) => {
    const sfmcService = new SFMCService();
    return await sfmcService.sendMail(email, subject, content);
  },
};
