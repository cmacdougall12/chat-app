import { Server, Socket } from "socket.io";
import logger from "./utils/logger";
import { nanoid } from "nanoid";

const EVENTS = {
  connection: "connection",
  CLIENT: {
    CREATE_ROOM: "CREATE_ROOM",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM: "JOIN_ROOM",
  },
  SERVER: {
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: " ROOM_MESSAGE",
  },
};

const rooms: Record<string, { name: string }> = {};

const socket = ({ io }: { io: Server }) => {
  logger.info("Sockets enabled");



  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`user connected ${socket.id}`);

    socket.emit(EVENTS.SERVER.ROOMS, rooms)

    // When a user creates a new room
    socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomName }) => {
      console.log(roomName);

      //create a roomId
      const roomId = nanoid();

      //add a new room to room object
      rooms[roomId] = {
        name: roomName,
      };

      socket.join(roomId);

      //broadcast an event saying there is a new room to every one but the user who created room (ie.broadcast.emit)
      socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

      //emit back to room creator with all the rooms
      socket.emit(EVENTS.SERVER.ROOMS, rooms);
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });

    // When a user sends a room a message
    socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, ({roomId, message, username}) => {
      const date = new Date();

      socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message,
        username,
        time: `${date.getHours()}:${date.getMinutes()}`,
      });
    });

    //When a user joins a room
    socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
      socket.join(roomId);
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });
  });
};

export default socket;
