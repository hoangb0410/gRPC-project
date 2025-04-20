const { pool } = require("./db");

function mapUserToProto(user) {
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
  };
}

class UserService {
  async createUser(call, callback) {
    try {
      const { name, email } = call.request;
      const result = await pool.query(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
        [name, email]
      );
      const user = result.rows[0];
      callback(null, { user: mapUserToProto(user) });
    } catch (err) {
      callback(err);
    }
  }

  async getUser(call, callback) {
    try {
      const { id } = call.request;
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return callback(new Error("User not found"));
      }
      const user = result.rows[0];
      callback(null, { user: mapUserToProto(user) });
    } catch (err) {
      callback(err);
    }
  }

  async updateUser(call, callback) {
    try {
      const { id, name, email } = call.request;
      const result = await pool.query(
        "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
        [name, email, id]
      );
      if (result.rows.length === 0) {
        return callback(new Error("User not found"));
      }
      const user = result.rows[0];
      callback(null, { user: mapUserToProto(user) });
    } catch (err) {
      callback(err);
    }
  }

  async deleteUser(call, callback) {
    try {
      const { id } = call.request;
      const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
      callback(null, { success: result.rowCount > 0 });
    } catch (err) {
      callback(err);
    }
  }

  async listUsers(call, callback) {
    try {
      const { page = 1, limit = 10 } = call.request;
      const offset = (page - 1) * limit;

      const usersResult = await pool.query(
        "SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2",
        [limit, offset]
      );

      const countResult = await pool.query("SELECT COUNT(*) FROM users");
      const total = parseInt(countResult.rows[0].count, 10);

      const users = usersResult.rows.map(mapUserToProto); // ✅ now safe

      callback(null, {
        users,
        total,
        page,
        limit,
      });
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = new UserService();
