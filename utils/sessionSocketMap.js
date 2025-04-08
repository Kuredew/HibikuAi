const sessionSocketMap = new Map()


module.exports = {
    set: (sessionId, socketId) => sessionSocketMap.set(sessionId, socketId),
    get: (sessionId) => sessionSocketMap.get(sessionId),
    del: (sessionId) => sessionSocketMap.delete(sessionId),
    has: (sessionId) => sessionSocketMap.has(sessionId)
  };