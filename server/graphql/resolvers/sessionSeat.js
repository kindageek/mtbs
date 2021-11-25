const SessionSeat = require("../../models/SessionSeat");
const { UserInputError } = require("apollo-server");
const { validateCreateSessionSeatInput } = require("../../utils/validators");

module.exports = {
  Query: {
    async getSessionSeat() {
      try {
        const sessionSeats = await SessionSeat.find()?.sort({ createdAt: -1 });
        return sessionSeats;
      } catch (e) {
        throw new Error(e);
      }
    },
    async getSessionSeat(_, { sessionSeatId }) {
      try {
        const sessionSeat = await SessionSeat.findById(sessionSeatId);
        if (!sessionSeat) {
          throw new Error("Session seat not found");
        }
        return sessionSeat;
      } catch (e) {
        throw new Error(e);
      }
    },
  },
  Mutation: {
    async createSessionSeat(
      _,
      { seatId, sessionId, ticketId, type, status, price },
      context
    ) {
      const { valid, errors } = validateCreateSessionSeatInput(
        seatId,
        sessionId,
        ticketId,
        type,
        status,
        price
      );
      if (!valid) {
        throw new UserInputError("Errors", {
          errors,
        });
      }
      const newSessionSeat = new SessionSeat({
        seatId,
        sessionId,
        ticketId,
        type,
        status,
        price,
        createdAt: new Date().toISOString(),
      });

      const sessionSeat = await newSessionSeat.save();

      return sessionSeat;
    },
    async deleteSessionSeat(_, { sessionSeatId }, context) {
      try {
        const sessionSeat = await SessionSeat.findById(sessionSeatId);
        if (!sessionSeat) {
          throw new Error("Session seat not found");
        }
        await sessionSeat.delete();
        return "Session seat deleted successfully";
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};
