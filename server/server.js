const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { initializeDb } = require('./db');
const userService = require('./userService');

const PROTO_PATH = path.join(__dirname, '../proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

async function main() {
  await initializeDb();
  
  const server = new grpc.Server();
  server.addService(userProto.UserService.service, {
    createUser: userService.createUser,
    getUser: userService.getUser,
    updateUser: userService.updateUser,
    deleteUser: userService.deleteUser,
    listUsers: userService.listUsers
  });

  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Server running on port ${port}`);
    }
  );
}

main();