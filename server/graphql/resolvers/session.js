const { Session } = require("../../models/Session");
const { SessionSeat } = require("../../models/SessionSeat");
const { Ticket } = require("../../models/Ticket");
const { Movie } = require("../../models/Movie");
const { Hall } = require("../../models/Hall");
const User = require("../../models/User");
const { UserInputError } = require("apollo-server");
const { validateCreateSessionInput } = require("../../utils/validators");

module.exports = {
  Query: {
    async getAllSessions() {
      try {
        const sessions = await Session.find();
        return sessions;
      } catch (e) {
        throw new Error(e);
      }
    },
    async getUserSessions(_, { userId }) {
      try {
        const sessions = await Session.find({ userId });
        return sessions;
      } catch (e) {
        throw new Error(e);
      }
    },
    async getSessionsByMovieId(_, { movieId }) {
      try {
        const movie = await Movie.findById(movieId);
        const sessions = await Session.find({ movie });
        return sessions;
      } catch (e) {
        throw new Error(e);
      }
    },
    async getSession(_, { id }) {
      try {
        const session = await Session.findById(id);
        if (!session) {
          throw new Error("Session not found");
        }
        return session;
      } catch (e) {
        throw new Error(e);
      }
    },
  },
  Mutation: {
    async createSession(
      _,
      { data: { movieId, hallId, datetime } },
      context
    ) {
      const { valid, errors } = await validateCreateSessionInput(
        movieId,
        hallId,
        datetime
      );
      if (!valid) {
        throw new UserInputError("Errors", {
          errors,
        });
      }
      const movie = await Movie.findById(movieId);
      const hall = await Hall.findById(hallId);

      const newSession = new Session({
        movie: movie,
        hall: hall,
        datetime,
      });

      const session = await newSession.save();
      return {
        ...session._doc,
        id: session.id,
      };
    },
    async deleteSession(_, { id }, context) {
      try {
        const session = await Session.findById(id);
        if (!session) {
          throw new Error("Session not found");
        }

        const tickets = await Ticket.find();
        tickets
          ?.filter((ticket) => ticket?.session?.id == session?.id)
          ?.map(async (ticket) => {
            const user = await User.findById(ticket?.userId);
            const newTickets = user?.tickets?.filter((id) => id !== ticket?.id);
            await User.findByIdAndUpdate(user.id, { tickets: newTickets });
            await ticket?.delete();
          });

        session?.seats?.map(async (seat) => {
          const theSeat = await SessionSeat.findById(seat?.id);
          await theSeat?.delete();
        });

        await session.delete();

        return "Session deleted successfully";
      } catch (e) {
        throw new Error(e);
      }
    },
    async updateSession(
      _,
      { data: { id, movieId, hallId, date, startTime, endTime } },
      context
    ) {
      try {
        const session = await Session.findById(id);
        if (!session) {
          throw new Error("Session not found");
        }

        const { valid, errors } = await validateCreateSessionInput(
          movieId,
          hallId,
          date,
          startTime,
          endTime
        );
        if (!valid) {
          throw new UserInputError("Errors", {
            errors,
          });
        }

        const movie = await Movie.findById(movieId);
        const hall = await Hall.findById(hallId);

        const updateSessionInput = {
          movie,
          hall,
          date,
          startTime,
          endTime,
        };
        const updatedSession = await Session.findByIdAndUpdate(
          id,
          updateSessionInput,
          {
            new: true,
          }
        );

        const tickets = await Ticket.find();
        tickets
          ?.filter((ticket) => ticket?.session?.id == updatedSession?.id)
          ?.map(async (ticket) => {
            const newTicket = { ...ticket, session: updatedSession };
            await Ticket.findByIdAndUpdate(newTicket?.id, newTicket);
          });

        return updatedSession;
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};
