const initSocket = (io) => {
  io.on('connection', (socket) => {
    // Cashier/admin joins dashboard room to receive all order events
    socket.on('join_dashboard', () => {
      socket.join('dashboard');
    });

    // Customer joins their table room to track their order status
    socket.on('join_table', ({ tableId }) => {
      if (tableId) socket.join(`table_${tableId}`);
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = initSocket;
